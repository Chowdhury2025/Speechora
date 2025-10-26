import express from 'express';
import * as expenseController from './controller';

const router = express.Router();

router.get('/', expenseController.getExpenses);
router.post('/', expenseController.addExpense);

export default router;
