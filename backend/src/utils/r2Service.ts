import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

class CloudflareR2Service {
  private s3Client: S3Client;
  private R2_ACCOUNT_ID: string;
  private R2_ACCESS_KEY_ID: string;
  private R2_SECRET_ACCESS_KEY: string;
  private R2_BUCKET_NAME: string;
  private R2_PUBLIC_URL: string;

  constructor() {
    this.R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '859b914602758e51e4e66a197332af8e';
    this.R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '54ce13cb81647071f3fa0566e2b5ff14';
    this.R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '70f4fa673338ad54d7a759a2ff03207084685c463d3a22f5ce4835e98173e9f4';
    this.R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'book8';
    this.R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-125e671ed2684c31b6801d4f5ad5bf20.r2.dev';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.R2_ACCESS_KEY_ID,
        secretAccessKey: this.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Buffer, originalName: string, mimeType: string, folder: string = 'images'): Promise<string> {
    try {
      // Generate a unique filename
      const ext = originalName.split('.').pop();
      const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const command = new PutObjectCommand({
        Bucket: this.R2_BUCKET_NAME,
        Key: uniqueName,
        Body: file,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      // Return the public URL
      return `${this.R2_PUBLIC_URL}/${uniqueName}`;
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw new Error('Failed to upload file to R2 storage');
    }
  }

  async deleteFile(url: string): Promise<void> {
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
      throw new Error('Failed to delete file from R2 storage');
    }
  }

  validateFile(file: Express.Multer.File, allowedTypes: string[] = [], maxSize: number = 100 * 1024 * 1024): boolean {
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
    }

    return true;
  }
}

export const r2Service = new CloudflareR2Service();
