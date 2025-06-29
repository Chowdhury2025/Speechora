import { Request, Response } from 'express';
import { prisma } from '../../config/db';

// GET premium pricing (returns value or default)
export const getPremiumPricing = async (_req: Request, res: Response) => {
  try {
    // Only select the premiumPricing field for efficiency
    const settings = await prisma.systemSettings.findFirst({ select: { premiumPricing: true } });
    if (!settings || settings.premiumPricing === undefined || settings.premiumPricing === null) {
      return res.json({ premiumPricing: '0' }); // Default value if not set
    }
    res.json({ premiumPricing: settings.premiumPricing });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// SET/UPDATE premium pricing (creates row if not exists)
export const setPremiumPricing = async (req: Request, res: Response) => {
  try {
    const { premiumPricing } = req.body;
    if (premiumPricing === undefined || premiumPricing === null) {
      return res.status(400).json({ message: 'premiumPricing is required' });
    }
    // Find the first settings row
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      // Create new settings row if not exists
      settings = await prisma.systemSettings.create({
        data: {
          premiumPricing: String(premiumPricing),
          companyName: 'Default Company Name',
          adminEmail: 'admin@example.com',
          notificationEmail: 'notifications@example.com',
        },
      });
    } else {
      // Update existing row
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: { premiumPricing: String(premiumPricing) },
      });
    }
    res.json({ premiumPricing: settings.premiumPricing });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
