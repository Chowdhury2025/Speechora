import express from 'express';
import { createQuizImage, getQuizImages, getQuizImageById, updateQuizImage, deleteQuizImage } from './controller';


const router = express.Router();

// Routes requiring authentication
router.post('/', createQuizImage);
router.put('/:id', updateQuizImage);
router.delete('/:id', deleteQuizImage);

// Public routes
router.get('/', getQuizImages);
router.get('/:id', getQuizImageById);

export default router;
