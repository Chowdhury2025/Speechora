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
    }    // Validate statement structure
    if (typeof statement !== 'object' || !statement.type || !statement.content) {
      return res.status(400).json({
        error: 'Invalid statement format',
        details: 'Statement must be an object with type and content properties',
        state: { ...state, currentScreen: 'content' }
      });
    }

    // Validate options structure
    if (!Array.isArray(options) || !options.every(opt => 
      typeof opt === 'object' && opt.type && 'content' in opt)) {
      return res.status(400).json({
        error: 'Invalid options format',
        details: 'Each option must be an object with type and content properties',
        state: { ...state, currentScreen: 'options' }
      });
    }

    // Create the lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: String(title),
        description: description ? String(description) : '',
        subject: String(subject),
        ageGroup: String(ageGroup),
        statement: JSON.stringify(statement), // Convert statement object to JSON string
        options: JSON.stringify(options),     // Convert options array to JSON string
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
    });    // Parse JSON strings back into objects for each lesson
    const parsedLessons = lessons.map(lesson => {
      try {
        let parsedStatement = null;
        let parsedOptions = [];

        // Safely parse statement
        if (lesson.statement) {
          try {
            parsedStatement = JSON.parse(lesson.statement as string);
          } catch (e) {
            console.warn(`Failed to parse statement for lesson ${lesson.id}:`, e);
            // If parsing fails, treat it as a plain text statement
            parsedStatement = {
              type: 'text',
              content: lesson.statement,
              description: ''
            };
          }
        }

        // Safely parse options
        if (lesson.options) {
          try {
            parsedOptions = JSON.parse(lesson.options as string);
          } catch (e) {
            console.warn(`Failed to parse options for lesson ${lesson.id}:`, e);
            // If parsing fails, treat it as a single text option
            parsedOptions = [{
              type: 'text',
              content: lesson.options,
              description: ''
            }];
          }
        }

        return {
          ...lesson,
          statement: parsedStatement,
          options: parsedOptions
        };
      } catch (e) {
        console.error(`Error processing lesson ${lesson.id}:`, e);
        // Return the lesson with unparsed data as fallback
        return lesson;
      }
    });

    res.json({
      lessons: parsedLessons,
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
    }    // Parse JSON strings back into objects
    let parsedStatement = null;
    let parsedOptions = [];

    // Safely parse statement
    if (lesson.statement) {
      try {
        parsedStatement = JSON.parse(lesson.statement as string);
      } catch (e) {
        console.warn(`Failed to parse statement for lesson ${lesson.id}:`, e);
        // If parsing fails, treat it as a plain text statement
        parsedStatement = {
          type: 'text',
          content: lesson.statement,
          description: ''
        };
      }
    }

    // Safely parse options
    if (lesson.options) {
      try {
        parsedOptions = JSON.parse(lesson.options as string);
      } catch (e) {
        console.warn(`Failed to parse options for lesson ${lesson.id}:`, e);
        // If parsing fails, treat it as a single text option
        parsedOptions = [{
          type: 'text',
          content: lesson.options,
          description: ''
        }];
      }
    }

    const parsedLesson = {
      ...lesson,
      statement: parsedStatement,
      options: parsedOptions
    };

    res.json({
      ...parsedLesson,
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
    }    const lesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: {
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        subject: subject || undefined,
        ageGroup: ageGroup || undefined,
        statement: statement ? JSON.stringify(statement) : undefined,
        options: options ? JSON.stringify(options) : undefined,
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

    // Parse the JSON fields back into objects for the response
    const parsedLesson = {
      ...lesson,
      statement: lesson.statement ? JSON.parse(lesson.statement as string) : null,
      options: lesson.options ? JSON.parse(lesson.options as string) : []
    };

    res.json({
      ...parsedLesson,
      state: { currentScreen: 'success' }
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

export const getLessonsBySubject = async (req: Request, res: Response) => {
  try {
    const { subject } = req.params;
    
    // Validate subject parameter
    if (!subject) {
      return res.status(400).json({
        error: 'Subject parameter is required',
        state: { currentScreen: 'list' }
      });
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        subject: subject
      },
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

    // Transform the statement and options from JSON to objects
    const transformedLessons = lessons.map(lesson => ({
      ...lesson,
      statement: typeof lesson.statement === 'string' ? JSON.parse(lesson.statement as string) : lesson.statement,
      options: typeof lesson.options === 'string' ? JSON.parse(lesson.options as string) : lesson.options,
    }));

    res.json({
      lessons: transformedLessons,
      state: { currentScreen: 'list' }
    });
  } catch (error) {
    console.error('Error fetching lessons by subject:', error);
    res.status(500).json({
      error: 'Failed to fetch lessons',
      details: error instanceof Error ? error.message : String(error),
      state: { currentScreen: 'list' }
    });
  }
};