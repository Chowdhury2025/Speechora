import { Router } from 'express';
import { getPremiumPricing, setPremiumPricing, getSystemSettings, updateSystemSettings, initializeSystemSettings } from './controller';
import { getPremiumPrice } from './getPremiumPrice';

const router = Router();

router.get('/premium-pricing', getPremiumPricing);
router.post('/premium-pricing', setPremiumPricing); // Use POST for create/update
router.get('/premium-price', getPremiumPrice);

// General system settings endpoints
router.get('/settings', getSystemSettings);
router.patch('/settings', updateSystemSettings);
router.post('/init', initializeSystemSettings);

export default router;
