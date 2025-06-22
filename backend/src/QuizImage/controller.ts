import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function createQuizImage(req: Request, res: Response) {
  try {    const { imageUrl, name, category, ageGroup, quizType, userId } = req.body;

    const quizImage = await prisma.quizImage.create({
      data: {
        imageUrl,
        name,
        category,
        ageGroup,
        quizType,
        userId,
      },
    });

    res.status(201).json(quizImage);
  } catch (error) {
    handleError(res, error);
  }
}

export async function getQuizImages(req: Request, res: Response) {
  try {
    const { category, ageGroup, quizType } = req.query;

    const where: any = {
      isActive: true,
    };

    if (category) where.category = category;
    if (ageGroup) where.ageGroup = ageGroup;
    if (quizType) where.quizType = quizType;

    const quizImages = await prisma.quizImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(quizImages);
  } catch (error) {
    handleError(res, error);
  }
}

export async function updateQuizImage(req: Request, res: Response) {
  try {    const { id } = req.params;
    const { imageUrl, name, category, ageGroup, isActive, userId } = req.body;

    const quizImage = await prisma.quizImage.update({
      where: { id: parseInt(id) },
      data: {
        imageUrl,
        name,
        category,
        ageGroup,
        isActive,
        userId,
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

