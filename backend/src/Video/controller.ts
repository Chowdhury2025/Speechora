import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

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
export const getVideosByCategoryController = async (req: Request, res: Response) => {
    try {
        console.log('Request body:', req.body);
        const { category } = req.body;

        if (!category) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Category is required in request body"
            });
        }

        // First, let's check what categories exist in the database
        const allCategories = await prisma.videos.findMany({
            select: {
                category: true
            },
            distinct: ['category']
        });
        console.log('Available categories in DB:', allCategories);

        const videos = await prisma.videos.findMany({
            where: {
                category: category
            },
            orderBy: {
                position: 'asc'
            }
        });
        console.log('Found videos:', videos.length);

        return res.status(StatusCodes.OK).json(videos);
    } catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch videos",
            error: error?.stack || error?.message || error,
        });
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

// Get all unique video categories
export const getAllVideoCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await prisma.videos.findMany({
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' },
        });
        // Return as a flat array of strings, filtering out null/empty
        const categoryList = categories
            .map(c => c.category)
            .filter((c): c is string => !!c && c.trim() !== '');
        res.json(categoryList);
    } catch (error) {
        console.error('Error fetching video categories:', error);
        res.status(500).json({ message: 'Failed to fetch video categories' });
    }
};
