
// export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_URL = import.meta.env.VITE_API_URL || 'https://book8-backend.vercel.app';

// Frontend URLs
export const FRONTEND_URLS = {
  base: import.meta.env.VITE_FRONTEND_URL || 'https://speechora.vercel.app',
  register: 'https://speechora.vercel.app/register',
  login: 'https://speechora.vercel.app/login',
  forgotPassword: 'https://speechora.vercel.app/forgot-password',
  premium: 'https://speechora.vercel.app/app/premium'
};

// Cloudflare R2 Configuration
export const R2_CONFIG = {
  accountId: import.meta.env.VITE_R2_ACCOUNT_ID || '859b914602758e51e4e66a197332af8e',
  accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID || '54ce13cb81647071f3fa0566e2b5ff14',
  secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '70f4fa673338ad54d7a759a2ff03207084685c463d3a22f5ce4835e98173e9f4',
  bucketName: import.meta.env.VITE_R2_BUCKET_NAME || 'speechora',
  publicUrl: import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-125e671ed2684c31b6801d4f5ad5bf20.r2.dev'
};

// Import simplified upload service
import { backendUploadService } from './utils/backendUploadService';

// Export the simplified upload service
export const uploadService = backendUploadService;