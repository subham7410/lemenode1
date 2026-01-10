@echo off
REM deploy-backend.bat - One-click backend deployment from Windows

echo 🚀 Deploying backend to Cloud Run...

cd /d c:\lemenode1\backend

REM Deploy directly from local files
gcloud run deploy lemenode-backend ^
  --source . ^
  --region asia-south1 ^
  --allow-unauthenticated ^
  --memory 512Mi ^
  --cpu 1 ^
  --min-instances 0 ^
  --max-instances 3 ^
  --timeout 30s ^
  --set-env-vars "GEMINI_API_KEY=%GEMINI_API_KEY%"

echo.
echo ✅ Deployment complete!
pause
