# CourtAction AI - Render Deployment Guide

This guide will help you deploy the CourtAction AI application to Render with PostgreSQL database.

## Prerequisites

- GitHub account
- Render account (free tier available at https://render.com)
- Git installed locally

## Architecture Overview

The application consists of:
- **Backend API**: Node.js/Express server with Prisma ORM
- **Frontend**: React/Vite application
- **Database**: PostgreSQL (managed by Render)

## Deployment Steps

### 1. Prepare Your Repository

1. Ensure all changes are committed to your Git repository
2. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### 2. Create Render Account

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 3. Deploy Using render.yaml (Recommended)

The project includes a `render.yaml` file that automates the entire deployment process.

1. **Connect Repository**:
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing your project

2. **Review Configuration**:
   Render will automatically detect the `render.yaml` file and create:
   - PostgreSQL database (`courtaction-ai-db`)
   - Backend API service (`courtaction-ai-backend`)
   - Frontend service (`courtaction-ai-frontend`)

3. **Environment Variables**:
   The following environment variables are automatically configured:
   - `DATABASE_URL`: Auto-generated from PostgreSQL database
   - `JWT_SECRET`: Auto-generated secure secret
   - `FRONTEND_URL`: Auto-linked to frontend service
   - `VITE_API_URL`: Auto-linked to backend service

4. **Deploy**:
   - Click "Apply" to start deployment
   - Wait for all services to build and deploy (5-10 minutes)

### 4. Manual Deployment (Alternative)

If you prefer manual setup:

#### Step 4.1: Create PostgreSQL Database

1. In Render Dashboard, click "New" → "PostgreSQL"
2. Configure:
   - Name: `courtaction-ai-db`
   - Database: `courtaction_ai`
   - User: `courtaction_ai_user`
   - Region: Choose closest to your users
   - Plan: Free
3. Click "Create Database"
4. Copy the "Internal Database URL" for later use

#### Step 4.2: Deploy Backend API

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `courtaction-ai-backend`
   - Region: Same as database
   - Branch: `main`
   - Root Directory: Leave empty
   - Runtime: `Node`
   - Build Command: `cd backend && npm install && npm run db:generate && npm run build`
   - Start Command: `cd backend && npm run start`
   - Plan: Free

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=<generate-a-secure-random-string-min-32-chars>
   JWT_EXPIRES_IN=24h
   DATABASE_URL=<paste-internal-database-url-from-step-4.1>
   FRONTEND_URL=<will-add-after-frontend-deployment>
   UPLOAD_DIR=/opt/render/project/src/backend/uploads
   MAX_FILE_SIZE=52428800
   ```

5. Click "Create Web Service"

#### Step 4.3: Run Database Migrations

After backend deployment completes:

1. Go to backend service → "Shell" tab
2. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma db seed
   ```

#### Step 4.4: Deploy Frontend

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `courtaction-ai-frontend`
   - Region: Same as backend
   - Branch: `main`
   - Root Directory: Leave empty
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`
   - Plan: Free

4. Add Environment Variables:
   ```
   NODE_ENV=production
   VITE_API_URL=<backend-service-url-from-step-4.2>
   ```

5. Click "Create Web Service"

#### Step 4.5: Update Backend FRONTEND_URL

1. Go to backend service → "Environment"
2. Update `FRONTEND_URL` with the frontend service URL
3. Save changes (service will redeploy)

### 5. Initialize Database

After successful deployment:

1. Go to backend service in Render Dashboard
2. Click "Shell" tab
3. Run the seed command to create initial users:
   ```bash
   cd backend && npm run db:seed
   ```

This creates three default users:
- **Admin**: admin@courtaction.ai / admin123
- **Legal Reviewer**: reviewer@courtaction.ai / reviewer123
- **Department Officer**: officer@courtaction.ai / officer123

### 6. Verify Deployment

1. **Check Backend Health**:
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check Frontend**:
   - Visit: `https://your-frontend-url.onrender.com`
   - Should load the landing page

3. **Test Login**:
   - Click "Login" on the landing page
   - Use default credentials (admin@courtaction.ai / admin123)
   - Should redirect to dashboard

## Post-Deployment Configuration

### Update Default Passwords

**IMPORTANT**: Change default passwords immediately after first login!

1. Log in as admin
2. Navigate to user management
3. Update passwords for all default accounts

### Configure Custom Domain (Optional)

1. Go to your service in Render Dashboard
2. Click "Settings" → "Custom Domain"
3. Add your domain and follow DNS configuration instructions

### Enable Auto-Deploy

Auto-deploy is enabled by default. Every push to your main branch will trigger a new deployment.

To disable:
1. Go to service → "Settings"
2. Scroll to "Auto-Deploy"
3. Toggle off

## Monitoring and Logs

### View Logs

1. Go to your service in Render Dashboard
2. Click "Logs" tab
3. View real-time logs or filter by time range

### Monitor Performance

1. Go to service → "Metrics" tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Set Up Alerts

1. Go to service → "Settings" → "Notifications"
2. Add email or Slack webhook for alerts
3. Configure alert conditions

## Troubleshooting

### Database Connection Issues

**Problem**: Backend can't connect to database

**Solution**:
1. Verify `DATABASE_URL` is set correctly
2. Check database is in same region as backend
3. Use "Internal Database URL" not "External"

### Build Failures

**Problem**: Build command fails

**Solution**:
1. Check build logs for specific errors
2. Verify all dependencies are in package.json
3. Test build locally: `npm run build`

### Migration Errors

**Problem**: Prisma migrations fail

**Solution**:
1. Go to backend Shell
2. Reset database (WARNING: deletes all data):
   ```bash
   cd backend
   npx prisma migrate reset --force
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Frontend Can't Connect to Backend

**Problem**: API calls fail with CORS errors

**Solution**:
1. Verify `FRONTEND_URL` in backend environment variables
2. Verify `VITE_API_URL` in frontend environment variables
3. Check both services are deployed and running

### Service Won't Start

**Problem**: Service shows "Deploy failed" or keeps restarting

**Solution**:
1. Check logs for error messages
2. Verify start command is correct
3. Ensure PORT environment variable is used correctly
4. Check all required environment variables are set

## Scaling and Performance

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month of runtime per service
- 100GB bandwidth/month

### Upgrade to Paid Plan

For production use, consider upgrading:
1. Go to service → "Settings" → "Plan"
2. Select appropriate plan
3. Benefits:
   - No spin-down
   - More CPU/memory
   - Increased bandwidth
   - Priority support

## Backup and Recovery

### Database Backups

Render automatically backs up PostgreSQL databases:
- Free tier: Daily backups, 7-day retention
- Paid tiers: More frequent backups, longer retention

### Manual Backup

1. Go to database in Render Dashboard
2. Click "Backups" tab
3. Click "Create Backup"
4. Download backup file

### Restore from Backup

1. Go to database → "Backups"
2. Select backup to restore
3. Click "Restore"
4. Confirm restoration

## Security Best Practices

1. **Change Default Passwords**: Update all default user passwords immediately
2. **Rotate JWT Secret**: Change JWT_SECRET periodically
3. **Use Environment Variables**: Never commit secrets to Git
4. **Enable HTTPS**: Render provides free SSL certificates
5. **Monitor Logs**: Regularly check for suspicious activity
6. **Update Dependencies**: Keep packages up to date
7. **Limit Access**: Use role-based access control

## Cost Optimization

### Free Tier Tips

1. Use single database for all environments
2. Combine services where possible
3. Monitor usage in Render Dashboard
4. Optimize build times to reduce deployment time

### Monitoring Costs

1. Go to Account → "Billing"
2. View current usage
3. Set up billing alerts
4. Review monthly invoices

## Support and Resources

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Prisma Documentation**: https://www.prisma.io/docs
- **Project Issues**: [Your GitHub Issues URL]

## Next Steps

After successful deployment:

1. ✅ Change default passwords
2. ✅ Test all features thoroughly
3. ✅ Set up monitoring and alerts
4. ✅ Configure custom domain (optional)
5. ✅ Create additional user accounts
6. ✅ Upload test cases
7. ✅ Train team on system usage

## Maintenance

### Regular Tasks

- **Weekly**: Review logs for errors
- **Monthly**: Update dependencies
- **Quarterly**: Review and rotate secrets
- **Annually**: Review and optimize costs

### Update Deployment

To deploy updates:
1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Render auto-deploys from main branch
5. Monitor deployment logs
6. Verify changes in production

---

**Congratulations!** Your CourtAction AI application is now deployed on Render. 🎉

For questions or issues, please refer to the troubleshooting section or contact support.