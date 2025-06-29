import { Router } from 'express';
import { getPremiumPricing, setPremiumPricing } from './controller';
import { getPremiumPrice } from './getPremiumPrice';

const router = Router();

router.get('/premium-pricing', getPremiumPricing);
router.post('/premium-pricing', setPremiumPricing); // Use POST for create/update
router.get('/premium-price', getPremiumPrice);

export default router;
