import axios from 'axios';

class BackendUploadService {
  constructor() {
    // Get API URL from environment or use default
    this.API_URL = import.meta.env.VITE_APP_URL || 'http://localhost:8000';
  }

  async uploadFile(file, folder = 'images') {
    try {
      // Create FormData to send file to backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Send to backend upload endpoint
      const response = await axios.post(`${this.API_URL}/api/upload/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data.url;
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Upload failed');
      }
      throw new Error('Upload failed');
    }
  }

  async deleteFile(url) {
    try {
      const response = await axios.delete(`${this.API_URL}/api/upload/delete`, {
        data: { url }
      });

      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Delete failed');
      }
      throw new Error('Delete failed');
    }
  }

  // Simple client-side validation (backend will do the real validation)
  validateFile(file, allowedTypes = [], maxSize = 10 * 1024 * 1024) {
    if (file.size > maxSize) {
      throw new Error('File too large');
    }
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed');
    }
    return true;
  }
}

export const backendUploadService = new BackendUploadService();
