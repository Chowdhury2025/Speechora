# Presentation 1 Multi-Language Support Implementation

## Overview

This implementation adds automatic language translation support for Presentation 1 images based on the user's language settings in the mobile app. When a user changes their language in the settings, all Presentation 1 content will be automatically translated and served in their preferred language.

## Features

- ✅ **Automatic Translation**: When mobile app requests images in a specific language, missing translations are generated on-the-fly
- ✅ **Pre-translation**: Bulk endpoint to translate all Presentation 1 images to all supported languages  
- ✅ **Caching**: Translated content is stored in the database to avoid repeated API calls
- ✅ **Fallback**: If translation fails, original English content is served
- ✅ **Language Detection**: Mobile app automatically detects user's language preference and sends it with API requests

## Supported Languages

The system supports the following languages:
- English (en) - Default
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Chinese Simplified (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Hindi (hi)
- Dutch (nl)
- Polish (pl)
- Turkish (tr)
- Swedish (sv)
- Danish (da)
- Norwegian (no)
- Finnish (fi)
- Hebrew (he)

## How It Works

### Mobile App Flow
1. User opens Settings screen
2. User selects a language (e.g., Spanish)
3. Language preference is saved to SharedPreferences
4. When Presentation 1 loads images, it includes `?language=es` in API request
5. Backend returns Spanish translated content
6. Images display with Spanish titles, descriptions, and names

### Backend Flow
1. API receives request with `?language=es` parameter
2. Checks if images have Spanish translations in database
3. If translations exist: Returns translated content
4. If translations missing: Auto-translates using Google Translate API and caches result
5. Returns localized content to mobile app

## Implementation Details

### Mobile App Changes (`speachora/lib/services/presentation1_service.dart`)

Added language detection and API parameter:
```dart
// Get current user's selected language
Future<String> _getCurrentLanguageCode() async {
  final prefs = await SharedPreferences.getInstance();
  final languageName = prefs.getString('selectedLanguage') ?? 'English';
  
  final Map<String, String> languageMap = {
    'English': 'en', 'Spanish': 'es', 'French': 'fr', // ... etc
  };
  
  return languageMap[languageName] ?? 'en';
}

// Include language in API call
final currentLanguage = await _getCurrentLanguageCode();
response = await http.get(
  Uri.parse('${Constants.baseUrl}/images?language=$currentLanguage'),
  // ...
);
```

### Backend Changes

#### Enhanced Image Controller (`backend/src/Image/controller.ts`)
- Modified `getAllImages` to handle language parameter
- Added auto-translation for missing languages
- Returns localized content based on request language

#### New Translation Endpoint
- `POST /api/images/bulk/translate-presentation1` - Pre-translate all Presentation 1 images

#### Database Schema (`backend/prisma/schema.prisma`)
The images model already supports translations:
```prisma
model images {
  // ... other fields
  language     String   @default("en") // Primary language
  translations Json?    // JSON object containing all translations
}
```

Translation JSON structure:
```json
{
  "en": {
    "title": "Apple",
    "description": "A red fruit",
    "name": "apple"
  },
  "es": {
    "title": "Manzana", 
    "description": "Una fruta roja",
    "name": "manzana"
  },
  "fr": {
    "title": "Pomme",
    "description": "Un fruit rouge", 
    "name": "pomme"
  }
}
```

## Setup Instructions

### 1. Configure Google Translate API

Set the Google Translate API key in your environment:
```bash
# Backend environment variable
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here
```

### 2. Pre-translate Existing Images

Run the translation script to translate all existing Presentation 1 images:
```bash
cd backend
node translate_presentation1.js
```

This will:
- Check if Google Translate API is configured
- Translate all Presentation 1 images to all supported languages
- Store translations in the database
- Provide progress feedback

### 3. Test the Implementation

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Run the mobile app**:
   ```bash
   cd speachora
   flutter run
   ```

3. **Test language switching**:
   - Open mobile app
   - Go to Settings → Language
   - Select a different language (e.g., Spanish)
   - Navigate to Presentation 1
   - Verify content appears in selected language

## API Endpoints

### Get Images with Language Support
```http
GET /api/images?language=es&category=home
```

Response includes localized content:
```json
[
  {
    "id": 1,
    "imageUrl": "https://...",
    "title": "Casa",           // Translated title
    "description": "Un hogar", // Translated description
    "name": "casa",           // Translated name
    "category": "home",
    "currentLanguage": "es",
    "availableLanguages": ["en", "es", "fr", "de"]
  }
]
```

### Pre-translate All Presentation 1 Images
```http
POST /api/images/bulk/translate-presentation1
Content-Type: application/json

{
  "sourceLanguage": "en"
}
```

### Check Available Languages
```http
GET /api/images/languages/available
```

## Performance Considerations

1. **Caching**: Translations are stored in database to avoid repeated API calls
2. **Auto-translation**: Only happens once per language per image
3. **Batch Processing**: Translation script processes images in small batches
4. **Rate Limiting**: Includes delays between batches to respect Google Translate API limits
5. **Fallback**: Always serves content even if translation fails

## Error Handling

- Invalid language codes default to English
- Failed translations fall back to original content
- Network errors are handled gracefully
- Translation service availability is checked before use

## Testing Scenarios

1. **Language Switch Test**:
   - Change language in settings
   - Verify Presentation 1 shows translated content
   - Test multiple language switches

2. **Offline Test**:
   - Ensure cached translations work offline
   - Verify fallback to English when needed

3. **New Image Test**:
   - Add new image via admin panel
   - Verify auto-translation works on first request
   - Check translation appears in other languages

## Monitoring

Monitor translation usage:
```bash
# Check translation service logs
tail -f backend/logs/translation.log

# Check image translation status
curl "http://localhost:8000/api/images/languages/available"
```

## Troubleshooting

### Translation Not Working
1. Check Google Translate API key is set
2. Verify API key has sufficient quota
3. Check backend logs for translation errors

### Mobile App Not Sending Language
1. Verify language is saved in SharedPreferences
2. Check network requests include language parameter
3. Ensure Presentation1Service is updated

### Images Still in English
1. Run pre-translation script: `node translate_presentation1.js`
2. Check database for translation data
3. Verify API returns translated content

## Future Enhancements

- Add translation quality scoring
- Implement user-contributed translations
- Add translation editing interface for admins
- Support for region-specific language variants (e.g., es-MX vs es-ES)
- Audio pronunciation for translated content