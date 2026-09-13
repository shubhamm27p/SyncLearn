const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCSV } = require('../middleware/upload');

// All test routes require authentication
router.use(protect);

// Admin dashboard stats (accessible by admin and trainer)
router.get('/stats/dashboard', authorize('admin', 'trainer'), testController.getDashboardStats);

// CRUD
router.get('/', testController.getTests);
router.get('/:id', testController.getTestById);
router.post('/', authorize('admin', 'trainer'), testController.createTest);
router.put('/:id', authorize('admin', 'trainer'), testController.updateTest);
router.delete('/:id', authorize('admin', 'trainer'), testController.deleteTest);
router.put('/:id/publish', authorize('admin', 'trainer'), testController.publishTest);
router.post('/:id/send', authorize('admin', 'trainer'), testController.sendTestToStudents);

// Questions
router.get('/:id/questions', testController.getQuestions);
router.post('/:id/questions', authorize('admin', 'trainer'), testController.addQuestionsManually);
router.post(
  '/:id/questions/csv',
  authorize('admin', 'trainer'),
  uploadCSV.single('file'),
  testController.uploadQuestionsCSV
);

// Answer Key (admin only — never expose to students)
router.get('/:id/answerkey', authorize('admin', 'trainer'), testController.getAnswerKey);
router.post('/:id/answerkey', authorize('admin', 'trainer'), testController.uploadAnswerKey);

module.exports = router;
