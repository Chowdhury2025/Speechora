@echo off
REM Test script for Presentation 1 translation functionality
REM This script tests the API endpoints to verify translation is working

set API_BASE=http://localhost:8000

echo 🧪 Testing Presentation 1 Translation Implementation
echo ==================================================

REM Test 1: Check if translation service is configured
echo.
echo 📋 Test 1: Checking available languages...
curl -s "%API_BASE%/api/images/languages/available"
echo.

REM Test 2: Get images in English (default)
echo.
echo 🇺🇸 Test 2: Getting images in English...
curl -s "%API_BASE%/api/images?category=home&language=en"
echo.

REM Test 3: Get images in Spanish
echo.
echo 🇪🇸 Test 3: Getting images in Spanish...
curl -s "%API_BASE%/api/images?category=home&language=es"
echo.

REM Test 4: Get images in French  
echo.
echo 🇫🇷 Test 4: Getting images in French...
curl -s "%API_BASE%/api/images?category=home&language=fr"
echo.

REM Test 5: Test with invalid language (should default to English)
echo.
echo ❓ Test 5: Testing invalid language (should default to English)...
curl -s "%API_BASE%/api/images?category=home&language=invalid"
echo.

REM Test 6: Check specific Presentation 1 categories
echo.
echo 🏠 Test 6: Testing Presentation 1 categories...

echo    Testing category: home
curl -s "%API_BASE%/api/images?category=home&language=es" > temp_home.json
echo.

echo    Testing category: school  
curl -s "%API_BASE%/api/images?category=school&language=es" > temp_school.json
echo.

echo    Testing category: therapy
curl -s "%API_BASE%/api/images?category=therapy&language=es" > temp_therapy.json
echo.

echo    Testing category: activities
curl -s "%API_BASE%/api/images?category=activities&language=es" > temp_activities.json
echo.

REM Clean up temp files
del temp_*.json 2>nul

echo.
echo ✅ Tests completed!
echo.
echo 💡 To run bulk translation:
echo    cd backend ^&^& node translate_presentation1.js
echo.
echo 📱 To test mobile app:
echo    1. Change language in Settings
echo    2. Open Presentation 1  
echo    3. Verify content is translated

pause