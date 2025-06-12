import express from 'express';
import type { Request, Response } from 'express';
import { createQuestion, getQuestions, submitAnswer, startTest, getTestResults } from './controller';

const router = express.Router();

// Create a new question (admin/teacher only)
router.post('/questions', (req: Request, res: Response) => createQuestion(req as any, res));

// Get questions (can be filtered by category and age group)
router.get('/questions', (req: Request, res: Response) => getQuestions(req as any, res));

// Submit an answer for a question
router.post('/submit-answer', (req: Request, res: Response) => submitAnswer(req as any, res));

// Start a new test
router.post('/start-test', (req: Request, res: Response) => startTest(req as any, res));

// Get test results for a user
router.get('/results/:userId', (req: Request, res: Response) => getTestResults(req as any, res));

export default router;
