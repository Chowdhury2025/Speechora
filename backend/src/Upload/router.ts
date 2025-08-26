import express from 'express';
import multer from 'multer';
import { uploadFile, deleteFile } from './controller';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (_req, _file, cb) => {
    // Allow all file types - validation will be done in the controller
    cb(null, true);
  }
});

// File upload endpoint
router.post('/upload', upload.single('file'), uploadFile);

// File delete endpoint
router.delete('/delete', deleteFile);

export default router;
