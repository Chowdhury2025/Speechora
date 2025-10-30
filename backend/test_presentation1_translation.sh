#!/bin/bash

# Test script for Presentation 1 translation functionality
# This script tests the API endpoints to verify translation is working

API_BASE="http://localhost:8000"

echo "🧪 Testing Presentation 1 Translation Implementation"
echo "=================================================="

# Test 1: Check if translation service is configured
echo ""
echo "📋 Test 1: Checking available languages..."
curl -s "$API_BASE/api/images/languages/available" | jq '.data.translationServiceConfigured, .data.totalLanguages'

# Test 2: Get images in English (default)
echo ""
echo "🇺🇸 Test 2: Getting images in English..."
curl -s "$API_BASE/api/images?category=home&language=en" | jq '.[0] | {title, description, name, currentLanguage}'

# Test 3: Get images in Spanish
echo ""
echo "🇪🇸 Test 3: Getting images in Spanish..."
curl -s "$API_BASE/api/images?category=home&language=es" | jq '.[0] | {title, description, name, currentLanguage}'

# Test 4: Get images in French  
echo ""
echo "🇫🇷 Test 4: Getting images in French..."
curl -s "$API_BASE/api/images?category=home&language=fr" | jq '.[0] | {title, description, name, currentLanguage}'

# Test 5: Test with invalid language (should default to English)
echo ""
echo "❓ Test 5: Testing invalid language (should default to English)..."
curl -s "$API_BASE/api/images?category=home&language=invalid" | jq '.[0] | {title, description, name, currentLanguage}'

# Test 6: Check specific Presentation 1 categories
echo ""
echo "🏠 Test 6: Testing Presentation 1 categories..."
categories=("home" "school" "therapy" "activities")

for category in "${categories[@]}"; do
    echo "   Testing category: $category"
    count=$(curl -s "$API_BASE/api/images?category=$category&language=es" | jq '. | length')
    echo "   Found $count images in $category"
done

echo ""
echo "✅ Tests completed!"
echo ""
echo "💡 To run bulk translation:"
echo "   cd backend && node translate_presentation1.js"
echo ""
echo "📱 To test mobile app:"
echo "   1. Change language in Settings"
echo "   2. Open Presentation 1"  
echo "   3. Verify content is translated"