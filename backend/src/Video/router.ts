import express from 'express';
import * as videoController from './controller';

const videoRouter = express.Router();

// Route to add a new video
videoRouter.post('/', videoController.addVideo);

// Route to get all videos
videoRouter.get('/', videoController.getAllVideos);

// Route to get videos by category
videoRouter.get('/category/:category', videoController.getVideosByCategory);

// Route to delete a video
videoRouter.delete('/:id', videoController.deleteVideo);

export default videoRouter;
