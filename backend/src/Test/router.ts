import express from 'express';

import {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
  addQuestion,
  getQuestions,
  updateQuestion
} from './controller';

const router = express.Router();

// Public routes
router.get('/questions', getQuestions);
router.get('/tests', getTests);
router.get('/tests/:id', getTestById);

// Protected routes
router.post('/tests', createTest);
router.put('/tests/:id', updateTest);
router.delete('/tests/:id', deleteTest);
router.post('/questions', addQuestion);
router.put('/questions/:id', updateQuestion); // New endpoint for updating questions

export default router;
