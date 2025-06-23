import express from 'express';
import { getDashboardData } from './controller';

const router = express.Router();

router.get('/parent/dashboard', getDashboardData);

export default router;
