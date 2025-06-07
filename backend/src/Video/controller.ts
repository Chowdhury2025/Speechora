import { Request, Response } from 'express';
import { prisma } from '../../config/db';

// Add a new video
export const addVideo = async (req: Request, res: Response) => {
    try {
        const { title, linkyoutube_link, category, description, ageGroup, name } = req.body;

        // Validate required fields
        if (!title || !linkyoutube_link) {
            return res.status(400).json({ message: 'Title and YouTube link are required' });
        }

        // Create new video
        const video = await prisma.videos.create({
            data: {
                title,
                linkyoutube_link,
                category,
                description,
                ageGroup,
                name,
            },
        });

        res.status(201).json({ message: 'Video added successfully', video });
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(500).json({ message: 'Failed to add video' });
    }
};

// Get all videos
export const getAllVideos = async (_req: Request, res: Response) => {
    try {
        const videos = await prisma.videos.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Failed to fetch videos' });
    }
};

// Get videos by category
export const getVideosByCategory = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const videos = await prisma.videos.findMany({
            where: {
                category: category,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos by category:', error);
        res.status(500).json({ message: 'Failed to fetch videos' });
    }
};

// Delete video
export const deleteVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.videos.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Failed to delete video' });
    }
};
