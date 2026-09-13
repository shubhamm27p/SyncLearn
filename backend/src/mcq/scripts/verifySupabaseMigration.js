const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { supabaseAdmin } = require('../config/supabase');
const User = require('../models/User');
const Test = require('../models/Test');
const Question = require('../models/Question');
const AnswerKey = require('../models/AnswerKey');
const Result = require('../models/Result');
const CodingProblem = require('../models/CodingProblem');
const CodingSubmission = require('../models/CodingSubmission');
const Violation = require('../models/Violation');
const OTP = require('../models/OTP');

const tables = [
  ['users', User, null],
  ['mcq_tests', Test, 'legacy_mongo_id'],
  ['mcq_questions', Question, 'legacy_mongo_id'],
  ['mcq_answer_keys', AnswerKey, 'legacy_mongo_id'],
  ['mcq_results', Result, 'legacy_mongo_id'],
  ['coding_problems', CodingProblem, 'legacy_mongo_id'],
  ['coding_submissions', CodingSubmission, 'legacy_mongo_id'],
  ['violations', Violation, 'legacy_mongo_id'],
  ['otps', OTP, 'legacy_mongo_id'],
];

const countSupabase = async (table) => {
  const { count, error } = await supabaseAdmin
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  return count || 0;
};

const getSupabaseLegacyIds = async (table) => {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('legacy_mongo_id')
    .not('legacy_mongo_id', 'is', null);
  if (error) throw new Error(`${table}: ${error.message}`);
  return new Set((data || []).map((row) => row.legacy_mongo_id));
};

const verify = async () => {
  await connectDB();
  const report = [];
  let failed = false;

  for (const [table, model, legacyColumn] of tables) {
    const mongoCount = await model.countDocuments();
    const supabaseCount = await countSupabase(table);
    const difference = supabaseCount - mongoCount;
    let missingLegacyIds = [];
    if (legacyColumn) {
      const mongoIds = new Set((await model.find().select('_id').lean()).map((row) => row._id.toString()));
      const supabaseIds = await getSupabaseLegacyIds(table);
      missingLegacyIds = [...mongoIds].filter((id) => !supabaseIds.has(id));
    }
    const pass = table === 'users'
      ? supabaseCount >= mongoCount
      : difference === 0 && missingLegacyIds.length === 0;
    report.push({ table, mongoCount, supabaseCount, difference, missingLegacyIds: missingLegacyIds.slice(0, 20), pass });
    if (!pass) failed = true;
  }

  console.log(JSON.stringify({ pass: !failed, report }, null, 2));
  await mongoose.disconnect();
  if (failed) process.exitCode = 1;
};

verify().catch(async (error) => {
  console.error(error.stack || error.message);
  try { await mongoose.disconnect(); } catch {}
  process.exitCode = 1;
});
