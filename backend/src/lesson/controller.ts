import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TranslationService } from '../services/translationService';

const prisma = new PrismaClient();
const translationService = TranslationService.getInstance();

interface LessonContent {
  type: string;
  content: string;
  description?: string;
}

interface LessonTranslationEntry {
  title?: string;
  description?: string | null;
  statement?: LessonContent | null;
  options?: LessonContent[];
}

type LessonTranslations = Record<string, LessonTranslationEntry>;

const cloneContent = (content: LessonContent | null | undefined): LessonContent | null => {
  if (!content) {
    return null;
  }
  const { type, content: value, description } = content;
  return {
    type,
    content: value,
    ...(description !== undefined ? { description } : {}),
  };
};

const cloneOptions = (options: LessonContent[]): LessonContent[] =>
  options.map(option => ({ ...option }));

const normalizeLanguageParam = (value: unknown, fallback = 'en'): string => {
  if (!value) {
    return fallback;
  }
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' && first ? first : fallback;
  }
  if (typeof value === 'string') {
    return value || fallback;
  }
  return fallback;
};

const parseLessonContent = (raw: unknown): LessonContent | null => {
  if (raw == null) {
    return null;
  }

  const hydrate = (value: any): LessonContent | null => {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const { type, content, description } = value as Record<string, unknown>;
    if (!type || content === undefined || content === null) {
      return null;
    }

    return {
      type: String(type),
      content: typeof content === 'string' ? content : String(content),
      ...(description !== undefined && description !== null
        ? { description: String(description) }
        : {}),
    };
  };

  if (typeof raw === 'string') {
    try {
      return hydrate(JSON.parse(raw));
    } catch {
      return {
        type: 'text',
        content: raw,
      };
    }
  }

  return hydrate(raw);
};

const parseLessonOptions = (raw: unknown): LessonContent[] => {
  if (raw == null) {
    return [];
  }

  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return (data as unknown[])
    .map(option => parseLessonContent(option))
    .filter((option): option is LessonContent => option !== null);
};

const parseTranslations = (raw: unknown): LessonTranslations => {
  if (!raw) {
    return {};
  }

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as LessonTranslations;
    } catch {
      return {};
    }
  }

  return raw as LessonTranslations;
};

const shouldTranslate = (content: LessonContent | null): boolean => {
  if (!content) {
    return false;
  }

  return content.type === 'text' && typeof content.content === 'string' && content.content.trim().length > 0;
};

const shouldTranslateText = (text?: string | null): text is string => !!text && text.trim().length > 0;

const createBaseTranslationEntry = (
  title: string,
  description: string | undefined,
  statement: LessonContent | null,
  options: LessonContent[],
): LessonTranslationEntry => ({
  title,
  description: description ?? null,
  statement: statement ? { ...statement } : null,
  options: cloneOptions(options),
});

const generateLessonTranslations = async (
  title: string,
  description: string | undefined,
  statement: LessonContent | null,
  options: LessonContent[],
  sourceLanguage: string,
): Promise<LessonTranslations> => {
  const baseEntry = createBaseTranslationEntry(title, description, statement, options);

  if (!translationService.isConfigured()) {
    return { [sourceLanguage]: baseEntry };
  }

  const languages = new Set<string>([sourceLanguage]);

  const titlePromise = shouldTranslateText(title)
    ? translationService.translateToMultipleLanguages(title, sourceLanguage)
    : Promise.resolve<Record<string, string>>({ [sourceLanguage]: title });

  const descriptionPromise = shouldTranslateText(description)
    ? translationService.translateToMultipleLanguages(description!, sourceLanguage)
    : Promise.resolve<Record<string, string>>({});

  const statementContentPromise = shouldTranslate(statement)
    ? translationService.translateToMultipleLanguages(statement!.content, sourceLanguage)
    : Promise.resolve<Record<string, string>>({});

  const statementDescriptionPromise = shouldTranslateText(statement?.description)
    ? translationService.translateToMultipleLanguages(statement!.description!, sourceLanguage)
    : Promise.resolve<Record<string, string>>({});

  const optionPromises = options.map(async option => {
    const contentTranslations = shouldTranslate(option)
      ? await translationService.translateToMultipleLanguages(option.content, sourceLanguage)
      : {};

    const descriptionTranslations = shouldTranslateText(option.description)
      ? await translationService.translateToMultipleLanguages(option.description!, sourceLanguage)
      : {};

    return {
      contentTranslations,
      descriptionTranslations,
    };
  });

  const [
    titleTranslations,
    descriptionTranslations,
    statementContentTranslations,
    statementDescriptionTranslations,
    optionTranslations,
  ] = await Promise.all([
    titlePromise,
    descriptionPromise,
    statementContentPromise,
    statementDescriptionPromise,
    Promise.all(optionPromises),
  ]);

  const registerLanguages = (translations: Record<string, string>) => {
    Object.keys(translations).forEach(language => {
      if (language) {
        languages.add(language);
      }
    });
  };

  registerLanguages(titleTranslations);
  registerLanguages(descriptionTranslations);
  registerLanguages(statementContentTranslations);
  registerLanguages(statementDescriptionTranslations);
  optionTranslations.forEach(result => {
    registerLanguages(result.contentTranslations);
    registerLanguages(result.descriptionTranslations);
  });

  const translations: LessonTranslations = {};

  languages.forEach(language => {
    const entry: LessonTranslationEntry = {
      title: titleTranslations[language] ?? title,
      description:
        descriptionTranslations[language] ??
        (language === sourceLanguage ? description ?? null : description ?? null),
      statement: statement
        ? {
            ...statement,
            content: shouldTranslate(statement)
              ? statementContentTranslations[language] ?? statement.content
              : statement.content,
            ...(statement.description !== undefined
              ? {
                  description: shouldTranslateText(statement.description)
                    ? statementDescriptionTranslations[language] ?? statement.description
                    : statement.description,
                }
              : {}),
          }
        : null,
      options: options.map((option, index) => {
        const { contentTranslations, descriptionTranslations } = optionTranslations[index];
        return {
          ...option,
          content: shouldTranslate(option)
            ? contentTranslations[language] ?? option.content
            : option.content,
          ...(option.description !== undefined
            ? {
                description: shouldTranslateText(option.description)
                  ? descriptionTranslations[language] ?? option.description
                  : option.description,
              }
            : {}),
        };
      }),
    };

    translations[language] = entry;
  });

  return translations;
};

const localizeLessonRecord = (lesson: any, requestedLanguage: string) => {
  const statement = parseLessonContent(lesson.statement) ?? null;
  const options = parseLessonOptions(lesson.options);
  const translations = parseTranslations(lesson.translations);
  const fallbackLanguage = lesson.language || 'en';
  const translationEntry =
    translations[requestedLanguage] || translations[fallbackLanguage] || translations['en'];

  const availableLanguages = Array.from(
    new Set([
      ...Object.keys(translations),
      fallbackLanguage,
    ]),
  ).filter(language => language);

  const { translations: _ignoredTranslations, ...rest } = lesson;

  return {
    ...rest,
    title: translationEntry?.title ?? lesson.title,
    description:
      translationEntry?.description ?? lesson.description ?? null,
    statement: translationEntry?.statement ? cloneContent(translationEntry.statement) : statement,
    options: translationEntry?.options ? cloneOptions(translationEntry.options) : options,
    availableLanguages: availableLanguages.length > 0 ? availableLanguages : [fallbackLanguage],
    currentLanguage: requestedLanguage,
  };
};

export const createLesson = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      subject,
      ageGroup,
      userId,
      statement,
      options,
      language: languageOverride,
      autoTranslate,
      state,
    } = req.body;

    if (!title || !subject || !ageGroup) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'title, subject, and ageGroup are required fields',
        state: state || { currentScreen: 'basic-info' },
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required',
        details: 'A valid userId must be provided to create a lesson. Please ensure you are logged in and your session is valid.',
        state: state || { currentScreen: 'basic-info' },
      });
    }

    const userIdNum = Number(userId);
    if (Number.isNaN(userIdNum)) {
      return res.status(400).json({
        error: 'Invalid userId format',
        details: 'userId must be a valid number',
        state: state || { currentScreen: 'basic-info' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        details: `No user found with ID: ${userId}. Please ensure you are using a valid user ID.`,
        state: state || { currentScreen: 'basic-info' },
      });
    }

    if (!statement) {
      return res.status(400).json({
        error: 'statement is required',
        details: 'A statement is required for the lesson content',
        state: { ...state, currentScreen: 'content' },
      });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        error: 'At least two options are required',
        details: 'Lesson must have at least two options for students to explore',
        state: { ...state, currentScreen: 'options' },
      });
    }

    if (typeof statement !== 'object' || !statement.type || !statement.content) {
      return res.status(400).json({
        error: 'Invalid statement format',
        details: 'Statement must be an object with type and content properties',
        state: { ...state, currentScreen: 'content' },
      });
    }

    if (!options.every(opt => typeof opt === 'object' && opt.type && 'content' in opt)) {
      return res.status(400).json({
        error: 'Invalid options format',
        details: 'Each option must be an object with type and content properties',
        state: { ...state, currentScreen: 'options' },
      });
    }

    const baseLanguage = normalizeLanguageParam(languageOverride, 'en');

    const parsedStatement = parseLessonContent(statement);
    if (!parsedStatement) {
      return res.status(400).json({
        error: 'Invalid statement content',
        details: 'Unable to process the provided statement object',
        state: { ...state, currentScreen: 'content' },
      });
    }

    const parsedOptions = parseLessonOptions(options);
    if (parsedOptions.length < 2) {
      return res.status(400).json({
        error: 'Invalid options content',
        details: 'Unable to process lesson options',
        state: { ...state, currentScreen: 'options' },
      });
    }

    const translations = autoTranslate === false
      ? { [baseLanguage]: createBaseTranslationEntry(String(title), description ? String(description) : undefined, parsedStatement, parsedOptions) }
      : await generateLessonTranslations(
          String(title),
          description ? String(description) : undefined,
          parsedStatement,
          parsedOptions,
          baseLanguage,
        );

    const createdLesson = await prisma.lesson.create({
      data: {
        title: String(title),
        description: description ? String(description) : '',
        subject: String(subject),
        ageGroup: String(ageGroup),
        statement: JSON.stringify(parsedStatement),
        options: JSON.stringify(parsedOptions),
        userId: userIdNum,
        language: baseLanguage,
        translations: translations as any,
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

    const localizedLesson = localizeLessonRecord(createdLesson, baseLanguage);

    res.json({
      ...localizedLesson,
      state: { currentScreen: 'success' },
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({
      error: 'Failed to create lesson',
      details: error instanceof Error ? error.message : String(error),
      state: req.body.state || { currentScreen: 'basic-info' },
    });
  }
};

export const getLessons = async (req: Request, res: Response) => {
  try {
    const { subject, ageGroup, language } = req.query;
    const requestedLanguage = normalizeLanguageParam(language, 'en');

    let where: Record<string, unknown> = {};
    if (subject) {
      where = { ...where, subject: String(subject) };
    }
    if (ageGroup) {
      where = { ...where, ageGroup: String(ageGroup) };
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    const localizedLessons = lessons.map(lesson => localizeLessonRecord(lesson, requestedLanguage));

    res.json({
      lessons: localizedLessons,
      state: { currentScreen: 'list' },
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      error: 'Failed to fetch lessons',
      state: { currentScreen: 'list' },
    });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestedLanguage = normalizeLanguageParam(req.query.language, 'en');

    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(id) },
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
        state: { currentScreen: 'not-found' },
      });
    }

    const localizedLesson = localizeLessonRecord(lesson, requestedLanguage);

    res.json({
      ...localizedLesson,
      state: { currentScreen: 'view' },
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      error: 'Failed to fetch lesson',
      state: { currentScreen: 'error' },
    });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      subject,
      ageGroup,
      statement,
      options,
      language: languageOverride,
      autoTranslate,
      state,
    } = req.body;

    if (options && (!Array.isArray(options) || options.length < 2)) {
      return res.status(400).json({
        error: 'At least two options are required',
        details: 'Lesson must have at least two options for students to explore',
        state: { ...state, currentScreen: 'options' },
      });
    }

    const lessonId = Number(id);
    if (Number.isNaN(lessonId)) {
      return res.status(400).json({
        error: 'Invalid lesson ID',
        details: 'Lesson ID must be a valid number',
        state: state || { currentScreen: 'basic-info' },
      });
    }

    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!existingLesson) {
      return res.status(404).json({
        error: 'Lesson not found',
        details: `No lesson found with ID: ${id}`,
        state: state || { currentScreen: 'basic-info' },
      });
    }

    const baseLanguage = normalizeLanguageParam(languageOverride, existingLesson.language || 'en');

    const parsedStatement =
      statement !== undefined
        ? parseLessonContent(statement)
        : parseLessonContent(existingLesson.statement);

    if (statement !== undefined && !parsedStatement) {
      return res.status(400).json({
        error: 'Invalid statement content',
        details: 'Unable to process the provided statement object',
        state: { ...state, currentScreen: 'content' },
      });
    }

    const parsedOptions =
      options !== undefined
        ? parseLessonOptions(options)
        : parseLessonOptions(existingLesson.options);

    if (options !== undefined && parsedOptions.length < 2) {
      return res.status(400).json({
        error: 'Invalid options content',
        details: 'Unable to process lesson options',
        state: { ...state, currentScreen: 'options' },
      });
    }

    const nextTitle = title !== undefined ? String(title) : existingLesson.title;
    const nextDescription = description !== undefined ? (description !== null ? String(description) : null) : existingLesson.description;
    const nextSubject = subject !== undefined ? String(subject) : existingLesson.subject;
    const nextAgeGroup = ageGroup !== undefined ? String(ageGroup) : existingLesson.ageGroup;

    const regeneratedTranslations = autoTranslate === false
      ? {
          ...parseTranslations(existingLesson.translations),
          [baseLanguage]: createBaseTranslationEntry(
            nextTitle,
            nextDescription ?? undefined,
            parsedStatement,
            parsedOptions,
          ),
        }
      : {
          ...parseTranslations(existingLesson.translations),
          ...(await generateLessonTranslations(
            nextTitle,
            nextDescription ?? undefined,
            parsedStatement,
            parsedOptions,
            baseLanguage,
          )),
        };

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: title !== undefined ? nextTitle : undefined,
        description: description !== undefined ? nextDescription ?? '' : undefined,
        subject: subject !== undefined ? nextSubject : undefined,
        ageGroup: ageGroup !== undefined ? nextAgeGroup : undefined,
        statement: statement !== undefined && parsedStatement ? JSON.stringify(parsedStatement) : undefined,
        options: options !== undefined ? JSON.stringify(parsedOptions) : undefined,
        language: baseLanguage,
        translations: regeneratedTranslations as any,
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

    const responseLanguage = normalizeLanguageParam(languageOverride, baseLanguage);
    const localizedLesson = localizeLessonRecord(updatedLesson, responseLanguage);

    res.json({
      ...localizedLesson,
      state: { currentScreen: 'success' },
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({
      error: 'Failed to update lesson',
      details: error instanceof Error ? error.message : String(error),
      state: req.body.state || { currentScreen: 'basic-info' },
    });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    const lessonId = Number(id);
    if (Number.isNaN(lessonId)) {
      return res.status(400).json({
        error: 'Invalid lesson ID',
        details: 'Lesson ID must be a valid number',
        state: state || { currentScreen: 'list' },
      });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found',
        details: `No lesson found with ID: ${id}`,
        state: state || { currentScreen: 'list' },
      });
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    res.json({
      message: 'Lesson deleted successfully',
      state: { currentScreen: 'list' },
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({
      error: 'Failed to delete lesson',
      details: error instanceof Error ? error.message : String(error),
      state: req.body.state || { currentScreen: 'list' },
    });
  }
};

export const validateLessonState = async (req: Request, res: Response) => {
  const { state, data } = req.body;

  try {
    switch (state.currentScreen) {
      case 'basic-info':
        if (!data.title || !data.subject || !data.ageGroup) {
          return res.status(400).json({
            error: 'Missing required fields',
            details: 'Title, subject, and age group are required',
            state,
          });
        }
        return res.json({
          state: { currentScreen: 'content' },
          data,
        });

      case 'content':
        if (!data.statement) {
          return res.status(400).json({
            error: 'Missing content',
            details: 'Lesson statement is required',
            state,
          });
        }
        return res.json({
          state: { currentScreen: 'options' },
          data,
        });

      case 'options':
        if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
          return res.status(400).json({
            error: 'Invalid options',
            details: 'At least two options are required',
            state,
          });
        }
        return res.json({
          state: { currentScreen: 'review' },
          data,
        });

      case 'review':
        if (
          !data.title ||
          !data.subject ||
          !data.ageGroup ||
          !data.statement ||
          !data.options ||
          !Array.isArray(data.options) ||
          data.options.length < 2
        ) {
          return res.status(400).json({
            error: 'Missing required fields',
            details: 'Please ensure all required fields are filled out',
            state,
          });
        }
        return res.json({
          state: { currentScreen: 'complete' },
          data,
        });

      default:
        return res.status(400).json({
          error: 'Invalid state',
          details: 'Unknown screen state',
          state: { currentScreen: 'basic-info' },
        });
    }
  } catch (error) {
    console.error('Error validating lesson state:', error);
    res.status(500).json({
      error: 'Failed to validate lesson state',
      details: error instanceof Error ? error.message : String(error),
      state: { currentScreen: 'basic-info' },
    });
  }
};

export const getLessonsBySubject = async (req: Request, res: Response) => {
  try {
    const { subject } = req.params;
    const requestedLanguage = normalizeLanguageParam(req.query.language, 'en');

    if (!subject) {
      return res.status(400).json({
        error: 'Subject parameter is required',
        state: { currentScreen: 'list' },
      });
    }

    const lessons = await prisma.lesson.findMany({
      where: { subject },
      orderBy: { createdAt: 'desc' },
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

    const localizedLessons = lessons.map(lesson => localizeLessonRecord(lesson, requestedLanguage));

    res.json({
      lessons: localizedLessons,
      state: { currentScreen: 'list' },
    });
  } catch (error) {
    console.error('Error fetching lessons by subject:', error);
    res.status(500).json({
      error: 'Failed to fetch lessons',
      details: error instanceof Error ? error.message : String(error),
      state: { currentScreen: 'list' },
    });
  }
};