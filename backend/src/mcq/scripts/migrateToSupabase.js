const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

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
const SiteSetting = require('../models/SiteSetting');

const counters = {};
const skipped = [];

const idOf = (value) => (value ? value.toString() : null);

const insertOne = async (table, payload, conflict = 'legacy_mongo_id') => {
  const { data, error } = await supabaseAdmin
    .from(table)
    .upsert(payload, { onConflict: conflict })
    .select('id')
    .single();
  if (error) throw new Error(`${table}: ${error.message}`);
  counters[table] = (counters[table] || 0) + 1;
  return data.id;
};

const insertMany = async (table, rows) => {
  if (!rows.length) return;
  const { error } = await supabaseAdmin.from(table).upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`${table}: ${error.message}`);
  counters[table] = (counters[table] || 0) + rows.length;
};

const requireMapping = (map, legacyId, type) => {
  const mapped = map.get(idOf(legacyId));
  if (!mapped) {
    skipped.push({ type, legacyId: idOf(legacyId), reason: 'No Supabase user/test mapping' });
  }
  return mapped || null;
};

const migrate = async () => {
  await connectDB();

  const [mongoUsers, mongoTests, mongoQuestions, mongoAnswerKeys, mongoResults, mongoProblems, mongoSubmissions, mongoViolations, mongoOtps, mongoSettings] = await Promise.all([
    User.find().lean(),
    Test.find().lean(),
    Question.find().lean(),
    AnswerKey.find().lean(),
    Result.find().lean(),
    CodingProblem.find().lean(),
    CodingSubmission.find().lean(),
    Violation.find().lean(),
    OTP.find().lean(),
    SiteSetting.find().lean(),
  ]);

  const mongoUserToSupabase = new Map();
  for (const user of mongoUsers) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();
    if (error) throw new Error(`users lookup: ${error.message}`);
    if (data) mongoUserToSupabase.set(idOf(user._id), data.id);
    else skipped.push({ type: 'user', legacyId: idOf(user._id), reason: `No Supabase user for ${user.email}` });
  }

  const mongoTestToSupabase = new Map();
  for (const test of mongoTests) {
    const createdBy = requireMapping(mongoUserToSupabase, test.createdBy, 'test');
    const testId = await insertOne('mcq_tests', {
      legacy_mongo_id: idOf(test._id),
      created_by: createdBy,
      title: test.title,
      description: test.description || '',
      subject: test.subject || 'General',
      test_type: test.testType || 'mcq',
      coding_marks: test.codingMarks || 0,
      total_marks: test.totalMarks || 0,
      passing_marks: test.passingMarks || 0,
      duration: test.duration,
      start_time: test.startTime || null,
      end_time: test.endTime || null,
      max_attempts: test.maxAttempts || 1,
      negative_marking: Boolean(test.negativeMarking),
      marks_per_question: test.marksPerQuestion || 1,
      negative_marks: test.negativeMarks || 0.25,
      passing_percentage: test.passingPercentage || 40,
      status: test.status || 'draft',
      access_code: test.accessCode || '',
      settings: test.settings || {},
      tags: test.tags || [],
      created_at: test.createdAt || new Date(),
      updated_at: test.updatedAt || new Date(),
    });
    mongoTestToSupabase.set(idOf(test._id), testId);
  }

  for (const question of mongoQuestions) {
    const testId = requireMapping(mongoTestToSupabase, question.testId, 'question');
    if (!testId) continue;
    await insertOne('mcq_questions', {
      legacy_mongo_id: idOf(question._id),
      test_id: testId,
      question_no: question.questionNo,
      question_text: question.questionText,
      option_a: question.optionA,
      option_b: question.optionB,
      option_c: question.optionC,
      option_d: question.optionD,
      option_e: question.optionE || '',
      marks: question.marks || 1,
      created_at: question.createdAt || new Date(),
      updated_at: question.updatedAt || new Date(),
    });
  }

  for (const answerKey of mongoAnswerKeys) {
    const testId = requireMapping(mongoTestToSupabase, answerKey.testId, 'answer_key');
    if (!testId) continue;
    const answerKeyId = await insertOne('mcq_answer_keys', {
      legacy_mongo_id: idOf(answerKey._id),
      test_id: testId,
      created_at: answerKey.createdAt || new Date(),
      updated_at: answerKey.updatedAt || new Date(),
    });
    await insertMany('mcq_answer_key_items', answerKey.answers.map((answer, index) => ({
      id: `${answerKeyId.slice(0, 8)}-${String(index + 1).padStart(4, '0')}-4000-8000-000000000000`,
      answer_key_id: answerKeyId,
      question_no: answer.questionNo,
      correct_option: answer.correctOption,
    })));
  }

  const mongoResultToSupabase = new Map();
  for (const result of mongoResults) {
    const testId = requireMapping(mongoTestToSupabase, result.testId, 'result');
    const studentId = requireMapping(mongoUserToSupabase, result.studentId, 'result');
    if (!testId || !studentId) continue;
    const resultId = await insertOne('mcq_results', {
      legacy_mongo_id: idOf(result._id),
      test_id: testId,
      student_id: studentId,
      score: result.score || 0,
      total_marks: result.totalMarks || 0,
      percentage: result.percentage || 0,
      correct_answers: result.correctAnswers || 0,
      incorrect_answers: result.incorrectAnswers || 0,
      unattempted: result.unattempted || 0,
      status: result.status || 'in-progress',
      auto_submitted: Boolean(result.autoSubmitted),
      started_at: result.startedAt || result.createdAt || new Date(),
      submitted_at: result.submittedAt || null,
      time_taken: result.timeTaken || 0,
      attempt_number: result.attemptNumber || 1,
      ip_address: result.ipAddress || null,
      feedback: result.feedback || '',
      violations: result.violations || [],
      created_at: result.createdAt || new Date(),
      updated_at: result.updatedAt || new Date(),
    });
    mongoResultToSupabase.set(idOf(result._id), resultId);
    await insertMany('mcq_result_answers', result.answers.map((answer, index) => ({
      id: `${resultId.slice(0, 8)}-${String(index + 1).padStart(4, '0')}-4000-8000-111111111111`,
      result_id: resultId,
      question_no: answer.questionNo,
      selected_option: answer.selectedOption || '',
    })));
  }

  const mongoProblemToSupabase = new Map();
  for (const problem of mongoProblems) {
    const testId = requireMapping(mongoTestToSupabase, problem.testId, 'coding_problem');
    if (!testId) continue;
    const problemId = await insertOne('coding_problems', {
      legacy_mongo_id: idOf(problem._id),
      test_id: testId,
      problem_no: problem.problemNo,
      title: problem.title,
      description: problem.description,
      input_format: problem.inputFormat || '',
      output_format: problem.outputFormat || '',
      constraints: problem.constraints || '',
      sample_input: problem.sampleInput || '',
      sample_output: problem.sampleOutput || '',
      total_marks: problem.totalMarks || 10,
      time_limit_ms: problem.timeLimitMs || 2000,
      memory_limit_kb: problem.memoryLimitKb || 262144,
      allowed_languages: problem.allowedLanguages || ['c', 'python', 'java'],
      difficulty: problem.difficulty || 'medium',
      created_at: problem.createdAt || new Date(),
      updated_at: problem.updatedAt || new Date(),
    });
    mongoProblemToSupabase.set(idOf(problem._id), problemId);
    await insertMany('coding_test_cases', problem.testCases.map((testCase, index) => ({
      id: `${problemId.slice(0, 8)}-${String(index + 1).padStart(4, '0')}-4000-8000-222222222222`,
      problem_id: problemId,
      case_no: index,
      input: testCase.input || '',
      expected_output: testCase.expectedOutput || '',
      is_hidden: Boolean(testCase.isHidden),
      points: testCase.points || 1,
    })));
  }

  for (const submission of mongoSubmissions) {
    const studentId = requireMapping(mongoUserToSupabase, submission.studentId, 'coding_submission');
    const testId = requireMapping(mongoTestToSupabase, submission.testId, 'coding_submission');
    const problemId = requireMapping(mongoProblemToSupabase, submission.problemId, 'coding_submission');
    if (!studentId || !testId || !problemId) continue;
    const mcqResultId = submission.mcqResultId ? mongoResultToSupabase.get(idOf(submission.mcqResultId)) : null;
    const submissionId = await insertOne('coding_submissions', {
      legacy_mongo_id: idOf(submission._id),
      student_id: studentId,
      test_id: testId,
      problem_id: problemId,
      language: submission.language,
      source_code: submission.sourceCode,
      score: submission.score || 0,
      total_marks: submission.totalMarks || 0,
      status: submission.status || 'pending',
      compilation_error: submission.compilationError || '',
      attempt_number: submission.attemptNumber || 1,
      mcq_result_id: mcqResultId || null,
      auto_submitted: Boolean(submission.autoSubmitted),
      violations: submission.violations || [],
      submitted_at: submission.submittedAt || submission.createdAt || new Date(),
      created_at: submission.createdAt || new Date(),
      updated_at: submission.updatedAt || new Date(),
    });
    await insertMany('coding_test_case_results', submission.testCaseResults.map((item) => ({
      id: `${submissionId.slice(0, 8)}-${String(item.testCaseIndex + 1).padStart(4, '0')}-4000-8000-333333333333`,
      submission_id: submissionId,
      case_no: item.testCaseIndex,
      passed: Boolean(item.passed),
      actual_output: item.actualOutput || '',
      execution_time: item.executionTime || 0,
      memory_used: item.memoryUsed || 0,
      status: item.status || 'Pending',
    })));
  }

  for (const violation of mongoViolations) {
    const studentId = requireMapping(mongoUserToSupabase, violation.studentId, 'violation');
    const testId = requireMapping(mongoTestToSupabase, violation.testId, 'violation');
    if (!studentId || !testId) continue;
    await insertOne('violations', {
      legacy_mongo_id: idOf(violation._id),
      student_id: studentId,
      test_id: testId,
      violation_type: violation.violationType,
      description: violation.description || '',
      occurred_at: violation.timestamp || violation.createdAt || new Date(),
      created_at: violation.createdAt || new Date(),
    });
  }

  for (const otp of mongoOtps) {
    await insertOne('otps', {
      legacy_mongo_id: idOf(otp._id),
      email: otp.email,
      otp_hash: otp.otp,
      expires_at: otp.expiresAt,
      verified: Boolean(otp.verified),
      attempts: otp.attempts || 0,
      created_at: otp.createdAt || new Date(),
    });
  }

  for (const setting of mongoSettings) {
    const { error } = await supabaseAdmin.from('site_settings').upsert({
      key: setting.key,
      is_online: setting.isOnline,
      updated_at: setting.updatedAt || new Date(),
    }, { onConflict: 'key' });
    if (error) throw new Error(`site_settings: ${error.message}`);
  }

  console.log(JSON.stringify({ migrated: counters, skipped: skipped.length, skippedRecords: skipped }, null, 2));
  await require('mongoose').disconnect();
};

migrate().catch(async (error) => {
  console.error(error.stack || error.message);
  try { await require('mongoose').disconnect(); } catch {}
  process.exitCode = 1;
});
