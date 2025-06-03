import nodemailer from "nodemailer";
import dotenv from "dotenv";
// Adjust the import path as necessary

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({
  to,
  subject,
  html,
}: EmailOptions): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

interface SystemSettings {
  adminEmail: string;
  emailEmail: string;
  supportEmail: string;
  notificationEmail: string;
}

type EmailPurpose = 'admin' | 'inventory' | 'support' | 'notification';

// Helper function to get system settings
const getSystemSettings = async (): Promise<SystemSettings> => {
  // TODO: Implement actual system settings retrieval from database
  // For now, return default values from environment variables
  return {
    adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '',
    emailEmail: process.env.INVENTORY_EMAIL || process.env.EMAIL_USER || '',
    supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || '',
    notificationEmail: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER || ''
  };
};

// Helper function to get the appropriate email address based on purpose
export const getSystemEmail = async (purpose: EmailPurpose): Promise<string> => {
  try {
    const settings = await getSystemSettings();
    
    switch (purpose) {
      case 'admin':
        return settings.adminEmail;
      case 'inventory':
        return settings.emailEmail;
      case 'support':
        return settings.supportEmail;
      case 'notification':
        return settings.notificationEmail;
      default:
        throw new Error('Invalid email purpose');
    }
  } catch (error) {
    console.error('Error getting system email:', error);
    throw new Error('Failed to get system email settings');
  }
};

