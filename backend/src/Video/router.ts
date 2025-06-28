import express from 'express';
import * as videoController from './controller';

const videoRouter = express.Router();

// Route to add a new video
videoRouter.post('/', videoController.addVideo);

// Route to get all videos
videoRouter.get('/', videoController.getAllVideos);

// Route to get videos by category
// videoRouter.post('/category', videoController.getVideosByCategory);
videoRouter.post('/category', videoController.getVideosByCategoryController);

// Route to delete a video
videoRouter.delete('/:id', videoController.deleteVideo);

// Route to get all video categories
videoRouter.get('/categories', videoController.getAllVideoCategories);

export default videoRouter;
