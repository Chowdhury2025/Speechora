import { Request, Response } from 'express';
import { prisma } from '../../config/db';

// GET premium pricing (returns value or default)
export const getPremiumPricing = async (_req: Request, res: Response) => {
  try {
    console.log('getPremiumPricing endpoint called');
    // Only select the premiumPricing field for efficiency
    const settings = await prisma.systemSettings.findFirst({ select: { premiumPricing: true } });
    console.log('System settings found:', settings);
    
    if (!settings || settings.premiumPricing === undefined || settings.premiumPricing === null) {
      console.log('No premium pricing found, returning default');
      return res.json({ premiumPricing: '1000' }); // Default value if not set
    }
    
    console.log('Returning premium pricing:', settings.premiumPricing);
    res.json({ premiumPricing: settings.premiumPricing });
  } catch (err) {
    console.error('Error in getPremiumPricing:', err);
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
          companyName: 'Speechora Learning Platform',
          adminEmail: 'admin@speechora.com',
          notificationEmail: 'notifications@speechora.com',
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
          companyName: 'Speechora Learning Platform',
          adminEmail: 'admin@Speechora.com',
          notificationEmail: 'notifications@Speechora.com',
          premiumPricing: '1000', // Default monthly premium price
          mobileDefaults: {
            languageOverride: 'en',
            homeButtons: [],
            appIconUrl: '',
            splashIconUrl: '',
            orientation: 'portrait',
            downloadOnInitialLogin: false
          }
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
      mobileDefaults: settings.mobileDefaults || {},
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
      mobileDefaults
    } = req.body;

    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      // Create new settings if none exist
      settings = await (prisma as any).systemSettings.create({
        data: {
          companyName: businessName || 'Speechora Learning Platform',
          adminEmail: adminEmail || 'admin@Speechora.com',
          notificationEmail: notificationEmail || 'notifications@Speechora.com',
          premiumPricing: premiumPricing || '1000',
          mobileDefaults: mobileDefaults || {}
        },
      });
    } else {
      // Update existing settings
      settings = await (prisma as any).systemSettings.update({
        where: { id: settings.id },
        data: {
          companyName: businessName,
          adminEmail: adminEmail,
          notificationEmail: notificationEmail,
          premiumPricing: premiumPricing,
          mobileDefaults: mobileDefaults || settings.mobileDefaults || {}
        },
      });
    }

    // At this point, settings should definitely exist
    if (!settings) {
      return res.status(500).json({ message: 'Failed to create or update settings' });
    }

    // Return updated settings in the format expected by frontend
    res.json({
      businessName: settings.companyName,
      adminEmail: settings.adminEmail,
      supportEmail: settings.adminEmail,
      notificationEmail: settings.notificationEmail,
      premiumPricing: settings.premiumPricing,
      mobileDefaults: settings.mobileDefaults || {},
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

// Initialize system settings if they don't exist
export const initializeSystemSettings = async (_req: Request, res: Response) => {
  try {
    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      console.log('Creating initial system settings...');
      settings = await prisma.systemSettings.create({
        data: {
          companyName: 'Speechora Learning Platform',
          adminEmail: 'admin@speechora.com',
          premiumPricing: '1000',
          notificationEmail: 'notifications@speechora.com',
        },
      });
      console.log('Initial system settings created:', settings);
    }
    
    res.json({
      success: true,
      message: settings ? 'System settings already exist' : 'System settings initialized',
      settings: {
        id: settings.id,
        companyName: settings.companyName,
        premiumPricing: settings.premiumPricing,
        adminEmail: settings.adminEmail,
        notificationEmail: settings.notificationEmail,
      }
    });
  } catch (err) {
    console.error('Error initializing system settings:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initialize system settings', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};
