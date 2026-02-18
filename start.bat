@echo off
echo ========================================
echo NCC Attendance Application
echo MongoDB Backend + React Frontend
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB status...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo ✓ MongoDB is running
) else (
    echo ⚠ MongoDB is not running. Starting MongoDB...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo ❌ Failed to start MongoDB. Please start it manually.
        echo Run: net start MongoDB
        pause
        exit /b 1
    )
)

echo.
echo [2/4] Starting Backend Server...
start "NCC Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Starting Frontend Server...
start "NCC Frontend" cmd /k "npm run dev"

echo.
echo [4/4] Opening application...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo ✅ Application Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Login Credentials:
echo   Admin: admin / admin123
echo   Cadet: NCC001 / NCC001
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /FI "WindowTitle eq NCC Backend*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq NCC Frontend*" /T /F >nul 2>&1
echo ✓ Servers stopped
