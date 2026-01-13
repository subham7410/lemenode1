@echo off
REM deploy-backend.bat - One-click backend deployment to Cloud Run
REM Updated with Firebase and CORS support

echo.
echo ========================================
echo   SkinGlow AI - Backend Deployment
echo ========================================
echo.

cd /d c:\lemenode1\backend

REM Check if GEMINI_API_KEY is set
if "%GEMINI_API_KEY%"=="" (
    echo ERROR: GEMINI_API_KEY environment variable not set!
    echo Set it with: set GEMINI_API_KEY=your_key_here
    pause
    exit /b 1
)

REM Set CORS origins for production (update this with your domains)
set CORS_ORIGINS=https://skinglow.app,exp://u.expo.dev

echo Deploying to Cloud Run (asia-south1)...
echo Memory: 1Gi (for Firebase SDK)
echo.

gcloud run deploy lemenode-backend ^
  --source . ^
  --region asia-south1 ^
  --allow-unauthenticated ^
  --memory 1Gi ^
  --cpu 1 ^
  --min-instances 0 ^
  --max-instances 5 ^
  --timeout 60s ^
  --set-env-vars "GEMINI_API_KEY=%GEMINI_API_KEY%,CORS_ORIGINS=%CORS_ORIGINS%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Deployment Successful!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Copy the Service URL shown above
    echo 2. Update frontend/.env with:
    echo    EXPO_PUBLIC_API_URL=https://your-service-url
    echo.
) else (
    echo.
    echo Deployment failed! Check errors above.
)

pause
