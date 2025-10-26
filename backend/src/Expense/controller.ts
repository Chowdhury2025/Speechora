import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Keep an in-memory fallback to avoid hard-failing when the DB schema hasn't
// been migrated yet (useful for development). When you run the Prisma migration
// this fallback will be unused.
let fallbackExpenses: Array<any> = [];
let nextId = 1;

export const getExpenses = async (_req: Request, res: Response) => {
  try {
    // Prefer DB-backed data
    try {
      const list = await (prisma as any).expense.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(StatusCodes.OK).json({ expenses: list });
    } catch (dbErr: any) {
      // If DB table isn't available yet, fall back to in-memory store
      console.warn('prisma.expense.findMany failed, falling back to in-memory store:', dbErr?.message || dbErr);
      const list = fallbackExpenses.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.status(StatusCodes.OK).json({ expenses: list });
    }
  } catch (error: any) {
    console.error('Failed to get expenses', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get expenses' });
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const { name, type, amount, description, recordedById } = req.body;
    if (!name || !type || typeof amount !== 'number') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'name, type and numeric amount are required' });
    }

    // Try to persist to the DB; if that fails (no migration yet), use fallback
    try {
      const expense = await (prisma as any).expense.create({
        data: {
          name,
          type,
          amount,
          description: description || '',
          recordedById: recordedById ?? null,
        }
      });
      return res.status(StatusCodes.CREATED).json({ expense });
    } catch (dbErr: any) {
      console.warn('prisma.expense.create failed, falling back to in-memory store:', dbErr?.message || dbErr);
      const newExpense = {
        id: nextId++,
        name,
        type,
        amount,
        description: description || '',
        recordedById: recordedById || null,
        createdAt: new Date().toISOString(),
      };
      fallbackExpenses.push(newExpense);
      return res.status(StatusCodes.CREATED).json({ expense: newExpense });
    }
  } catch (error: any) {
    console.error('Failed to add expense', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to add expense' });
  }
};

// For convenience in development we export a helper to seed or reset the store
export const __resetExpenses = () => { fallbackExpenses = []; nextId = 1; };

export default { getExpenses, addExpense };
