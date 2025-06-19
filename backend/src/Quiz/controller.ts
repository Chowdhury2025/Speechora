import { Response } from 'express';
import { prisma } from '../../config/db';
import { ChoiceType } from '@prisma/client';
import { AuthRequest } from '../types/express';

export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    // Only allow teachers and admins to create questions
    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only teachers and admins can create questions' });
    }

    const {
      questionType,
      questionText,
      questionMediaUrl,
      category,
      ageGroup,
      choices
    } = req.body;

    // Validate required fields
    if (!questionType) {
      return res.status(400).json({ error: 'questionType is required' });
    }
    if (!category) {
      return res.status(400).json({ error: 'category is required' });
    }
    if (!ageGroup) {
      return res.status(400).json({ error: 'ageGroup is required' });
    }
    if (!choices || !Array.isArray(choices) || choices.length === 0) {
      return res.status(400).json({ error: 'At least one choice is required' });
    }

    // Validate that at least one choice is marked as correct
    const hasCorrectAnswer = choices.some(choice => choice.isCorrect);
    if (!hasCorrectAnswer) {
      return res.status(400).json({ error: 'At least one choice must be marked as correct' });
    }

    // Find the index of the correct choice
    const correctChoiceIndex = choices.findIndex(choice => choice.isCorrect);

    // Create the question and update correct answer in a transaction
    const question = await prisma.$transaction(async (tx) => {
      const createdQuestion = await tx.quizQuestion.create({
        data: {
          questionType,
          questionText: questionText || undefined,
          questionMediaUrl: questionMediaUrl || undefined,
          category,
          ageGroup,
          createdById: req.user.id,
          choices: {
            create: choices.map((choice: { choiceType: ChoiceType; choiceText?: string; choiceMediaUrl?: string; isCorrect: boolean }) => ({
              choiceType: choice.choiceType,
              choiceText: choice.choiceText || undefined,
              choiceMediaUrl: choice.choiceMediaUrl || undefined,
            }))
          }
        },
        include: {
          choices: true
        }
      });

      // Update the correct answer
      const correctChoice = createdQuestion.choices[correctChoiceIndex];
      if (correctChoice) {
        const updatedQuestion = await tx.quizQuestion.update({
          where: { id: createdQuestion.id },
          data: {
            correctAnswerId: correctChoice.id
          },
          include: {
            choices: true,
            correctAnswer: true
          }
        });
        return updatedQuestion;
      }
      return createdQuestion;
    });

    return res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ 
      error: 'Failed to create question',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { category, ageGroup } = req.query;
    
    const questions = await prisma.quizQuestion.findMany({
      where: {
        ...(category && { category: String(category) }),
        ...(ageGroup && { ageGroup: String(ageGroup) })
      },
      include: {
        choices: true,
        correctAnswer: true
      }
    });

    return res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { questionId, choiceId, testScoreId } = req.body;

    // Get the question to check if the answer is correct
    const question = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { correctAnswer: true }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const isCorrect = question.correctAnswerId === choiceId;

    // Create user answer
    const userAnswer = await prisma.userAnswer.create({
      data: {
        userId: req.user.id,
        questionId,
        choiceId,
        isCorrect,
        testScoreId
      }
    });

    // Update test score
    if (testScoreId) {
      const testScore = await prisma.userTestScore.findUnique({
        where: { id: testScoreId }
      });

      if (testScore) {
        await prisma.userTestScore.update({
          where: { id: testScoreId },
          data: {
            score: isCorrect ? testScore.score + 1 : testScore.score
          }
        });
      }
    }

    return res.json(userAnswer);
  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ error: 'Failed to submit answer' });
  }
};

export const startTest = async (req: AuthRequest, res: Response) => {
  try {
    const { questions } = req.body;

    const testScore = await prisma.userTestScore.create({
      data: {
        userId: req.user.id,
        score: 0,
        total: questions.length,
        questions: {
          connect: questions.map((id: number) => ({ id }))
        }
      }
    });

    return res.json(testScore);
  } catch (error) {
    console.error('Error starting test:', error);
    return res.status(500).json({ error: 'Failed to start test' });
  }
};

export const getTestResults = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Only allow users to see their own results unless they are admins/teachers
    if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized to view these test results' });
    }

    const testScores = await prisma.userTestScore.findMany({
      where: { userId: parseInt(userId) },
      include: {
        questions: true,
        userAnswers: {
          include: {
            question: true,
            choice: true
          }
        }
      }
    });

    return res.json(testScores);
  } catch (error) {
    console.error('Error fetching test results:', error);
    return res.status(500).json({ error: 'Failed to fetch test results' });
  }
};
