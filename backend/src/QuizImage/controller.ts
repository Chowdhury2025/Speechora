import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function createQuizImage(req: Request, res: Response) {
  try {    
    const { imageUrl, name, category, ageGroup, quizTypes, userId } = req.body;

    // Validate quiz types
    if (!Array.isArray(quizTypes) || quizTypes.length === 0) {
      return res.status(400).json({ error: 'At least one quiz type must be specified' });
    }

    // Validate each quiz type is valid
    const validQuizTypes = ['image_quiz', 'true_false'];
    const invalidTypes = quizTypes.filter(type => !validQuizTypes.includes(type));
    if (invalidTypes.length > 0) {
      return res.status(400).json({ 
        error: `Invalid quiz types: ${invalidTypes.join(', ')}. Valid types are: ${validQuizTypes.join(', ')}` 
      });
    }

    const quizImage = await prisma.quizImage.create({
      data: {
        imageUrl,
        name,
        category,
        ageGroup,
        quizTypes,
        userId,
      },
    });

    res.status(201).json(quizImage);
  } catch (error) {
    handleError(res, error);
  }
}

export async function getQuizImages(req: Request, res: Response) {
  try {    const { category, ageGroup, quizType } = req.query;

    const where: any = {
      isActive: true,
    };

    if (category) where.category = category;
    if (ageGroup) where.ageGroup = ageGroup;    if (quizType) {
      where.quizTypes = {
        has: quizType as string
      };
    }

    const quizImages = await prisma.quizImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(quizImages);
  } catch (error) {
    handleError(res, error);
  }
}

export async function getQuizImageById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const quizImage = await prisma.quizImage.findUnique({
      where: { id: parseInt(id) },
    });

    if (!quizImage) {
      return res.status(404).json({ error: 'Quiz image not found' });
    }

    res.json(quizImage);
  } catch (error) {
    handleError(res, error);
  }
}

export async function updateQuizImage(req: Request, res: Response) {
  try {    const { id } = req.params;    const { imageUrl, name, category, ageGroup, isActive, userId, quizTypes } = req.body;

    // Validate quiz types if they're being updated
    if (quizTypes !== undefined) {
      if (!Array.isArray(quizTypes) || quizTypes.length === 0) {
        return res.status(400).json({ error: 'At least one quiz type must be specified' });
      }

      // Validate each quiz type is valid
      const validQuizTypes = ['image_quiz', 'true_false'];
      const invalidTypes = quizTypes.filter(type => !validQuizTypes.includes(type));
      if (invalidTypes.length > 0) {
        return res.status(400).json({ 
          error: `Invalid quiz types: ${invalidTypes.join(', ')}. Valid types are: ${validQuizTypes.join(', ')}` 
        });
      }
    }

    const quizImage = await prisma.quizImage.update({
      where: { id: parseInt(id) },
      data: {
        imageUrl,
        name,
        category,
        ageGroup,
        isActive,
        userId,
        quizTypes,
      },
    });

    res.json(quizImage);
  } catch (error) {
    handleError(res, error);
  }
}

export async function deleteQuizImage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.quizImage.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
}

const handleError = (res: Response, error: unknown) => {
    console.error('Error in QuizImage controller:', error);
    
    if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'An unexpected error occurred' });
};

