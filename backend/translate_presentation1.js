/**
 * Script to trigger translation of all Presentation 1 images
 * Run this script to pre-translate all images to supported languages
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

async function translatePresentation1Images() {
  try {
    console.log('🌍 Starting Presentation 1 bulk translation...');
    console.log(`📡 API URL: ${API_BASE_URL}`);
    
    const response = await axios.post(
      `${API_BASE_URL}/api/images/bulk/translate-presentation1`,
      {
        sourceLanguage: 'en'
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000 // 5 minutes timeout for large translation jobs
      }
    );

    if (response.data.success) {
      console.log('✅ Translation completed successfully!');
      console.log(`📊 Results:`);
      console.log(`   - Total images: ${response.data.data.totalImages}`);
      console.log(`   - Successfully translated: ${response.data.data.successCount}`);
      console.log(`   - Errors: ${response.data.data.errorCount}`);
      console.log(`   - Categories processed: ${response.data.data.categories.join(', ')}`);
      
      if (response.data.data.errors && response.data.data.errors.length > 0) {
        console.log(`⚠️  Errors encountered:`);
        response.data.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    } else {
      console.error('❌ Translation failed:', response.data.error);
      console.error('Message:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Script error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure your backend server is running');
    }
  }
}

async function checkAvailableLanguages() {
  try {
    console.log('🔍 Checking available languages...');
    
    const response = await axios.get(`${API_BASE_URL}/api/images/languages/available`);
    
    if (response.data.success) {
      console.log('📋 Available languages:');
      Object.entries(response.data.data.languages).forEach(([code, name]) => {
        console.log(`   ${code}: ${name}`);
      });
      console.log(`🔧 Translation service configured: ${response.data.data.translationServiceConfigured}`);
      return response.data.data.translationServiceConfigured;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Failed to check languages:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Presentation 1 Translation Script');
  console.log('====================================');
  
  // Check if translation service is configured
  const isConfigured = await checkAvailableLanguages();
  
  if (!isConfigured) {
    console.error('❌ Translation service is not configured!');
    console.error('💡 Please set GOOGLE_TRANSLATE_API_KEY environment variable');
    process.exit(1);
  }
  
  console.log('');
  await translatePresentation1Images();
  
  console.log('');
  console.log('🏁 Script completed!');
  console.log('💡 Now test the mobile app with different language settings');
}

// Run the script
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});