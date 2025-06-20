import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTest = async (req: Request, res: Response) => {
  try {
    const { title, description, subject, ageGroup, userId } = req.body;

    // Validate required fields
    if (!title || !subject || !ageGroup) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'title, subject, and ageGroup are required fields'
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        error: 'userId is required',
        details: 'A valid userId must be provided to create a test. Please ensure you are logged in and your session is valid.'
      });
    }

    // Convert userId to number and validate
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        error: 'Invalid userId format',
        details: 'userId must be a valid number'
      });
    }

    // Find the user first to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        details: `No user found with ID: ${userId}. Please ensure you are using a valid user ID.`
      });
    }

    // Create the test with proper data structure
    const test = await prisma.test.create({
      data: {
        title: String(title),
        description: description ? String(description) : '',
        subject: String(subject),
        ageGroup: String(ageGroup),
        userId: userIdNum,
      },
      include: {
        questions: {
          include: {
            choices: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json(test);
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({
      error: 'Failed to create test',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getTests = async (_req: Request, res: Response) => {
  try {
    const tests = await prisma.test.findMany({
      include: {
        questions: {
          include: {
            choices: true,
          },
        },
      },
    });

    res.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

export const getTestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const test = await prisma.test.findUnique({
      where: { id: parseInt(id) },
      include: {
        questions: {
          include: {
            choices: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
};

export const updateTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, subject, ageGroup } = req.body;

    const test = await prisma.test.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        subject,
        ageGroup,
      },
      include: {
        questions: {
          include: {
            choices: true,
          },
        },
      },
    });

    res.json(test);
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
};

export const deleteTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.test.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
};

export const addQuestion = async (req: Request, res: Response) => {
  try {
    const { testId, questionType, questionText, questionMediaUrl, explanation, difficulty, choices } = req.body;

    if (!testId) {
      return res.status(400).json({ error: 'testId is required' });
    }

    if (!choices || !Array.isArray(choices)) {
      return res.status(400).json({ error: 'choices must be an array' });
    }

    // Validate that at least one choice is marked as correct
    const hasCorrectAnswer = choices.some(choice => choice.isCorrect);
    if (!hasCorrectAnswer) {
      return res.status(400).json({ error: 'At least one choice must be marked as correct' });
    }

    const question = await prisma.question.create({
      data: {
        questionType: questionType || 'TEXT',
        questionText: questionText || '',
        questionMediaUrl: questionMediaUrl || '',
        explanation: explanation || '',
        difficulty: difficulty || 'MEDIUM',
        testId: Number(testId),
        choices: {
          create: choices.map((c: any) => ({
            choiceType: c.choiceType || 'TEXT',
            choiceText: c.choiceText || '',
            choiceMediaUrl: c.choiceMediaUrl || '',
            isCorrect: Boolean(c.isCorrect),
          })),
        },
      },
      include: {
        choices: true,
      },
    });

    res.json(question);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ 
      error: 'Failed to add question',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getQuestions = async (_req: Request, res: Response) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        choices: true,
        test: {
          select: {
            title: true,
            subject: true,
            ageGroup: true
          }
        }
      }
    });

    res.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { questionText, questionType, explanation, difficulty, choices } = req.body;

    // Validate question ID
    if (!id) {
      return res.status(400).json({
        error: 'Question ID is required',
        details: 'A valid question ID must be provided to update the question'
      });
    }

    // First, update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: Number(id) },
      data: {
        questionText: questionText || undefined,
        questionType: questionType || undefined,
        explanation: explanation || undefined,
        difficulty: difficulty || undefined,
      },
      include: {
        choices: true
      }
    });

    // If choices are provided, update them
    if (choices && Array.isArray(choices)) {
      // Update or create each choice
      for (const choice of choices) {
        if (choice.id) {
          // Update existing choice
          await prisma.choice.update({
            where: { id: choice.id },
            data: {
              choiceText: choice.choiceText,
              choiceType: choice.choiceType || 'TEXT',
              choiceMediaUrl: choice.choiceMediaUrl || '',
              isCorrect: choice.isCorrect
            }
          });
        } else {
          // Create new choice
          await prisma.choice.create({
            data: {
              choiceText: choice.choiceText,
              choiceType: choice.choiceType || 'TEXT',
              choiceMediaUrl: choice.choiceMediaUrl || '',
              isCorrect: choice.isCorrect,
              questionId: updatedQuestion.id
            }
          });
        }
      }
    }

    // Fetch the updated question with all its choices
    const finalQuestion = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: {
        choices: true
      }
    });

    res.json(finalQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      error: 'Failed to update question',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
