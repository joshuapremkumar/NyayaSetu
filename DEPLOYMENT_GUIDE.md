# CourtAction AI - Deployment Guide (Render)

## 🎯 Overview

This guide provides complete instructions for deploying CourtAction AI to Render platform with FastAPI backend and React frontend.

---

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Git repository with your code
- Local development environment tested

---

## 🗄️ Step 1: Create Render PostgreSQL Database

### 1.1 Create Database

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure database:
   - **Name**: `courtaction-db`
   - **Database**: `courtaction`
   - **User**: `courtaction_user`
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free (or Starter for production)
4. Click **"Create Database"**
5. Wait for database to provision (2-3 minutes)

### 1.2 Get Database Connection String

After creation, you'll see:
- **Internal Database URL**: Use this for backend
- **External Database URL**: Use for local development

Example format:
```
postgresql://courtaction_user:password@dpg-xxxxx.oregon-postgres.render.com/courtaction
```

**Save this URL** - you'll need it for environment variables.

---

## 🚀 Step 2: Deploy FastAPI Backend

### 2.1 Create render.yaml

Create `render.yaml` in your project root:

```yaml
services:
  # FastAPI Backend API
  - type: web
    name: courtaction-api
    runtime: python
    region: oregon
    plan: starter
    branch: main
    rootDir: backend
    buildCommand: |
      pip install -r requirements.txt
      alembic upgrade head
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: courtaction-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: ALGORITHM
        value: HS256
      - key: ACCESS_TOKEN_EXPIRE_MINUTES
        value: "15"
      - key: REFRESH_TOKEN_EXPIRE_DAYS
        value: "7"
      - key: ENVIRONMENT
        value: production
      - key: HOST
        value: 0.0.0.0
      - key: PORT
        value: "10000"
      - key: FRONTEND_URL
        value: https://courtaction.onrender.com
      - key: UPLOAD_DIR
        value: /opt/render/project/src/backend/uploads
      - key: MAX_FILE_SIZE
        value: "52428800"
      - key: ALLOWED_EXTENSIONS
        value: .pdf
      - key: OCR_ENABLED
        value: "false"
    disk:
      name: uploads
      mountPath: /opt/render/project/src/backend/uploads
      sizeGB: 10

  # React Frontend (Static Site)
  - type: web
    name: courtaction-frontend
    runtime: static
    region: oregon
    branch: main
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        value: https://courtaction-api.onrender.com

databases:
  - name: courtaction-db
    databaseName: courtaction
    user: courtaction_user
    plan: starter
    region: oregon
```

### 2.2 Push to GitHub

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2.3 Deploy Backend on Render

#### Option A: Using render.yaml (Recommended)

1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**
6. Render will create all services defined in render.yaml

#### Option B: Manual Setup

1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `courtaction-api`
   - **Runtime**: Python 3
   - **Region**: Oregon
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && alembic upgrade head
     ```
   - **Start Command**: 
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: Free or Starter

5. Add Environment Variables (see section 2.4)
6. Add Persistent Disk:
   - Name: `uploads`
   - Mount Path: `/opt/render/project/src/backend/uploads`
   - Size: 10 GB

7. Click **"Create Web Service"**

### 2.4 Configure Backend Environment Variables

In Render Dashboard → Your Service → Environment:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://...` | From Step 1.2 |
| `SECRET_KEY` | Generate random | Use: `openssl rand -hex 32` |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Token expiry |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token expiry |
| `ENVIRONMENT` | `production` | Environment |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `10000` | Render assigns this |
| `FRONTEND_URL` | `https://courtaction.onrender.com` | Your frontend URL |
| `UPLOAD_DIR` | `/opt/render/project/src/backend/uploads` | Upload directory |
| `MAX_FILE_SIZE` | `52428800` | 50MB in bytes |
| `ALLOWED_EXTENSIONS` | `.pdf` | Allowed file types |
| `OCR_ENABLED` | `false` | OCR feature flag |

### 2.5 Verify Backend Deployment

1. Wait for build to complete (5-10 minutes)
2. Visit: `https://courtaction-api.onrender.com/api/health`
3. Should return: `{"status": "ok", "environment": "production"}`
4. Visit: `https://courtaction-api.onrender.com/api/docs`
5. Should see FastAPI Swagger documentation

---

## 🎨 Step 3: Deploy React Frontend

### 3.1 Update Frontend Environment

Create `.env.production` in project root:

```env
VITE_API_URL=https://courtaction-api.onrender.com
```

### 3.2 Deploy Frontend on Render

#### If using render.yaml:
Frontend will be deployed automatically with backend.

#### Manual Setup:

1. Go to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `courtaction-frontend`
   - **Branch**: main
   - **Root Directory**: Leave empty (project root)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://courtaction-api.onrender.com`
6. Configure Redirects/Rewrites:
   - Add rewrite rule: `/*` → `/index.html` (for React Router)
7. Click **"Create Static Site"**

### 3.3 Verify Frontend Deployment

1. Wait for build to complete (3-5 minutes)
2. Visit: `https://courtaction.onrender.com`
3. Should see landing page
4. Test login functionality

---

## 🔧 Step 4: Post-Deployment Configuration

### 4.1 Run Database Migrations

Migrations should run automatically during build. To verify:

1. Go to Backend Service → Logs
2. Look for: `Running upgrade -> xxxxx, Initial schema`
3. If migrations didn't run, manually trigger:
   - Go to Backend Service → Shell
   - Run: `alembic upgrade head`

### 4.2 Create Initial Admin User

#### Option A: Using API

```bash
curl -X POST https://courtaction-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@judiciary.gov",
    "password": "ChangeMe123!",
    "full_name": "System Administrator",
    "role": "ADMIN",
    "department": "IT Department"
  }'
```

#### Option B: Using Python Shell

1. Go to Backend Service → Shell
2. Run:
```python
from app.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.models import UserRole

db = SessionLocal()

admin = User(
    email="admin@judiciary.gov",
    hashed_password=get_password_hash("ChangeMe123!"),
    full_name="System Administrator",
    role=UserRole.ADMIN,
    department="IT Department",
    is_active=True
)

db.add(admin)
db.commit()
print(f"Admin created: {admin.email}")
```

### 4.3 Test Complete Flow

1. **Login**: Visit frontend, login with admin credentials
2. **Upload Case**: Upload a test PDF
3. **View Dashboard**: Check metrics display
4. **Create Directive**: Test directive creation
5. **Verify Workflow**: Test verification process
6. **Check Audit Logs**: Verify logging works

---

## 🔒 Step 5: Security Hardening

### 5.1 Update CORS Settings

In `backend/app/main.py`, update CORS to production URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "https://courtaction.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5.2 Enable HTTPS Only

Render automatically provides HTTPS. Ensure all API calls use `https://`.

### 5.3 Rotate Secrets

After initial deployment:
1. Generate new `SECRET_KEY`
2. Update in Render environment variables
3. Redeploy backend

### 5.4 Set Up Rate Limiting

Already configured in `app/main.py` with slowapi. Monitor logs for abuse.

---

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Monitor Logs

**Backend Logs**:
- Go to Backend Service → Logs
- Monitor for errors, warnings
- Set up log alerts in Render

**Frontend Logs**:
- Go to Frontend Service → Logs
- Check build logs for issues

### 6.2 Database Backups

Render automatically backs up PostgreSQL:
- **Free Plan**: Daily backups (7 days retention)
- **Starter Plan**: Daily backups (30 days retention)

To restore:
1. Go to Database → Backups
2. Select backup
3. Click "Restore"

### 6.3 Monitor Disk Usage

Check uploads disk usage:
1. Go to Backend Service → Disks
2. Monitor usage percentage
3. Upgrade size if needed

### 6.4 Performance Monitoring

Monitor key metrics:
- **Response Time**: Should be < 500ms
- **Error Rate**: Should be < 1%
- **Uptime**: Should be > 99%

---

## 🔄 Step 7: Continuous Deployment

### 7.1 Auto-Deploy on Git Push

Render automatically deploys when you push to main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will:
1. Detect changes
2. Run build command
3. Run tests (if configured)
4. Deploy new version
5. Health check
6. Switch traffic to new version

### 7.2 Manual Deploy

To manually trigger deployment:
1. Go to Service → Manual Deploy
2. Click "Deploy latest commit"

### 7.3 Rollback

To rollback to previous version:
1. Go to Service → Events
2. Find previous successful deploy
3. Click "Rollback to this version"

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Solution**:
1. Check build logs for errors
2. Verify `requirements.txt` is correct
3. Ensure Python version compatibility
4. Check for missing dependencies

### Issue: Database Connection Fails

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check database is running
3. Verify network connectivity
4. Check database credentials

### Issue: Migrations Fail

**Solution**:
1. Check Alembic configuration
2. Verify database schema
3. Run migrations manually:
   ```bash
   alembic upgrade head
   ```
4. Check for conflicting migrations

### Issue: File Upload Fails

**Solution**:
1. Verify persistent disk is mounted
2. Check disk space
3. Verify upload directory permissions
4. Check `MAX_FILE_SIZE` setting

### Issue: CORS Errors

**Solution**:
1. Verify `FRONTEND_URL` in backend env vars
2. Check CORS middleware configuration
3. Ensure frontend URL matches exactly
4. Check browser console for specific error

### Issue: Authentication Fails

**Solution**:
1. Verify `SECRET_KEY` is set
2. Check JWT token expiration
3. Verify user exists in database
4. Check password hashing

---

## 📈 Scaling Considerations

### When to Scale

Scale when you experience:
- Response times > 1 second
- CPU usage > 80%
- Memory usage > 80%
- Disk usage > 80%

### Scaling Options

**Vertical Scaling** (Upgrade Plan):
- Free → Starter: $7/month
- Starter → Standard: $25/month
- Standard → Pro: $85/month

**Horizontal Scaling**:
- Add more backend instances
- Use load balancer
- Add Redis for caching
- Use CDN for static assets

**Database Scaling**:
- Upgrade PostgreSQL plan
- Add read replicas
- Implement connection pooling
- Optimize queries with indexes

---

## 🔐 Environment Variables Reference

### Backend Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=your-secret-key-32-chars-minimum
ALGORITHM=HS256
FRONTEND_URL=https://your-frontend.onrender.com

# Optional (with defaults)
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=production
HOST=0.0.0.0
PORT=10000
UPLOAD_DIR=/opt/render/project/src/backend/uploads
MAX_FILE_SIZE=52428800
ALLOWED_EXTENSIONS=.pdf
OCR_ENABLED=false

# Future (IBM watsonx.ai)
WATSONX_API_KEY=your-api-key
WATSONX_URL=https://api.watsonx.ai
```

### Frontend Environment Variables

```env
# Required
VITE_API_URL=https://your-backend.onrender.com
```

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Render Persistent Disks](https://render.com/docs/disks)

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code tested locally
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] Security review completed

### Deployment
- [ ] PostgreSQL database created
- [ ] Backend service deployed
- [ ] Frontend service deployed
- [ ] Environment variables configured
- [ ] Persistent disk attached
- [ ] Database migrations run
- [ ] Initial admin user created

### Post-Deployment
- [ ] Health check passing
- [ ] API documentation accessible
- [ ] Frontend loads correctly
- [ ] Login functionality works
- [ ] File upload works
- [ ] All API endpoints tested
- [ ] Monitoring configured
- [ ] Backups verified
- [ ] Documentation updated

### Security
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] Secrets rotated
- [ ] Admin password changed
- [ ] Audit logging verified

---

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ Backend API responds at `/api/health`
2. ✅ Frontend loads and displays landing page
3. ✅ User can register and login
4. ✅ User can upload PDF case files
5. ✅ Dashboard displays metrics
6. ✅ Verification workflow functions
7. ✅ Audit logs are created
8. ✅ All CRUD operations work
9. ✅ Role-based access control enforced
10. ✅ No console errors in browser

---

## 📞 Support

If you encounter issues:

1. Check Render service logs
2. Review this troubleshooting guide
3. Check Render status page
4. Contact Render support
5. Review FastAPI documentation

---

**Document Version**: 1.0
**Last Updated**: 2026-05-02
**Platform**: Render
**Status**: Production Ready