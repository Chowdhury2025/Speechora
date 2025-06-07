import { Request, Response } from 'express';
import { prisma } from '../../config/db';

// Add a new videos
export const addvideos = async (req: Request, res: Response) => {
    try {
        const { title, linkyoutube_link, category, description, ageGroup, name } = req.body;

        // Validate required fields
        if (!title || !linkyoutube_link) {
            return res.status(400).json({ message: 'Title and YouTube link are required' });
        }

        // Create new videos
        const videos = await prisma.videos.create({
            data: {
                title,
                linkyoutube_link,
                category,
                description,
                ageGroup,
                name,
            },
        });

        res.status(201).json({ message: 'videos added successfully', videos });
    } catch (error) {
        console.error('Error adding videos:', error);
        res.status(500).json({ message: 'Failed to add videos' });
    }
};

// Get all videoss
export const getAllvideoss = async (req: Request, res: Response) => {
    try {
        const videoss = await prisma.videos.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(videoss);
    } catch (error) {
        console.error('Error fetching videoss:', error);
        res.status(500).json({ message: 'Failed to fetch videoss' });
    }
};

// Get videoss by category
export const getvideossByCategory = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const videoss = await prisma.videos.findMany({
            where: {
                category: category,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(videoss);
    } catch (error) {
        console.error('Error fetching videoss by category:', error);
        res.status(500).json({ message: 'Failed to fetch videoss' });
    }
};

// Delete videos
export const deletevideos = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.videos.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.json({ message: 'videos deleted successfully' });
    } catch (error) {
        console.error('Error deleting videos:', error);
        res.status(500).json({ message: 'Failed to delete videos' });
    }
};
