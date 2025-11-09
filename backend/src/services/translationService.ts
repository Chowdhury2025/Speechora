import axios from 'axios';

// Supported languages for Presentation1
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese (Simplified)',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'bn': 'Bangla',
  'hi': 'Hindi',
  'nl': 'Dutch',
  'pl': 'Polish',
  'tr': 'Turkish',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'he': 'Hebrew'
};

export interface TranslationResult {
  [languageCode: string]: {
    title?: string;
    description?: string;
    name?: string;
  };
}

export class TranslationService {
  private static instance: TranslationService;
  private apiKey: string;
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  private constructor() {
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || '';
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  /**
   * Translate text using Google Translate REST API
   */
  private async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'en'
  ): Promise<string> {
    if (!this.apiKey) {
      console.warn('Google Translate API key not configured');
      return text; // Return original text as fallback
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        }
      );

      const translatedText = response.data?.data?.translations?.[0]?.translatedText;
      return translatedText || text;
    } catch (error) {
      console.error(`Translation failed for ${targetLanguage}:`, error);
      return text; // Return original text as fallback
    }
  }

  /**
   * Translate text to multiple languages
   */
  public async translateToMultipleLanguages(
    text: string,
    sourceLanguage: string = 'en',
    excludeLanguages: string[] = []
  ): Promise<{ [languageCode: string]: string }> {
    if (!text || text.trim() === '') {
      return {};
    }

    const targetLanguages = Object.keys(SUPPORTED_LANGUAGES).filter(
      lang => lang !== sourceLanguage && !excludeLanguages.includes(lang)
    );

    const translations: { [languageCode: string]: string } = {};
    
    // Add source language
    translations[sourceLanguage] = text;

    if (!this.apiKey) {
      console.warn('Google Translate API key not configured, returning source text only');
      return translations;
    }

    try {
      // Translate to all target languages in parallel (with rate limiting)
      const translationPromises = targetLanguages.map(async (targetLang, index) => {
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, index * 100));
        
        try {
          const translation = await this.translateText(text, targetLang, sourceLanguage);
          return { language: targetLang, translation };
        } catch (error) {
          console.error(`Failed to translate to ${targetLang}:`, error);
          return { language: targetLang, translation: text }; // Fallback to original
        }
      });

      const results = await Promise.all(translationPromises);
      
      results.forEach(({ language, translation }) => {
        translations[language] = translation;
      });

      console.log(`Successfully translated "${text}" to ${results.length} languages`);
      return translations;
    } catch (error) {
      console.error('Translation service error:', error);
      // Return object with just the source language as fallback
      return { [sourceLanguage]: text };
    }
  }

  /**
   * Translate image data (title, description, name) to all supported languages
   */
  public async translateImageData(imageData: {
    title: string;
    description?: string;
    name?: string;
  }, sourceLanguage: string = 'en'): Promise<TranslationResult> {
    const translations: TranslationResult = {};

    try {
      // Initialize all language codes
      Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
        translations[lang] = {};
      });

      // Translate title
      if (imageData.title) {
        const titleTranslations = await this.translateToMultipleLanguages(
          imageData.title,
          sourceLanguage
        );
        Object.entries(titleTranslations).forEach(([lang, translation]) => {
          if (!translations[lang]) translations[lang] = {};
          translations[lang].title = translation;
        });
      }

      // Translate description
      if (imageData.description && imageData.description.trim() !== '') {
        const descTranslations = await this.translateToMultipleLanguages(
          imageData.description,
          sourceLanguage
        );
        Object.entries(descTranslations).forEach(([lang, translation]) => {
          if (!translations[lang]) translations[lang] = {};
          translations[lang].description = translation;
        });
      }

      // Translate name
      if (imageData.name && imageData.name.trim() !== '') {
        const nameTranslations = await this.translateToMultipleLanguages(
          imageData.name,
          sourceLanguage
        );
        Object.entries(nameTranslations).forEach(([lang, translation]) => {
          if (!translations[lang]) translations[lang] = {};
          translations[lang].name = translation;
        });
      }

      console.log(`Completed translation for image: ${imageData.title}`);
      return translations;
    } catch (error) {
      console.error('Error translating image data:', error);
      // Return fallback with source language only
      translations[sourceLanguage] = {
        title: imageData.title,
        description: imageData.description,
        name: imageData.name,
      };
      return translations;
    }
  }

  /**
   * Get translation for specific language
   */
  public getTranslation(
    translations: TranslationResult,
    languageCode: string,
    fallbackLanguage: string = 'en'
  ): { title?: string; description?: string; name?: string } {
    return translations[languageCode] || translations[fallbackLanguage] || {};
  }

  /**
   * Update existing translations with new languages
   */
  public async updateTranslations(
    existingTranslations: TranslationResult,
    imageData: {
      title: string;
      description?: string;
      name?: string;
    },
    sourceLanguage: string = 'en',
    targetLanguages: string[] = []
  ): Promise<TranslationResult> {
    const languages = targetLanguages.length > 0 
      ? targetLanguages 
      : Object.keys(SUPPORTED_LANGUAGES);

    const updatedTranslations = { ...existingTranslations };

    for (const lang of languages) {
      if (lang === sourceLanguage) {
        // Update source language
        updatedTranslations[lang] = {
          title: imageData.title,
          description: imageData.description,
          name: imageData.name,
        };
      } else {
        // Translate to target language
        if (!updatedTranslations[lang]) {
          updatedTranslations[lang] = {};
        }

        if (imageData.title) {
          const titleTranslation = await this.translateText(
            imageData.title,
            lang,
            sourceLanguage
          );
          updatedTranslations[lang].title = titleTranslation;
        }

        if (imageData.description) {
          const descTranslation = await this.translateText(
            imageData.description,
            lang,
            sourceLanguage
          );
          updatedTranslations[lang].description = descTranslation;
        }

        if (imageData.name) {
          const nameTranslation = await this.translateText(
            imageData.name,
            lang,
            sourceLanguage
          );
          updatedTranslations[lang].name = nameTranslation;
        }
      }
    }

    return updatedTranslations;
  }

  /**
   * Check if Google Translate API is configured
   */
  public isConfigured(): boolean {
    return !!process.env.GOOGLE_TRANSLATE_API_KEY;
  }

  /**
   * Get available languages
   */
  public getAvailableLanguages(): typeof SUPPORTED_LANGUAGES {
    return SUPPORTED_LANGUAGES;
  }
}