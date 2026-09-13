const Test = require('../models/Test');
const Question = require('../models/Question');
const AnswerKey = require('../models/AnswerKey');
const Result = require('../models/Result');
const Violation = require('../models/Violation');
const evaluateAnswers = require('../utils/evaluateAnswers');
const CodingProblem = require('../models/CodingProblem');
const CodingSubmission = require('../models/CodingSubmission');
const config = require('../config');
const supabaseAdmin = config.storageMode === 'mongo'
  ? null
  : require('../config/supabase').supabaseAdmin;

const getSupabaseStudentId = async (email) => {
  const { data, error } = await supabaseAdmin.from('users').select('id').eq('email', email).maybeSingle();
  if (error) throw error;
  return data?.id || null;
};

const getSupabaseTestsByIds = async (ids) => {
  if (!ids.length) return new Map();
  const { data, error } = await supabaseAdmin
    .from('mcq_tests')
    .select('id, title, description, subject, start_time, end_time, duration, max_attempts, marks_per_question, total_marks, test_type')
    .in('id', ids);
  if (error) throw error;
  return new Map((data || []).map((test) => [test.id, test]));
};

const getAvailableTestsFromSupabase = async (req, res, next) => {
  try {
    const now = new Date();
    const { data: tests, error } = await supabaseAdmin
      .from('mcq_tests')
      .select('id, title, description, subject, start_time, end_time, duration, max_attempts, marks_per_question, total_marks, test_type')
      .in('status', ['published', 'active'])
      .order('start_time', { ascending: true });
    if (error) throw error;

    const visibleTests = (tests || []).filter((test) => {
      const start = test.start_time ? new Date(test.start_time) : null;
      const end = test.end_time ? new Date(test.end_time) : null;
      return (!start || start > now) || (!end || end >= now);
    });
    const ids = visibleTests.map((test) => test.id);
    const studentId = await getSupabaseStudentId(req.user.email);
    if (!studentId) return res.json({ success: true, data: [] });

    const [{ data: questions, error: questionError }, { data: results, error: resultError }, { data: problems, error: problemError }, { data: submissions, error: submissionError }] = await Promise.all([
      supabaseAdmin.from('mcq_questions').select('test_id').in('test_id', ids),
      supabaseAdmin.from('mcq_results').select('test_id, score, percentage').eq('student_id', studentId).in('test_id', ids).order('score', { ascending: false }),
      supabaseAdmin.from('coding_problems').select('test_id').in('test_id', ids),
      supabaseAdmin.from('coding_submissions').select('test_id').eq('student_id', studentId).in('test_id', ids),
    ]);
    if (questionError || resultError || problemError || submissionError) {
      throw questionError || resultError || problemError || submissionError;
    }

    const countBy = (rows) => rows.reduce((map, row) => map.set(row.test_id, (map.get(row.test_id) || 0) + 1), new Map());
    const questionCounts = countBy(questions || []);
    const codingCounts = countBy(problems || []);
    const attemptCounts = countBy(results || []);
    const codingAttemptIds = new Set((submissions || []).map((row) => row.test_id));
    const bestScores = new Map();
    (results || []).forEach((row) => { if (!bestScores.has(row.test_id)) bestScores.set(row.test_id, row); });

    return res.json({
      success: true,
      data: visibleTests.map((test) => {
        const attemptCount = attemptCounts.get(test.id) || 0;
        const best = bestScores.get(test.id);
        const start = test.start_time ? new Date(test.start_time) : null;
        const end = test.end_time ? new Date(test.end_time) : null;
        return {
          _id: test.id,
          title: test.title,
          description: test.description,
          subject: test.subject,
          startTime: test.start_time,
          endTime: test.end_time,
          duration: test.duration,
          maxAttempts: test.max_attempts,
          marksPerQuestion: test.marks_per_question,
          totalMarks: test.total_marks,
          testType: test.test_type,
          totalQuestions: questionCounts.get(test.id) || 0,
          attemptCount,
          hasAttempted: attemptCount >= test.max_attempts,
          bestScore: best?.score || 0,
          bestPercentage: best?.percentage || 0,
          codingProblemCount: codingCounts.get(test.id) || 0,
          hasAttemptedCoding: codingAttemptIds.has(test.id),
          liveStatus: start && now < start ? 'upcoming' : end && now <= end ? 'live' : undefined,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

const getMyResultsFromSupabase = async (req, res, next) => {
  try {
    const studentId = await getSupabaseStudentId(req.user.email);
    if (!studentId) return res.json({ success: true, data: [] });
    const { data: results, error } = await supabaseAdmin
      .from('mcq_results')
      .select('id, test_id, score, total_marks, percentage, correct_answers, incorrect_answers, unattempted, status, auto_submitted, submitted_at, time_taken, attempt_number')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    const tests = await getSupabaseTestsByIds((results || []).map((result) => result.test_id));
    return res.json({
      success: true,
      data: (results || []).map((result) => ({
        _id: result.id,
        testId: tests.get(result.test_id) ? {
          _id: result.test_id,
          title: tests.get(result.test_id).title,
          subject: tests.get(result.test_id).subject,
          totalMarks: tests.get(result.test_id).total_marks,
          duration: tests.get(result.test_id).duration,
          testType: tests.get(result.test_id).test_type,
        } : result.test_id,
        score: result.score,
        totalMarks: result.total_marks,
        percentage: result.percentage,
        correctAnswers: result.correct_answers,
        incorrectAnswers: result.incorrect_answers,
        unattempted: result.unattempted,
        status: result.status,
        autoSubmitted: result.auto_submitted,
        submittedAt: result.submitted_at,
        timeTaken: result.time_taken,
        attemptNumber: result.attempt_number,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available tests for student (live + upcoming)
 * @route   GET /api/student/tests
 * @access  Private (student)
 */
exports.getAvailableTests = async (req, res, next) => {
  if (config.storageMode === 'supabase') return getAvailableTestsFromSupabase(req, res, next);
  try {
    const now = new Date();

    const tests = await Test.find({
      status: { $in: ['published', 'active'] },
      $or: [
        // Live: startTime <= now <= endTime
        { startTime: { $lte: now }, endTime: { $gte: now } },
        // Upcoming: startTime > now
        { startTime: { $gt: now } },
      ],
    })
      .select('title description subject startTime endTime duration maxAttempts marksPerQuestion totalMarks testType')
      .sort({ startTime: 1 })
      .lean();

    const testIds = tests.map((test) => test._id);
    const studentId = req.user._id;

    const [questionCounts, attemptCounts, bestScores, codingCounts, codingAttempts] = await Promise.all([
      Question.aggregate([
        { $match: { testId: { $in: testIds } } },
        { $group: { _id: '$testId', count: { $sum: 1 } } },
      ]),
      Result.aggregate([
        { $match: { testId: { $in: testIds }, studentId } },
        { $group: { _id: '$testId', count: { $sum: 1 } } },
      ]),
      Result.aggregate([
        { $match: { testId: { $in: testIds }, studentId } },
        { $sort: { score: -1 } },
        { $group: {
          _id: '$testId',
          score: { $first: '$score' },
          percentage: { $first: '$percentage' },
        } },
      ]),
      CodingProblem.aggregate([
        { $match: { testId: { $in: testIds } } },
        { $group: { _id: '$testId', count: { $sum: 1 } } },
      ]),
      CodingSubmission.aggregate([
        { $match: { testId: { $in: testIds }, studentId } },
        { $group: { _id: '$testId' } },
      ]),
    ]);

    const toMap = (rows) => new Map(rows.map((row) => [row._id.toString(), row]));
    const questionCountMap = toMap(questionCounts);
    const attemptCountMap = toMap(attemptCounts);
    const bestScoreMap = toMap(bestScores);
    const codingCountMap = toMap(codingCounts);
    const codingAttemptMap = new Set(codingAttempts.map((row) => row._id.toString()));

    const enriched = tests.map((test) => {
      const key = test._id.toString();
      const attemptCount = attemptCountMap.get(key)?.count || 0;
      const bestScore = bestScoreMap.get(key);
      const start = new Date(test.startTime);
      const end = new Date(test.endTime);

      return {
        ...test,
        totalQuestions: questionCountMap.get(key)?.count || 0,
        attemptCount,
        hasAttempted: attemptCount >= test.maxAttempts,
        bestScore: bestScore?.score || 0,
        bestPercentage: bestScore?.percentage || 0,
        codingProblemCount: codingCountMap.get(key)?.count || 0,
        hasAttemptedCoding: codingAttemptMap.has(key),
        liveStatus: now >= start && now <= end ? 'live' : now < start ? 'upcoming' : undefined,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get test questions to start an attempt
 * @route   GET /api/student/tests/:id/start
 * @access  Private (student)
 */
exports.getTestForAttempt = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .select('title description subject startTime endTime duration maxAttempts marksPerQuestion negativeMarking negativeMarks totalMarks testType');

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    console.log('getTestForAttempt returning testType:', test.testType);

    const now = new Date();
    const start = new Date(test.startTime);
    const end = new Date(test.endTime);

    // Check if test is live
    if (now < start) {
      return res.status(400).json({
        success: false,
        message: 'This test has not started yet',
      });
    }
    if (now > end) {
      return res.status(400).json({
        success: false,
        message: 'This test has ended',
      });
    }

    // Check strict one-attempt limit
    const attemptCount = await Result.countDocuments({
      testId: test._id,
      studentId: req.user._id,
    });

    if (attemptCount >= 1) {
      return res.status(400).json({
        success: false,
        message: 'You have already attempted this test. You cannot attempt the same test again.',
      });
    }

    // Get questions WITHOUT correct answers
    const questions = await Question.find({ testId: test._id })
      .select('questionNo questionText optionA optionB optionC optionD optionE marks')
      .sort({ questionNo: 1 });

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This test has no questions',
      });
    }

    // Calculate remaining time (if student starts late)
    const remainingTestTime = Math.floor((end - now) / 1000);
    const testDurationSec = test.duration * 60;
    const effectiveDuration = Math.min(testDurationSec, remainingTestTime);

    res.json({
      success: true,
      data: {
        testId: test._id,
        title: test.title,
        testType: test.testType,
        subject: test.subject,
        duration: effectiveDuration, // in seconds
        totalQuestions: questions.length,
        marksPerQuestion: test.marksPerQuestion,
        negativeMarking: test.negativeMarking,
        negativeMarks: test.negativeMarks || 0,
        totalMarks: test.totalMarks || questions.length * test.marksPerQuestion,
        attemptNumber: attemptCount + 1,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit test answers
 * @route   POST /api/student/tests/:id/submit
 * @access  Private (student)
 */
exports.submitTest = async (req, res, next) => {
  console.log('=== SUBMIT TEST CALLED ===');
  console.log('testId:', req.params.id);
  console.log('studentId:', req.user._id);
  console.log('body:', req.body);
  try {
    const { answers, autoSubmitted, violations, timeTaken } = req.body;

    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Check strict one-attempt limit
    const attemptCount = await Result.countDocuments({
      testId: test._id,
      studentId: req.user._id,
    });

    if (attemptCount >= 1) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this test. You cannot attempt the same test again.',
      });
    }

    // Fetch answer key
    const answerKey = await AnswerKey.findOne({ testId: test._id });
    if (!answerKey) {
      return res.status(500).json({
        success: false,
        message: 'Answer key not found for this test',
      });
    }

    // Fetch all questions to evaluate
    const questions = await Question.find({ testId: test._id });
    const answersArray = answers || [];

    // Evaluate answers
    const evaluation = evaluateAnswers(questions, answerKey, answersArray, test);

    console.log('Evaluation result:', {
      score: evaluation.score,
      percentage: evaluation.percentage,
      correctCount: evaluation.correctCount,
      incorrectCount: evaluation.incorrectCount,
      unattemptedCount: evaluation.unattemptedCount
    });

    // Save violations to Violation model
    const violationDocs = [];
    if (violations && violations.length > 0) {
      violations.forEach((v) => {
        violationDocs.push({
          studentId: req.user._id,
          testId: test._id,
          violationType: v.type,
          timestamp: v.timestamp || new Date(),
          description: v.description || '',
        });
      });
      await Violation.insertMany(violationDocs);
    }

    // Create result
    const result = await Result.create({
      testId: test._id,
      studentId: req.user._id,
      answers: answersArray,
      score: evaluation.score,
      totalMarks: evaluation.totalMarks,
      percentage: evaluation.percentage,
      correctAnswers: evaluation.correctCount,
      incorrectAnswers: evaluation.incorrectCount,
      unattempted: evaluation.unattemptedCount,
      timeTaken: timeTaken || 0,
      attemptNumber: attemptCount + 1,
      autoSubmitted: autoSubmitted || false,
      violations: violations || [],
      status: 'graded',
      submittedAt: new Date(),
      ipAddress: req.ip,
    });

    console.log('Result saved:', {
      correctAnswers: result.correctAnswers,
      incorrectAnswers: result.incorrectAnswers,
      unattempted: result.unattempted
    });

    console.log('Sending response with:', {
      resultId: result._id,
      score: result.score,
      percentage: result.percentage
    });

    try {
      return res.status(201).json({
        success: true,
        message: autoSubmitted
          ? 'Test auto-submitted due to violation'
          : 'Test submitted successfully',
        result: {
          _id: result._id,
          score: result.score,
          percentage: result.percentage,
          correctAnswers: result.correctAnswers,
          incorrectAnswers: result.incorrectAnswers,
          unattempted: result.unattempted,
          autoSubmitted: result.autoSubmitted
        },
        resultId: result._id
      });
    } catch (responseError) {
      console.error('Error building response (Result WAS saved):', responseError.message);
      // Result already saved — return success with minimal data
      return res.status(201).json({
        success: true,
        message: 'Test submitted successfully',
        resultId: result._id
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all results for logged-in student
 * @route   GET /api/student/results
 * @access  Private (student)
 */
exports.getMyResults = async (req, res, next) => {
  if (config.storageMode === 'supabase') return getMyResultsFromSupabase(req, res, next);
  try {
    const results = await Result.find({ studentId: req.user._id })
      .populate('testId', 'title subject totalMarks duration startTime testType')
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed result with answer comparison
 * @route   GET /api/student/results/:id
 * @access  Private (student)
 */
exports.getResultDetail = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('testId', 'title subject totalMarks duration marksPerQuestion negativeMarking negativeMarks')
      .populate('studentId', 'name email rollNumber');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    // Ensure student can only view their own result
    if (result.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get questions + answer key for comparison
    const questions = await Question.find({ testId: result.testId._id })
      .select('questionNo questionText optionA optionB optionC optionD optionE marks')
      .sort({ questionNo: 1 });

    const answerKey = await AnswerKey.findOne({ testId: result.testId._id });
    const keyMap = {};
    if (answerKey) {
      answerKey.answers.forEach((a) => {
        keyMap[a.questionNo] = a.correctOption;
      });
    }

    // Build answer comparison
    const studentAnswerMap = {};
    result.answers.forEach((a) => {
      studentAnswerMap[a.questionNo] = a.selectedOption;
    });

    const comparison = questions.map((q) => {
      const studentAnswer = studentAnswerMap[q.questionNo] || null;
      const correctAnswer = keyMap[q.questionNo] || null;
      const isCorrect = studentAnswer && studentAnswer === correctAnswer;
      const isUnattempted = !studentAnswer;

      return {
        questionNo: q.questionNo,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        optionE: q.optionE,
        studentAnswer,
        correctAnswer,
        isCorrect,
        isUnattempted,
        marks: q.marks,
      };
    });

    // Get violations
    const violationRecords = await Violation.find({
      studentId: req.user._id,
      testId: result.testId._id,
    }).sort({ timestamp: 1 });

    const rObj = {
      ...result.toObject(),
      correctAnswers: result.correctAnswers || 0,
      incorrectAnswers: result.incorrectAnswers || 0,
      unattempted: result.unattempted || 0,
      score: result.score || 0,
      percentage: result.percentage || 0,
      timeTaken: result.timeTaken || 0
    };
    rObj.comparison = comparison;
    rObj.violationRecords = violationRecords;

    res.json({ success: true, data: rObj });
  } catch (error) {
    next(error);
  }
};
