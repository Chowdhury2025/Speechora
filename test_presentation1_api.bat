@echo off
echo Testing Presentation 1 API endpoints...
echo.

echo === Testing daily_routine category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=daily_routine" -H "Accept: application/json"
echo.
echo.

echo === Testing home category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=home" -H "Accept: application/json"
echo.
echo.

echo === Testing school category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=school" -H "Accept: application/json"
echo.
echo.

echo === Testing therapy category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=therapy" -H "Accept: application/json"
echo.
echo.

echo === Testing activities category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=activities" -H "Accept: application/json"
echo.
echo.

echo Testing complete!
pause