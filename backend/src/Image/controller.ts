import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getAllImages = async (req: Request, res: Response) => {
  try {    
    const { ageGroup } = req.query;
    const category = req.params.category || req.query.category;
    const images = await prisma.images.findMany({
      where: {
        AND: [
          ageGroup ? { ageGroup: String(ageGroup) } : {},
          category ? { category: String(category) } : {}
        ]
      },
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

    // Validate ID parameter
    const imageId = Number(id);
    if (isNaN(imageId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid image ID provided',
        message: 'Image ID must be a valid number'
      });
    }

    // Check if image exists
    const existingImage = await prisma.images.findUnique({
      where: { id: imageId },
    });

    if (!existingImage) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found',
        message: 'The requested image does not exist'
      });
    }

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        message: 'Title is required and cannot be empty'
      });
    }

    if (!imageUrl || imageUrl.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        message: 'Image URL is required and cannot be empty'
      });
    }

    // Prepare update data with only provided fields
    const updateData: any = {
      updatedAt: new Date() // Always update the timestamp
    };

    // Only update fields that are provided and not null/undefined
    if (imageUrl) updateData.imageUrl = imageUrl.trim();
    if (title) updateData.title = title.trim();
    if (category !== undefined) updateData.category = category ? category.trim() : null;
    if (position !== undefined) updateData.position = position;
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (ageGroup !== undefined) updateData.ageGroup = ageGroup ? ageGroup.trim() : null;
    if (name !== undefined) updateData.name = name ? name.trim() : null;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail ? thumbnail.trim() : null;

    // Perform the update
    const updatedImage = await prisma.images.update({
      where: { id: imageId },
      data: updateData,
    });

    // Return success response with updated data
    res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      data: updatedImage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating image:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return res.status(404).json({
          success: false,
          error: 'Image not found',
          message: 'The image you are trying to update no longer exists'
        });
      }
      
      if (error.message.includes('Unique constraint')) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'An image with similar data already exists'
        });
      }
    }
    
    // Generic error response
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to update image. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate ID parameter
    const imageId = Number(id);
    if (isNaN(imageId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid image ID provided',
        message: 'Image ID must be a valid number'
      });
    }

    // Check if image exists
    const existingImage = await prisma.images.findUnique({
      where: { id: imageId },
    });

    if (!existingImage) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found',
        message: 'The requested image does not exist'
      });
    }

    // Delete the image
    await prisma.images.delete({
      where: { id: imageId },
    });
    
    res.status(200).json({ 
      success: true,
      message: 'Image deleted successfully',
      data: { id: imageId },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error deleting image:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
        message: 'The image you are trying to delete no longer exists'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete image. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    });
  }
};