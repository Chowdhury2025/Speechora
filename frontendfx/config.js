// API URLs
export const API_URL = import.meta.env.VITE_API_URL || 'https://book8-backend.vercel.app';
// export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:8800';

// Cloudflare R2 Configuration
export const R2_CONFIG = {
    accountId: import.meta.env.VITE_R2_ACCOUNT_ID,
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
    bucketName: import.meta.env.VITE_R2_BUCKET_NAME,
    publicUrl: import.meta.env.VITE_R2_PUBLIC_URL
};

// File Upload Settings
export const UPLOAD_CONFIG = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// PWA Configuration
export const PWA_CONFIG = {
    name: 'Kids Learning Platform',
    short_name: 'KidsLearn',
    description: 'Interactive learning platform for kids',
    theme_color: '#58cc02',
    background_color: '#ffffff',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    icons: [
        {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
        },
        {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
        },
        {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
        },
        {
            src: '/icons/appIcon-removebg-preview.png',
            sizes: '144x144',
            type: 'image/png'
        },
        {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
        },
        {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
        },
        {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
        },
        {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
        }
    ]
};

