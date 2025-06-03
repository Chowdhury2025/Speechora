// config.ts

import dotenv from 'dotenv';
dotenv.config();

import { getCompanyName, getEmailSettings, SystemSettings } from './utils/systemSettings';

// Note: This will be initialized with the env value but can be updated at runtime
export let companyName: string = process.env.COMPANY_NAME || 'Default Company Name';

// Update company name from database
getCompanyName().then((name: string) => {
    companyName = name;
}).catch((error: Error) => {
    console.error('Error updating company name:', error);
    // Keep using the environment variable or default if database fetch fails
});
export const backendUrl      = process.env.BACKEND_URL!;      // was "backendUrl"
export const apiBasePath     = process.env.API_BASE_PATH!;    // was "apiBasePath"

// These will be initialized with defaults and updated from database
export let AdminEmail: string = 'admin@example.com';
export let supportEmail: string = 'support@example.com';
export let notificationEmail: string = 'notifications@example.com';

// Update email settings from database
getEmailSettings().then((settings: SystemSettings) => {
    AdminEmail = settings.adminEmail;
    supportEmail = settings.supportEmail;
    notificationEmail = settings.notificationEmail;
}).catch((error: Error) => {
    console.error('Error updating email settings:', error);
    // Keep using the default values if database fetch fails
});
