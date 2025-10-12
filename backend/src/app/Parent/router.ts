import express from 'express';
import { getDashboardData, getChildProgress, updateChildProgress, generateProgressReport } from './controller';

const router = express.Router();

router.get('/parent/dashboard', getDashboardData);
router.get('/parent/child-progress/:userId', getChildProgress);
router.put('/parent/child-progress/:userId', updateChildProgress);
router.get('/parent/progress-report/:userId', generateProgressReport);

export default router;
