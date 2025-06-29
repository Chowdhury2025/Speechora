import { prisma } from '../../config/db';
import { Request, Response } from 'express';

export const getPremiumPrice = async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSettings.findFirst();
    const price = settings?.premiumPricing || '0';
    res.json({ price });
  } catch (error) {
    res.status(500).json({ price: null, error: 'Failed to fetch premium price' });
  }
};
