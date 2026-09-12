const Test = require('../models/Test');
const Question = require('../models/Question');
const AnswerKey = require('../models/AnswerKey');
const Result = require('../models/Result');
const Violation = require('../models/Violation');
const evaluateAnswers = require('../utils/evaluateAnswers');
const CodingProblem = require('../models/CodingProblem');
const CodingSubmission = require('../models/CodingSubmission');

/**
 * @desc    Get available tests for student (live + upcoming)
 * @route   GET /api/student/tests
 * @access  Private (student)
 */
exports.getAvailableTests = async (req, res, next) => {
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

    // Check attempt limit
    const attemptCount = await Result.countDocuments({
      testId: test._id,
      studentId: req.user._id,
    });

    if (attemptCount >= test.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `You have already used all ${test.maxAttempts} attempt(s)`,
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

    // Check for duplicate submission
    const attemptCount = await Result.countDocuments({
      testId: test._id,
      studentId: req.user._id,
    });

    if (attemptCount >= test.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this test',
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
