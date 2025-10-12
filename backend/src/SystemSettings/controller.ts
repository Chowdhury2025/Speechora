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

// GET all system settings
export const getSystemSettings = async (_req: Request, res: Response) => {
  try {
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.systemSettings.create({
        data: {
          companyName: 'Book8 Learning Platform',
          adminEmail: 'admin@book8.com',
          notificationEmail: 'notifications@book8.com',
          premiumPricing: '1000', // Default monthly premium price
        },
      });
    }
    
    // Return settings in the format expected by frontend
    res.json({
      businessName: settings.companyName,
      adminEmail: settings.adminEmail,
      supportEmail: settings.adminEmail, // Using adminEmail as supportEmail
      notificationEmail: settings.notificationEmail,
      premiumPricing: settings.premiumPricing,
      bossId: null, // This would need to be added to schema if needed
      contact: '', // This would need to be added to schema if needed
      tpn: '', // This would need to be added to schema if needed
      address: '', // This would need to be added to schema if needed
      Terms_and_conditions: '', // This would need to be added to schema if needed
      autoLogoutTime: 30, // This would need to be added to schema if needed
    });
  } catch (err) {
    console.error('Error fetching system settings:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// UPDATE system settings
export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const {
      businessName,
      adminEmail,
      notificationEmail,
      premiumPricing,
    } = req.body;

    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      // Create new settings if none exist
      settings = await prisma.systemSettings.create({
        data: {
          companyName: businessName || 'Book8 Learning Platform',
          adminEmail: adminEmail || 'admin@book8.com',
          notificationEmail: notificationEmail || 'notifications@book8.com',
          premiumPricing: premiumPricing || '1000',
        },
      });
    } else {
      // Update existing settings
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          companyName: businessName,
          adminEmail: adminEmail,
          notificationEmail: notificationEmail,
          premiumPricing: premiumPricing,
        },
      });
    }

    // Return updated settings in the format expected by frontend
    res.json({
      businessName: settings.companyName,
      adminEmail: settings.adminEmail,
      supportEmail: settings.adminEmail,
      notificationEmail: settings.notificationEmail,
      premiumPricing: settings.premiumPricing,
      bossId: null,
      contact: '',
      tpn: '',
      address: '',
      Terms_and_conditions: '',
      autoLogoutTime: 30,
    });
  } catch (err) {
    console.error('Error updating system settings:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};
