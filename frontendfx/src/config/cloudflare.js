import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

class CloudflareR2Service {
  constructor() {
    this.R2_ACCOUNT_ID = '859b914602758e51e4e66a197332af8e';
    this.R2_ACCESS_KEY_ID = '54ce13cb81647071f3fa0566e2b5ff14';
    this.R2_SECRET_ACCESS_KEY = '70f4fa673338ad54d7a759a2ff03207084685c463d3a22f5ce4835e98173e9f4';
    this.R2_BUCKET_NAME = 'book8';
    this.R2_PUBLIC_URL = 'https://pub-125e671ed2684c31b6801d4f5ad5bf20.r2.dev';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.R2_ACCESS_KEY_ID,
        secretAccessKey: this.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file, folder = 'images') {
    try {
      // Generate a unique filename
      const ext = file.name.split('.').pop();
      const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: this.R2_BUCKET_NAME,
        Key: uniqueName,
        Body: file,
        ContentType: file.type,
      });

      await this.s3Client.send(command);

      // Return the public URL
      return `${this.R2_PUBLIC_URL}/${uniqueName}`;
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(url) {
    try {
      // Extract the key from the URL
      const key = url.replace(`${this.R2_PUBLIC_URL}/`, '');

      const command = new DeleteObjectCommand({
        Bucket: this.R2_BUCKET_NAME,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting from R2:', error);
      throw new Error('Failed to delete file');
    }
  }

  validateFile(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
    }

    return true;
  }
}

export const r2Service = new CloudflareR2Service();




// Create Account API Token
// book8 was successfully created
// Summary:
// Permissions:
// Allows the ability to read, write, and list objects in specific buckets.

// Buckets:
// All R2 buckets on this account
// Use this token for authenticating against the Cloudflare API:
// Token value
// eX--ebHpf5vxkf-iG2th0AFCHGemyGorQdFjTs6t
// Click to copy

// Use the following credentials for S3 clients:
// Access Key ID
// 54ce13cb81647071f3fa0566e2b5ff14
// Click to copy

// Secret Access Key
// 70f4fa673338ad54d7a759a2ff03207084685c463d3a22f5ce4835e98173e9f4
// Click to copy

// Use jurisdiction-specific endpoints for S3 clients:
// DefaultEuropean Union (EU)
// https://859b914602758e51e4e66a197332af8e.r2.cloudflarestorage.com
// Click to copy