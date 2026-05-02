@echo off
REM CourtAction AI - Render Deployment Quick Start Script (Windows)
REM This script helps you prepare and deploy the application to Render

echo.
echo ========================================
echo CourtAction AI - Render Deployment Setup
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed. Please install Git first.
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Not a git repository. Initializing...
    git init
    echo [SUCCESS] Git repository initialized
)

REM Check for uncommitted changes
git status --short >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] You have uncommitted changes
    echo.
    git status -s
    echo.
    set /p commit_choice="Do you want to commit these changes? (y/n): "
    if /i "%commit_choice%"=="y" (
        set /p commit_message="Enter commit message: "
        git add .
        git commit -m "%commit_message%"
        echo [SUCCESS] Changes committed
    )
)

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No remote repository configured
    set /p repo_url="Enter your GitHub repository URL: "
    git remote add origin "%repo_url%"
    echo [SUCCESS] Remote repository added
)

REM Push to GitHub
echo.
echo Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
    git push -u origin master
)

echo.
echo [SUCCESS] Code pushed to GitHub successfully!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Go to Render Dashboard: https://dashboard.render.com
echo 2. Click 'New' -^> 'Blueprint'
echo 3. Connect your GitHub repository
echo 4. Render will automatically detect render.yaml and deploy:
echo    - PostgreSQL database
echo    - Backend API service
echo    - Frontend service
echo.
echo 5. After deployment completes, run database migrations:
echo    - Go to backend service -^> Shell tab
echo    - Run: cd backend ^&^& npx prisma migrate deploy
echo    - Run: cd backend ^&^& npm run db:seed
echo.
echo 6. Access your deployed application:
echo    - Frontend: https://your-app-name.onrender.com
echo    - Backend API: https://your-api-name.onrender.com
echo.
echo For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md
echo.
echo [SUCCESS] Setup complete! Happy deploying!
echo.
pause

@REM Made with Bob
