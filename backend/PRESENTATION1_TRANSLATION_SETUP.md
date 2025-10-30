# Quick Setup Guide: Presentation 1 Multi-Language Support

## For System Administrators

### Step 1: Get Google Translate API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google Translate API
4. Create credentials (API Key)
5. Copy the API key

### Step 2: Configure Backend

Add the API key to your environment variables:

**For Local Development:**
```bash
# Add to your .env file in backend folder
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

**For Production (Vercel):**
```bash
# Set environment variable in Vercel dashboard
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

### Step 3: Pre-translate Existing Images

Run the translation script to translate all existing Presentation 1 images:

```bash
cd backend
node translate_presentation1.js
```

**Expected Output:**
```
🚀 Presentation 1 Translation Script
====================================
🔍 Checking available languages...
📋 Available languages:
   en: English
   es: Spanish
   fr: French
   ... (20 languages total)
🔧 Translation service configured: true

🌍 Starting Presentation 1 bulk translation...
📊 Results:
   - Total images: 150
   - Successfully translated: 150
   - Errors: 0
   - Categories processed: home, school, therapy, activities, ...
✅ Translation completed successfully!
```

### Step 4: Test the Implementation

**Test API Endpoints:**
```bash
# Windows
test_presentation1_translation.bat

# Linux/Mac
./test_presentation1_translation.sh
```

**Test Mobile App:**
1. Open mobile app
2. Go to Settings → Language
3. Select Spanish/French/etc.
4. Open any Presentation 1 category
5. Verify content displays in selected language

### Step 5: Verify Translation Quality

Check a few translated items manually:
- Navigate to different Presentation 1 categories
- Switch between languages
- Ensure translations make sense contextually

## Monitoring & Maintenance

### Check Translation Status
```bash
curl "https://your-api-domain.com/api/images/languages/available"
```

### Add Translations for New Images
New images added through the admin panel will be automatically translated when first requested by the mobile app.

### Bulk Re-translate (if needed)
```bash
cd backend
node translate_presentation1.js
```

## Troubleshooting

### "Translation service not configured"
- Verify GOOGLE_TRANSLATE_API_KEY is set
- Check API key has Google Translate API enabled
- Restart backend server after setting environment variable

### Mobile app still shows English
- Clear app cache/data
- Verify language is selected in Settings
- Check network requests include `?language=xx` parameter

### Poor translation quality
- Google Translate API may not be perfect for specialized terms
- Consider manual review and editing of key translations
- Future versions may support manual translation overrides

## Cost Estimation

Google Translate API pricing (as of 2024):
- $20 per 1 million characters
- Average image has ~50 characters (title + description + name)
- 150 images × 20 languages × 50 chars = 150,000 characters
- Estimated cost: ~$3 for complete translation

## Support

For technical issues:
1. Check backend logs for translation errors
2. Verify Google Translate API quota and billing
3. Test with provided test scripts
4. Check mobile app network requests include language parameter