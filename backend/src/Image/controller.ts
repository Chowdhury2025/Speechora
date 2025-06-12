import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getAllImages = async (req: Request, res: Response) => {
  try {
    const { ageGroup } = req.query;
    const images = await prisma.images.findMany({
      where: ageGroup ? { ageGroup: String(ageGroup) } : undefined,
      orderBy: { position: 'asc' },
    });
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
};

export const getImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = await prisma.images.findUnique({
      where: { id: Number(id) },
    });
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
};

export const createImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl, title, thumbnail, category, position, description, ageGroup, name } = req.body;

    const image = await prisma.images.create({
      data: {
        imageUrl,
        title,
        thumbnail,
        category,
        position,
        description,
        ageGroup,
        name,
      },
    });
    res.status(201).json(image);
  } catch (error) {
    console.error('Error creating image:', error);
    res.status(500).json({ error: 'Failed to create image' });
  }
};

export const updateImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { imageUrl, title, thumbnail, category, position, description, ageGroup, name } = req.body;

    const existingImage = await prisma.images.findUnique({
      where: { id: Number(id) },
    });

    if (!existingImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    

    const updatedImage = await prisma.images.update({
      where: { id: Number(id) },
      data: {
        imageUrl,
        title,
        thumbnail,
        category,
        position,
        description,
        ageGroup,
        name,
      },
    });
    res.json(updatedImage);
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingImage = await prisma.images.findUnique({
      where: { id: Number(id) },
    });

    if (!existingImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

  
    

    await prisma.images.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};
