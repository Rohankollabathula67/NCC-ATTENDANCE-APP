@echo off
echo ========================================
echo Starting MongoDB Service
echo ========================================
echo.
echo Attempting to start MongoDB...
echo.

REM Try to start MongoDB service with admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges...
    net start MongoDB
    if %errorlevel% equ 0 (
        echo.
        echo ✅ MongoDB started successfully!
        echo.
        echo You can now run your backend:
        echo   cd backend
        echo   npm run dev
    ) else (
        echo.
        echo ❌ Failed to start MongoDB service
        echo.
        echo Trying alternative method...
        sc start MongoDB
    )
) else (
    echo ⚠️  Not running as Administrator
    echo.
    echo Please run this script as Administrator:
    echo 1. Right-click on start_mongodb.bat
    echo 2. Select "Run as administrator"
    echo.
    echo Or manually start MongoDB:
    echo 1. Open PowerShell as Administrator
    echo 2. Run: net start MongoDB
)

echo.
pause
