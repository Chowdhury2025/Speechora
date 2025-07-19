import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

interface CreatePromoCodeData {
  code: string;
  discount: number;
  maxUses: number;
  validUntil?: string;
}

interface ValidatePromoCodeData {
  code: string;
}

function validateCreatePromoCode(data: any): { isValid: boolean; error?: string } {
  if (!data.code || typeof data.code !== 'string' || data.code.length < 3) {
    return { isValid: false, error: 'Code must be at least 3 characters long' };
  }
  
  if (typeof data.discount !== 'number' || data.discount < 0 || data.discount > 100) {
    return { isValid: false, error: 'Discount must be between 0 and 100' };
  }
  
  if (typeof data.maxUses !== 'number' || data.maxUses < 1) {
    return { isValid: false, error: 'Maximum uses must be at least 1' };
  }

  if (data.validUntil && !isValidDate(data.validUntil)) {
    return { isValid: false, error: 'Invalid date format for validUntil' };
  }

  return { isValid: true };
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export const createPromoCode = async (req: Request, res: Response) => {
  try {
    const validation = validateCreatePromoCode(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const data = req.body as CreatePromoCodeData;
    
    const existingCode = await prisma.promoCode.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      return res.status(400).json({ error: 'Promo code already exists' });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        ...data,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
    });

    res.status(201).json(promoCode);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create promo code' });
  }
};

export const validatePromoCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body as ValidatePromoCodeData;
    console.log(req.body)
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid promo code format' });
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promoCode) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    if (!promoCode.isActive) {
      return res.status(400).json({ error: 'Promo code is inactive' });
    }

    if (promoCode.validUntil && promoCode.validUntil < new Date()) {
      return res.status(400).json({ error: 'Promo code has expired' });
    }

    if (promoCode.usedCount >= promoCode.maxUses) {
      return res.status(400).json({ error: 'Promo code has reached maximum uses' });
    }

    res.json({
      valid: true,
      discount: promoCode.discount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate promo code' });
  }
};

export const applyPromoCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body as ValidatePromoCodeData;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid promo code format' });
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promoCode || !promoCode.isActive || (promoCode.validUntil && promoCode.validUntil < new Date())) {
      return res.status(400).json({ error: 'Invalid or expired promo code' });
    }

    if (promoCode.usedCount >= promoCode.maxUses) {
      return res.status(400).json({ error: 'Promo code has reached maximum uses' });
    }

    // Get system settings for premium price
    const systemSettings = await prisma.systemSettings.findFirst();
    if (!systemSettings) {
      return res.status(500).json({ error: 'System settings not found' });
    }

    const premiumPrice = parseFloat(systemSettings.premiumPricing);
    const discountAmount = (premiumPrice * promoCode.discount) / 100;

    // Update promo code usage count
    await prisma.promoCode.update({
      where: { id: promoCode.id },
      data: { usedCount: { increment: 1 } },
    });

    res.json({
      success: true,
      discount: promoCode.discount,
      discountAmount,
      finalPrice: premiumPrice - discountAmount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply promo code' });
  }
};

export const listPromoCodes = async (_req: Request, res: Response) => {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      select: {
        id: true,
        code: true,
        discount: true,
        maxUses: true,
        usedCount: true,
        validFrom: true,
        validUntil: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json(promoCodes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
};
