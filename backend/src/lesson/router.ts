import express from 'express';
import {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  validateLessonState
} from './controller';

const router = express.Router();

// Public routes - Students can view lessons
router.get('/', getLessons);
router.get('/:id', getLessonById);

// Protected routes - Teachers can manage lessons
router.post('/', createLesson);
router.post('/validate', validateLessonState);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

export default router;