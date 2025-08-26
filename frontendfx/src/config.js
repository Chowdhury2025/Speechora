//  export const API_URL = import.meta.env.VITE_API_URL || 'https://book8-backend.vercel.app';
export const API_URL = import.meta.env.VITE_APP_URL || 'https://book8-backend.vercel.app';
// export const API_URL = import.meta.env.VITE_APP_URL || 'http://localhost:8000'

// Import simplified upload service (Updated: removed r2Service)
import { backendUploadService } from './utils/backendUploadService';

// Export the simplified upload service
export const uploadService = backendUploadService;