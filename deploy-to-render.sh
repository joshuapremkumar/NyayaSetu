#!/bin/bash

# CourtAction AI - Render Deployment Quick Start Script
# This script helps you prepare and deploy the application to Render

set -e

echo "🚀 CourtAction AI - Render Deployment Setup"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Not a git repository. Initializing...${NC}"
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_message
        git add .
        git commit -m "$commit_message"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}⚠️  No remote repository configured${NC}"
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " repo_url
    git remote add origin "$repo_url"
    echo -e "${GREEN}✅ Remote repository added${NC}"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main || git push -u origin master

echo ""
echo -e "${GREEN}✅ Code pushed to GitHub successfully!${NC}"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Go to Render Dashboard: https://dashboard.render.com"
echo "2. Click 'New' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Render will automatically detect render.yaml and deploy:"
echo "   - PostgreSQL database"
echo "   - Backend API service"
echo "   - Frontend service"
echo ""
echo "5. After deployment completes, run database migrations:"
echo "   - Go to backend service → Shell tab"
echo "   - Run: cd backend && npx prisma migrate deploy"
echo "   - Run: cd backend && npm run db:seed"
echo ""
echo "6. Access your deployed application:"
echo "   - Frontend: https://your-app-name.onrender.com"
echo "   - Backend API: https://your-api-name.onrender.com"
echo ""
echo "📖 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${GREEN}🎉 Setup complete! Happy deploying!${NC}"

# Made with Bob
