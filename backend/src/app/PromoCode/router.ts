import express from 'express';
import { createPromoCode, validatePromoCode, applyPromoCode, listPromoCodes } from './controller';

const router = express.Router();

// Public routes - no authentication needed
router.post('/create', createPromoCode);
router.get('/list', listPromoCodes);
router.post('/validate', validatePromoCode);
router.post('/apply', applyPromoCode);

export default router;
