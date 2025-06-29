import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export interface SystemSettings {
    companyName: string;
    adminEmail: string;
    supportEmail: string;
    notificationEmail: string;
}

// Function to get company name from database
export const getCompanyName = async (): Promise<string> => {
    try {
        const settings = await prisma.systemSettings.findFirst();
        return settings?.companyName || process.env.COMPANY_NAME || 'Default Company Name';
    } catch (error) {
        console.error('Error fetching company name:', error);
        return process.env.COMPANY_NAME || 'Default Company Name';
    }
};

// Function to get email settings from database
export const getEmailSettings = async (): Promise<SystemSettings> => {
    try {
        const settings = await prisma.systemSettings.findFirst();
        return {
            companyName: settings?.companyName || process.env.COMPANY_NAME || 'Default Company Name',
            adminEmail: settings?.adminEmail || process.env.ADMIN_EMAIL || 'admin@example.com',
            supportEmail: settings?.adminEmail || process.env.SUPPORT_EMAIL || 'support@example.com',
            notificationEmail: settings?.notificationEmail || process.env.NOTIFICATION_EMAIL || 'notifications@example.com'
        };
    } catch (error) {
        console.error('Error fetching email settings:', error);
        return {
            companyName: process.env.COMPANY_NAME || 'Default Company Name',
            adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
            supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
            notificationEmail: process.env.NOTIFICATION_EMAIL || 'notifications@example.com'
        };
    }
};

// Function to get a system setting value by key (e.g. premiumPricing)
export const getSystemSetting = async (key: string): Promise<string | null> => {
    try {
        const settings = await prisma.systemSettings.findFirst();
        if (!settings) return null;
        return (settings as any)[key] || null;
    } catch (error) {
        console.error('Error fetching system setting:', error);
        return null;
    }
};
