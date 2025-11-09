import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { TranslationService } from '../services/translationService';

const prisma = new PrismaClient();
const translationService = TranslationService.getInstance();

const localizeVideoRecords = async (videoRecords: any[], requestedLanguage: string) => {
    return Promise.all(videoRecords.map(async (videoRecord) => {
        const video: any = videoRecord;
        const baseLanguage = video.language || 'en';
        let translations = (video.translations as Record<string, any> | null) || {};
        let localizedContent = {
            title: videoRecord.title,
            description: videoRecord.description,
            name: videoRecord.name,
        };

        if (!translations[baseLanguage]) {
            translations[baseLanguage] = {
                title: videoRecord.title,
                description: videoRecord.description,
                name: videoRecord.name,
            };
        }

        if (translations[requestedLanguage]) {
            const langData = translations[requestedLanguage];
            localizedContent = {
                title: langData.title || videoRecord.title,
                description: langData.description || videoRecord.description,
                name: langData.name || videoRecord.name,
            };
        } else if (
            requestedLanguage !== 'en' &&
            requestedLanguage !== baseLanguage &&
            translationService.isConfigured()
        ) {
            try {
                const updatedTranslations = await translationService.updateTranslations(
                    translations,
                    {
                        title: videoRecord.title,
                        description: videoRecord.description || '',
                        name: videoRecord.name || '',
                    },
                    baseLanguage,
                    [requestedLanguage]
                );

                await prisma.videos.update({
                    where: { id: videoRecord.id },
                    data: {
                        // @ts-ignore - regenerate Prisma client after schema update
                        translations: updatedTranslations,
                        updatedAt: new Date(),
                    },
                });

                translations = updatedTranslations;
                const langData = updatedTranslations[requestedLanguage];
                if (langData) {
                    localizedContent = {
                        title: langData.title || videoRecord.title,
                        description: langData.description || videoRecord.description,
                        name: langData.name || videoRecord.name,
                    };
                }
            } catch (translationError) {
                console.error(`Auto-translation failed for video ${videoRecord.id}:`, translationError);
            }
        }

        return {
            ...videoRecord,
            ...localizedContent,
            availableLanguages: Object.keys(translations).length > 0
                ? Object.keys(translations)
                : [baseLanguage],
            currentLanguage: requestedLanguage,
        };
    }));
};

// Add a new video
export const addVideo = async (req: Request, res: Response) => {
    try {
        const {
            title,
            video_url,
            category,
            description,
            ageGroup,
            name,
            language = 'en',
            autoTranslate = true
        } = req.body;

        if (!title || !video_url) {
            return res.status(400).json({ message: 'Title and video URL is required' });
        }

        let translations: Record<string, any> = {};

        if (autoTranslate && translationService.isConfigured()) {
            try {
                translations = await translationService.translateImageData({
                    title,
                    description: description || '',
                    name: name || ''
                }, language);
            } catch (translationError) {
                console.error('Translation failed, proceeding without translations:', translationError);
                translations = {
                    [language]: {
                        title,
                        description: description || '',
                        name: name || ''
                    }
                };
            }
        } else {
            translations = {
                [language]: {
                    title,
                    description: description || '',
                    name: name || ''
                }
            };
        }

        const video = await prisma.videos.create({
            data: {
                title,
                video_url,
                category,
                description,
                ageGroup,
                name,
                // @ts-ignore - regenerate Prisma client after schema update
                language,
                // @ts-ignore - regenerate Prisma client after schema update
                translations,
            },
        });

        res.status(201).json({
            message: 'Video added successfully',
            video,
            translationsGenerated: Object.keys(translations).length,
            availableLanguages: Object.keys(translations)
        });
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(500).json({ message: 'Failed to add video' });
    }
};

// Get all videos
export const getAllVideos = async (req: Request, res: Response) => {
    try {
        const { language = 'en' } = req.query;
        const requestedLanguage = String(language);

        const videos = await prisma.videos.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        const localizedVideos = await localizeVideoRecords(videos, requestedLanguage);

        res.json(localizedVideos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Failed to fetch videos' });
    }
};

// Get videos by category
export const getVideosByCategoryController = async (req: Request, res: Response) => {
    try {
        const { category } = req.body;
        const requestedLanguage = String(req.query.language ?? req.body.language ?? 'en');

        if (!category) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Category is required in request body"
            });
        }

        const videos = await prisma.videos.findMany({
            where: {
                category: category
            },
            orderBy: {
                position: 'asc'
            }
        });

        const localizedVideos = await localizeVideoRecords(videos, requestedLanguage);

        return res.status(StatusCodes.OK).json(localizedVideos);
    } catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch videos",
            error: error?.stack || error?.message || error,
        });
    }
};

// Update video
export const updateVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            title,
            video_url,
            category,
            description,
            ageGroup,
            name,
            language,
            autoTranslate = false
        } = req.body;

        const videoId = Number(id);
        if (Number.isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        const existingVideo = await prisma.videos.findUnique({ where: { id: videoId } });
        if (!existingVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const normalizedTitle = (title ?? existingVideo.title)?.trim();
        if (!normalizedTitle) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const normalizedDescription = description === null
            ? null
            : (description ?? existingVideo.description ?? '').trim();
        const normalizedAgeGroup = ageGroup === null
            ? null
            : (ageGroup ?? existingVideo.ageGroup ?? '').trim();
        const normalizedName = name === null
            ? null
            : (name ?? existingVideo.name ?? '').trim();
        const normalizedCategory = category === null
            ? null
            : (category ?? existingVideo.category ?? '').trim();
        const normalizedVideoUrl = video_url === null
            ? null
            : (video_url ?? existingVideo.video_url ?? '').trim();

        const sourceLanguage = language || (existingVideo as any).language || 'en';

        const updateData: any = {
            title: normalizedTitle,
            category: normalizedCategory,
            description: normalizedDescription,
            ageGroup: normalizedAgeGroup,
            name: normalizedName,
            updatedAt: new Date(),
        };

        if (normalizedVideoUrl) {
            updateData.video_url = normalizedVideoUrl;
        }

        if (sourceLanguage) {
            // @ts-ignore - regenerate Prisma client after schema update
            updateData.language = sourceLanguage;
        }

        const baseContent = {
            title: normalizedTitle,
            description: normalizedDescription || '',
            name: normalizedName || '',
        };

        let translations = ((existingVideo as any).translations as Record<string, any> | null) || {};

        if (autoTranslate && translationService.isConfigured()) {
            try {
                translations = await translationService.translateImageData(baseContent, sourceLanguage);
            } catch (translationError) {
                console.error('Translation failed during update, falling back to base language:', translationError);
                translations = {
                    [sourceLanguage]: {
                        title: baseContent.title,
                        description: baseContent.description,
                        name: baseContent.name,
                    },
                };
            }
        } else {
            translations = {
                ...translations,
                [sourceLanguage]: {
                    title: baseContent.title,
                    description: baseContent.description,
                    name: baseContent.name,
                },
            };
        }

        // @ts-ignore - regenerate Prisma client after schema update
        updateData.translations = translations;

        const video = await prisma.videos.update({
            where: { id: videoId },
            data: updateData,
        });

        res.json({ message: 'Video updated successfully', video });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ message: 'Failed to update video' });
    }
};

// Get all unique video categories
export const getAllVideoCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await prisma.videos.findMany({
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' },
        });
        // Return as a flat array of strings, filtering out null/empty
        const categoryList = categories
            .map(c => c.category)
            .filter((c): c is string => !!c && c.trim() !== '');
        res.json(categoryList);
    } catch (error) {
        console.error('Error fetching video categories:', error);
        res.status(500).json({ message: 'Failed to fetch video categories' });
    }
};
// Delete video
export const deleteVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.videos.delete({
            where: {
                id: parseInt(id),
            },
        });
        // If you want to delete the R2 file from storage, add logic here
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Failed to delete video' });

    }
};
