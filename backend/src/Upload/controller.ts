import { Request, Response } from 'express';
import { r2Service } from '../utils/r2Service';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
        message: 'Please select a file to upload'
      });
    }

    // Get folder from request body or default to 'images'
    const folder = req.body.folder || 'images';

    // Validate file based on folder type
    let allowedTypes: string[] = [];
    let maxSize = 5 * 1024 * 1024; // 5MB default

    switch (folder) {
      case 'images':
      case 'lessons':
      case 'options':
      case 'quiz-images':
      case 'presentation3':
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        maxSize = 5 * 1024 * 1024; // 5MB
        break;
      case 'videos':
        allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
        maxSize = 100 * 1024 * 1024; // 100MB
        break;
      default:
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    }

    // Validate the file
    r2Service.validateFile(req.file, allowedTypes, maxSize);

    // Upload to R2
    const fileUrl = await r2Service.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        folder: folder
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'No URL provided',
        message: 'Please provide a file URL to delete'
      });
    }

    // Delete from R2
    await r2Service.deleteFile(url);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Delete failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};
