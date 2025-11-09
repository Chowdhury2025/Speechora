@echo off
echo Testing Optimized Presentation 1 API endpoint...
echo.

echo === Testing single GET request for all images ===
curl -X GET "https://book8-backend.vercel.app/api/images" ^
  -H "Accept: application/json" ^
  -w "HTTP Status: %%{http_code}\nTotal Time: %%{time_total}s\n" ^
  -o "presentation1_all_images.json" ^
  -s

echo.
echo === Response Analysis ===
if exist "presentation1_all_images.json" (
    echo Response saved to: presentation1_all_images.json
    
    echo.
    echo File size:
    for %%A in ("presentation1_all_images.json") do echo %%~zA bytes
    
    echo.
    echo Checking for Presentation 1 categories in response...
    findstr /C:"my_world_daily_life" presentation1_all_images.json >nul && echo ✓ Daily Routine images found
    findstr /C:"home" presentation1_all_images.json >nul && echo ✓ Home images found  
    findstr /C:"school" presentation1_all_images.json >nul && echo ✓ School images found
    findstr /C:"therapy" presentation1_all_images.json >nul && echo ✓ Therapy images found
    findstr /C:"activities" presentation1_all_images.json >nul && echo ✓ Activities images found
    findstr /C:"family_friends" presentation1_all_images.json >nul && echo ✓ Family & Friends images found
    findstr /C:"toys_games" presentation1_all_images.json >nul && echo ✓ Toys & Games images found
    findstr /C:"food_drink" presentation1_all_images.json >nul && echo ✓ Food & Drink images found
    findstr /C:"places" presentation1_all_images.json >nul && echo ✓ Places images found
    
) else (
    echo ❌ Failed to save response
)

echo.
echo =========================================
echo OPTIMIZATION BENEFITS:
echo • Single API call instead of 9 separate calls
echo • All Presentation 1 images in one response
echo • Client-side filtering for categories
echo • Reduced network overhead
echo =========================================
echo.
pause