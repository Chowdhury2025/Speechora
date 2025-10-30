import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { TranslationService } from '../services/translationService';

const prisma = new PrismaClient();
const translationService = TranslationService.getInstance();

export const getAllImages = async (req: Request, res: Response) => {
  try {    
    const { ageGroup, language = 'en' } = req.query;
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

    // Transform images to include localized content
    const localizedImages = await Promise.all(images.map(async (image) => {
      const translations = image.translations as any;
      let localizedContent = {
        title: image.title,
        description: image.description,
        name: image.name
      };

      // If translations exist and requested language is available
      if (translations && translations[language as string]) {
        const langData = translations[language as string];
        localizedContent = {
          title: langData.title || image.title,
          description: langData.description || image.description,
          name: langData.name || image.name
        };
      } else if (language !== 'en' && language !== image.language && translationService.isConfigured()) {
        // Auto-translate if language is missing and it's not English
        try {
          console.log(`Auto-translating image ${image.id} to ${language}`);
          
          const newTranslations = await translationService.translateImageData({
            title: image.title,
            description: image.description || '',
            name: image.name || ''
          }, image.language || 'en');

          // Update the image with new translations
          await prisma.images.update({
            where: { id: image.id },
            data: {
              translations: newTranslations,
              updatedAt: new Date()
            }
          });

          // Use the newly translated content
          if (newTranslations[language as string]) {
            const langData = newTranslations[language as string];
            localizedContent = {
              title: langData.title || image.title,
              description: langData.description || image.description,
              name: langData.name || image.name
            };
          }
        } catch (translationError) {
          console.error(`Auto-translation failed for image ${image.id}:`, translationError);
          // Continue with original content
        }
      }

      return {
        ...image,
        ...localizedContent,
        availableLanguages: translations ? Object.keys(translations) : [image.language || 'en'],
        currentLanguage: language
      };
    }));

    res.json(localizedImages);
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
    const { 
      imageUrl, 
      title, 
      thumbnail, 
      category, 
      position, 
      description, 
      ageGroup, 
      name,
      language = 'en',
      autoTranslate = true
    } = req.body;

    // Validate required fields
    if (!imageUrl || !title) {
      return res.status(400).json({ 
        error: 'Missing required fields: imageUrl and title are required' 
      });
    }

    let translations = {};

    // Generate translations if autoTranslate is enabled
    if (autoTranslate && translationService.isConfigured()) {
      console.log(`Generating translations for image: ${title}`);
      
      try {
        translations = await translationService.translateImageData({
          title,
          description: description || '',
          name: name || ''
        }, language);
        
        console.log(`Successfully generated translations for ${Object.keys(translations).length} languages`);
      } catch (translationError) {
        console.error('Translation failed, proceeding without translations:', translationError);
        // Continue with creation even if translation fails
        translations = {
          [language]: {
            title,
            description: description || '',
            name: name || ''
          }
        };
      }
    } else {
      // Store original language only
      translations = {
        [language]: {
          title,
          description: description || '',
          name: name || ''
        }
      };
    }

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
        language,
        translations,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Image created successfully with translations',
      data: image,
      translationsGenerated: Object.keys(translations).length,
      availableLanguages: Object.keys(translations)
    });
  } catch (error) {
    console.error('Error creating image:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create image',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
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

// New endpoint: Get available languages
export const getAvailableLanguages = async (_req: Request, res: Response) => {
  try {
    const languages = translationService.getAvailableLanguages();
    const isConfigured = translationService.isConfigured();
    
    res.json({
      success: true,
      data: {
        languages,
        translationServiceConfigured: isConfigured,
        totalLanguages: Object.keys(languages).length,
        message: isConfigured 
          ? 'Translation service is ready' 
          : 'Translation service not configured - set GOOGLE_TRANSLATE_API_KEY environment variable'
      }
    });
  } catch (error) {
    console.error('Error getting available languages:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get available languages' 
    });
  }
};

// New endpoint: Add translations to existing image
export const addTranslationsToImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetLanguages, sourceLanguage = 'en' } = req.body;
    
    const imageId = Number(id);
    if (isNaN(imageId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid image ID provided' 
      });
    }

    // Check if image exists
    const existingImage = await prisma.images.findUnique({
      where: { id: imageId },
    });

    if (!existingImage) {
      return res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    }

    if (!translationService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Translation service not configured',
        message: 'Set GOOGLE_TRANSLATE_API_KEY environment variable'
      });
    }

    // Generate new translations
    const updatedTranslations = await translationService.updateTranslations(
      (existingImage.translations as any) || {},
      {
        title: existingImage.title,
        description: existingImage.description || '',
        name: existingImage.name || ''
      },
      sourceLanguage,
      targetLanguages
    );

    // Update image with new translations
    const updatedImage = await prisma.images.update({
      where: { id: imageId },
      data: {
        translations: updatedTranslations,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Translations added successfully',
      data: updatedImage,
      translationsAdded: Object.keys(updatedTranslations).length,
      availableLanguages: Object.keys(updatedTranslations)
    });

  } catch (error) {
    console.error('Error adding translations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add translations',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// New endpoint: Bulk translate all Presentation 1 images specifically
export const bulkTranslatePresentation1Images = async (req: Request, res: Response) => {
  try {
    const { sourceLanguage = 'en' } = req.body;

    if (!translationService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Translation service not configured',
        message: 'Set GOOGLE_TRANSLATE_API_KEY environment variable'
      });
    }

    // Presentation 1 categories
    const presentation1Categories = [
      'my_world_daily_life',
      'home', 
      'school',
      'therapy',
      'activities',
      'family_friends',
      'toys_games',
      'food_drink',
      'places'
    ];

    // Get only Presentation 1 images
    const images = await prisma.images.findMany({
      where: {
        category: {
          in: presentation1Categories
        }
      }
    });

    if (images.length === 0) {
      return res.json({
        success: true,
        message: 'No Presentation 1 images found',
        data: { translatedCount: 0, totalImages: 0 }
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    console.log(`Starting bulk translation of ${images.length} Presentation 1 images...`);

    // Process images in smaller batches to avoid overwhelming the API
    const batchSize = 3; // Smaller batch for more reliable translation
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (image) => {
        try {
          // Check if image already has comprehensive translations
          const existingTranslations = image.translations as any;
          const supportedLanguages = translationService.getAvailableLanguages();
          const missingLanguages = Object.keys(supportedLanguages).filter(
            lang => !existingTranslations || !existingTranslations[lang]
          );

          if (missingLanguages.length === 0) {
            console.log(`Image ${image.id} already has all translations`);
            successCount++;
            return;
          }

          console.log(`Translating image ${image.id}: ${image.title} to ${missingLanguages.length} languages`);

          const translations = await translationService.translateImageData({
            title: image.title,
            description: image.description || '',
            name: image.name || ''
          }, sourceLanguage);

          await prisma.images.update({
            where: { id: image.id },
            data: {
              translations,
              language: sourceLanguage,
              updatedAt: new Date()
            }
          });

          successCount++;
          console.log(`Successfully translated image: ${image.title}`);
        } catch (error) {
          errorCount++;
          const errorMsg = `Failed to translate image ${image.id} (${image.title}): ${error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }));

      // Delay between batches to respect API rate limits
      if (i + batchSize < images.length) {
        console.log(`Completed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(images.length/batchSize)}, waiting 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    res.json({
      success: true,
      message: `Presentation 1 bulk translation completed`,
      data: {
        totalImages: images.length,
        successCount,
        errorCount,
        categories: presentation1Categories,
        errors: errors.slice(0, 5) // Limit error messages
      }
    });

  } catch (error) {
    console.error('Error in Presentation 1 bulk translation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to perform Presentation 1 bulk translation',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// New endpoint: Bulk translate all images
export const bulkTranslateImages = async (req: Request, res: Response) => {
  try {
    const { category, ageGroup, sourceLanguage = 'en' } = req.body;

    if (!translationService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Translation service not configured',
        message: 'Set GOOGLE_TRANSLATE_API_KEY environment variable'
      });
    }

    // Get images to translate
    const images = await prisma.images.findMany({
      where: {
        AND: [
          category ? { category } : {},
          ageGroup ? { ageGroup } : {},
        ]
      }
    });

    if (images.length === 0) {
      return res.json({
        success: true,
        message: 'No images found that need translation',
        data: { translatedCount: 0 }
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process images in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (image) => {
        try {
          const translations = await translationService.translateImageData({
            title: image.title,
            description: image.description || '',
            name: image.name || ''
          }, sourceLanguage);

          await prisma.images.update({
            where: { id: image.id },
            data: {
              translations,
              language: sourceLanguage,
              updatedAt: new Date()
            }
          });

          successCount++;
          console.log(`Translated image: ${image.title}`);
        } catch (error) {
          errorCount++;
          const errorMsg = `Failed to translate image ${image.id}: ${error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }));

      // Small delay between batches
      if (i + batchSize < images.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.json({
      success: true,
      message: `Bulk translation completed`,
      data: {
        totalImages: images.length,
        successCount,
        errorCount,
        errors: errors.slice(0, 10) // Limit error messages
      }
    });

  } catch (error) {
    console.error('Error in bulk translation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to perform bulk translation',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};