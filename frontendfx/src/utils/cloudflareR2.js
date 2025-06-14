import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file to Cloudflare R2
 * @param {File} file - The file to upload
 * @param {string} folder - The folder name in R2 (e.g., 'images', 'videos')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadToR2 = async (file, folder = 'images') => {
  try {
    // Generate a unique filename
    const ext = file.name.split('.').pop();
    const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueName,
      Body: file,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Return the public URL
    return `${R2_PUBLIC_URL}/${uniqueName}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Deletes a file from Cloudflare R2
 * @param {string} url - The public URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFromR2 = async (url) => {
  try {
    // Extract the key from the URL
    const key = url.replace(`${R2_PUBLIC_URL}/`, '');

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Validates file size and type
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {boolean} - Whether the file is valid
 */
export const validateFile = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return true;
};
