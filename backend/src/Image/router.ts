import express from 'express';
import { 
  getAllImages, 
  getImageById, 
  createImage, 
  updateImage, 
  deleteImage,
  getAvailableLanguages,
  addTranslationsToImage,
  bulkTranslateImages,
  bulkTranslatePresentation1Images
} from './controller';

const router = express.Router();

// Existing routes
router.get('/', getAllImages);
router.get('/category/:category', getAllImages);
router.get('/:id', getImageById);
router.post('/', createImage);
router.put('/:id', updateImage);
router.delete('/:id', deleteImage);

// New translation routes
router.get('/languages/available', getAvailableLanguages);
router.post('/:id/translations', addTranslationsToImage);
router.post('/bulk/translate', bulkTranslateImages);
router.post('/bulk/translate-presentation1', bulkTranslatePresentation1Images);

export default router;
