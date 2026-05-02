# Integration Quick Start Guide
## Court Action AI - Fast Track Implementation

This is a condensed, action-oriented guide for implementing the full-stack integration. For detailed explanations, see [`FRONTEND_BACKEND_INTEGRATION_PLAN.md`](FRONTEND_BACKEND_INTEGRATION_PLAN.md).

---

## 🚀 Quick Setup (30 minutes)

### Step 1: Project Rename & Dependencies
```bash
# Update project name in package.json files
# Frontend: "name": "court-action-ai"
# Backend: "name": "court-action-ai-backend"

# Install axios for API calls
npm install axios

# Backend setup
cd backend
npm install
```

### Step 2: Environment Configuration

**Backend** - Create `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secure-secret-min-32-chars
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

**Frontend** - Create `.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Court Action AI
```

### Step 3: Database Setup
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## 📁 File Creation Checklist

Create these files in order:

### Core Infrastructure
- [ ] `src/lib/api.ts` - Axios client with interceptors
- [ ] `src/types/index.ts` - Add API response types
- [ ] `src/contexts/AuthContext.tsx` - Authentication provider
- [ ] `src/components/ProtectedRoute.tsx` - Route guard

### Services Layer
- [ ] `src/services/auth.service.ts`
- [ ] `src/services/cases.service.ts`
- [ ] `src/services/directives.service.ts`
- [ ] `src/services/deadlines.service.ts`
- [ ] `src/services/upload.service.ts`
- [ ] `src/services/governance.service.ts`
- [ ] `src/services/audit.service.ts`

### Page Updates
- [ ] Update `src/main.tsx` - Wrap with AuthProvider
- [ ] Update `src/router.tsx` - Add ProtectedRoute
- [ ] Update `src/pages/LoginPage.tsx` - Real auth
- [ ] Update `src/pages/DashboardPage.tsx` - API integration
- [ ] Update `src/pages/UploadPage.tsx` - File upload
- [ ] Update `src/pages/WorkspacePage.tsx` - Case data
- [ ] Update `src/pages/VerificationPage.tsx` - Verification
- [ ] Update `src/pages/GovernancePage.tsx` - Analytics

### Deployment
- [ ] Create `render.yaml` - Render configuration
- [ ] Create `RENDER_DEPLOYMENT.md` - Deployment guide
- [ ] Update `README.md` - Complete documentation

---

## 🔧 Implementation Order

### Phase 1: Foundation (2 hours)
1. Create API client (`src/lib/api.ts`)
2. Add type definitions to `src/types/index.ts`
3. Create all service files
4. Create AuthContext
5. Create ProtectedRoute component

### Phase 2: Authentication (1 hour)
1. Update `main.tsx` with AuthProvider
2. Update `router.tsx` with protected routes
3. Update LoginPage with real auth
4. Test login/logout flow

### Phase 3: Page Integration (4 hours)
1. Dashboard → Load cases and metrics
2. Upload → File upload with progress
3. Workspace → Case and directive data
4. Verification → Verification actions
5. Governance → Analytics and charts

### Phase 4: Polish (1 hour)
1. Add loading skeletons
2. Error handling with toasts
3. Form validation
4. Test all flows

### Phase 5: Deployment (1 hour)
1. Create `render.yaml`
2. Push to GitHub
3. Deploy to Render
4. Configure environment variables
5. Run migrations

---

## 💻 Code Snippets

### API Client Template
```typescript
// src/lib/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Service Template
```typescript
// src/services/[resource].service.ts
import { apiClient } from '@/lib/api';
import { Resource } from '@/types';

export const resourceService = {
  getAll: async () => {
    const { data } = await apiClient.get<Resource[]>('/resource');
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await apiClient.get<Resource>(`/resource/${id}`);
    return data;
  },
  
  create: async (resource: Partial<Resource>) => {
    const { data } = await apiClient.post<Resource>('/resource', resource);
    return data;
  },
  
  update: async (id: string, updates: Partial<Resource>) => {
    const { data } = await apiClient.patch<Resource>(`/resource/${id}`, updates);
    return data;
  },
  
  delete: async (id: string) => {
    await apiClient.delete(`/resource/${id}`);
  },
};
```

### Page Integration Pattern
```typescript
// Pattern for updating pages
import { useEffect, useState } from 'react';
import { resourceService } from '@/services/resource.service';
import { toast } from 'sonner';

export default function ResourcePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await resourceService.getAll();
      setData(result);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton />;
  
  return (
    // Your component JSX using {data}
  );
}
```

---

## 🧪 Testing Commands

```bash
# Start backend
cd backend
npm run dev

# Start frontend (new terminal)
npm run dev

# Test endpoints
curl http://localhost:3001/api/health

# Build for production
npm run build
cd backend && npm run build
```

---

## 🐛 Common Issues & Solutions

### Issue: CORS errors
**Solution**: Check `FRONTEND_URL` in backend `.env` matches your frontend URL

### Issue: 401 Unauthorized
**Solution**: Verify token is being sent in Authorization header

### Issue: Database connection failed
**Solution**: Check `DATABASE_URL` format and Supabase project is running

### Issue: File upload fails
**Solution**: Check `MAX_FILE_SIZE` and `UPLOAD_DIR` in backend `.env`

### Issue: Build fails on Render
**Solution**: Ensure all environment variables are set in Render dashboard

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] All pages load without errors
- [ ] Authentication flow works
- [ ] File upload tested
- [ ] API endpoints return correct data
- [ ] Error handling displays properly
- [ ] Loading states show correctly
- [ ] Protected routes redirect properly
- [ ] Logout clears session

---

## 🚀 Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Full-stack integration complete"
   git push origin main
   ```

2. **Create Render Services**
   - Go to render.com
   - New → Blueprint
   - Connect repository
   - Render detects `render.yaml`

3. **Configure Environment Variables**
   - Add all Supabase keys
   - Add JWT_SECRET
   - Verify URLs

4. **Deploy**
   - Click "Apply"
   - Wait for build
   - Run migrations in backend shell

5. **Verify**
   - Test backend health endpoint
   - Test frontend loads
   - Test login flow

---

## 📞 Support Resources

- **Full Plan**: [`FRONTEND_BACKEND_INTEGRATION_PLAN.md`](FRONTEND_BACKEND_INTEGRATION_PLAN.md)
- **Backend API**: Check `backend/src/routes/` for endpoint details
- **Database Schema**: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)
- **Supabase Docs**: https://supabase.com/docs
- **Render Docs**: https://render.com/docs

---

**Ready to code?** Switch to Code mode and let's implement! 🎯