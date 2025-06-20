import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



export const createLesson = async (req: Request, res: Response) => {
  try {
    const { title, description, subject, ageGroup, userId, statement, options, state } = req.body;

    // Validate required fields
    if (!title || !subject || !ageGroup) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'title, subject, and ageGroup are required fields',
        state: state || { currentScreen: 'basic-info' }
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        error: 'userId is required',
        details: 'A valid userId must be provided to create a lesson. Please ensure you are logged in and your session is valid.',
        state: state || { currentScreen: 'basic-info' }
      });
    }

    if (!statement) {
      return res.status(400).json({ 
        error: 'statement is required',
        details: 'A statement is required for the lesson content',
        state: { ...state, currentScreen: 'content' }
      });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        error: 'At least two options are required',
        details: 'Lesson must have at least two options for students to explore',
        state: { ...state, currentScreen: 'options' }
      });
    }

    // Convert userId to number and validate
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({
        error: 'Invalid userId format',
        details: 'userId must be a valid number',
        state: state || { currentScreen: 'basic-info' }
      });
    }

    // Find the user first to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        details: `No user found with ID: ${userId}. Please ensure you are using a valid user ID.`,
        state: state || { currentScreen: 'basic-info' }
      });
    }

    // Create the lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: String(title),
        description: description ? String(description) : '',
        subject: String(subject),
        ageGroup: String(ageGroup),
        statement: statement,
        options: options,
        userId: userIdNum,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json({
      ...lesson,
      state: { currentScreen: 'success' }
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({
      error: 'Failed to create lesson',
      details: error instanceof Error ? error.message : String(error),
      state: req.body.state || { currentScreen: 'basic-info' }
    });
  }
};

export const getLessons = async (req: Request, res: Response) => {
  try {
    const { subject, ageGroup } = req.query;
    
    let where = {};
    if (subject) {
      where = { ...where, subject: String(subject) };
    }
    if (ageGroup) {
      where = { ...where, ageGroup: String(ageGroup) };
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json({
      lessons,
      state: { currentScreen: 'list' }
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lessons',
      state: { currentScreen: 'list' }
    });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ 
        error: 'Lesson not found',
        state: { currentScreen: 'not-found' }
      });
    }

    res.json({
      ...lesson,
      state: { currentScreen: 'view' }
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lesson',
      state: { currentScreen: 'error' }
    });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, subject, ageGroup, statement, options, state } = req.body;

    // Validate options if provided
    if (options && (!Array.isArray(options) || options.length < 2)) {
      return res.status(400).json({ 
        error: 'At least two options are required',
        details: 'Lesson must have at least two options for students to explore',
        state: { ...state, currentScreen: 'options' }
      });
    }

    // Find the lesson first to ensure it exists
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingLesson) {
      return res.status(404).json({
        error: 'Lesson not found',
        details: `No lesson found with ID: ${id}`,
        state: state || { currentScreen: 'basic-info' }
      });
    }

    const lesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: {
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        subject: subject || undefined,
        ageGroup: ageGroup || undefined,
        statement: statement || undefined,
        options: options || undefined,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json({
      ...lesson,
      state: { currentScreen: 'success' }
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ 
      error: 'Failed to update lesson',
      details: error instanceof Error ? error.message : String(error),
      state: req.body.state || { currentScreen: 'basic-info' }
    });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    // Check if lesson exists first
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) }
    });

    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found',
        details: `No lesson found with ID: ${id}`,
        state: state || { currentScreen: 'list' }
      });
    }

    await prisma.lesson.delete({
      where: { id: parseInt(id) },
    });

    res.json({ 
      message: 'Lesson deleted successfully',
      state: { currentScreen: 'list' }
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ 
      error: 'Failed to delete lesson',
      details: error instanceof Error ? error.message : String(error),
      state: req.body.state || { currentScreen: 'list' }
    });
  }
};

// Add a new endpoint to validate lesson state transitions
export const validateLessonState = async (req: Request, res: Response) => {
  const { state, data } = req.body;
  
  try {
    switch (state.currentScreen) {
      case 'basic-info':
        if (!data.title || !data.subject || !data.ageGroup) {
          return res.status(400).json({
            error: 'Missing required fields',
            details: 'Title, subject, and age group are required',
            state
          });
        }
        return res.json({
          state: { currentScreen: 'content' },
          data
        });

      case 'content':
        if (!data.statement) {
          return res.status(400).json({
            error: 'Missing content',
            details: 'Lesson statement is required',
            state
          });
        }
        return res.json({
          state: { currentScreen: 'options' },
          data
        });

      case 'options':
        if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
          return res.status(400).json({
            error: 'Invalid options',
            details: 'At least two options are required',
            state
          });
        }
        return res.json({
          state: { currentScreen: 'review' },
          data
        });

      case 'review':
        // For review step, we validate all required fields are present
        if (!data.title || !data.subject || !data.ageGroup || !data.statement || 
            !data.options || !Array.isArray(data.options) || data.options.length < 2) {
          return res.status(400).json({
            error: 'Missing required fields',
            details: 'Please ensure all required fields are filled out',
            state
          });
        }
        return res.json({
          state: { currentScreen: 'complete' },
          data
        });

      default:
        return res.status(400).json({
          error: 'Invalid state',
          details: 'Unknown screen state',
          state: { currentScreen: 'basic-info' }
        });
    }
  } catch (error) {
    console.error('Error validating lesson state:', error);
    res.status(500).json({
      error: 'Failed to validate lesson state',
      details: error instanceof Error ? error.message : String(error),
      state: { currentScreen: 'basic-info' }
    });
  }
};