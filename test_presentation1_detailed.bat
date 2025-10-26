@echo off
echo Creating API test results directory...
mkdir api_test_results 2>nul

echo Testing Presentation 1 API endpoints and saving responses...
echo.

echo === Testing daily_routine category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=daily_routine" ^
  -H "Accept: application/json" ^
  -w "%%{http_code}" ^
  -o "api_test_results/daily_routine.json" ^
  -s
echo.

echo === Testing home category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=home" ^
  -H "Accept: application/json" ^
  -w "%%{http_code}" ^
  -o "api_test_results/home.json" ^
  -s
echo.

echo === Testing school category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=school" ^
  -H "Accept: application/json" ^
  -w "%%{http_code}" ^
  -o "api_test_results/school.json" ^
  -s
echo.

echo === Testing therapy category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=therapy" ^
  -H "Accept: application/json" ^
  -w "%%{http_code}" ^
  -o "api_test_results/therapy.json" ^
  -s
echo.

echo === Testing activities category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=activities" ^
  -H "Accept: application/json" ^
  -w "%%{http_code}" ^
  -o "api_test_results/activities.json" ^
  -s
echo.

echo === Testing with invalid category ===
curl -X GET "https://book8-backend.vercel.app/api/images?category=invalid_category" ^
  -H "Accept: application/json" ^
  -w "%%{http_code}" ^
  -o "api_test_results/invalid_category.json" ^
  -s
echo.

echo Testing complete! Check the api_test_results folder for response files.
echo.
echo Displaying file sizes:
dir api_test_results\*.json /B
echo.
pause