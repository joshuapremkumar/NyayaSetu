# Frontend-Backend Integration Plan
## Court Action AI - Full-Stack Integration Strategy

---

## 📋 Executive Summary

This document outlines the complete integration strategy for connecting the React frontend with the Node.js/Express backend API, including authentication, data flow, error handling, and Render deployment configuration.

**Project Rename**: ~~`v0-court-action-ai`~~ → `court-action-ai` ✅

**Integration Scope**: Full integration with authentication, RBAC, error handling, loading states, and production deployment readiness.

---

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite)"]
        UI[UI Components]
        Pages[Pages]
        AuthContext[Auth Context]
        APIClient[API Client]
    end
    
    subgraph Backend["Backend (Node.js + Express)"]
        API[REST API]
        Auth[Supabase Auth]
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
    end
    
    subgraph External["External Services"]
        Supabase[Supabase Auth]
        Storage[File Storage]
    end
    
    UI --> Pages
    Pages --> AuthContext
    Pages --> APIClient
    APIClient --> API
    API --> Auth
    API --> Prisma
    Prisma --> DB
    Auth --> Supabase
    API --> Storage
    
    style Frontend fill:#e3f2fd
    style Backend fill:#f3e5f5
    style External fill:#fff3e0
```

---

## 📦 Phase 1: Project Setup & Configuration

### 1.1 Project Renaming
**Files to Update:**
- [`package.json`](package.json:2) - Update `name` field
- [`backend/package.json`](backend/package.json:2) - Update `name` field
- [`README.md`](README.md:1) - Update project title
- [`index.html`](index.html:1) - Update `<title>` tag
- All documentation files

### 1.2 Backend Environment Setup
**Create**: `backend/.env` (from `.env.example`)

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

### 1.3 Frontend Environment Setup
**Create**: `.env` (root directory)

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Court Action AI
```

### 1.4 Install Dependencies

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

**Frontend:**
```bash
npm install axios
```

---

## 🔐 Phase 2: Authentication Infrastructure

### 2.1 API Client Setup
**Create**: [`src/lib/api.ts`](src/lib/api.ts)

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2.2 Type Definitions
**Update**: [`src/types/index.ts`](src/types/index.ts)

Add API response types:
```typescript
// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'LEGAL_REVIEWER' | 'DEPARTMENT_OFFICER';
  department?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'LEGAL_REVIEWER' | 'DEPARTMENT_OFFICER';
  department?: string;
}

// API Response Wrappers
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 2.3 Authentication Context
**Create**: [`src/contexts/AuthContext.tsx`](src/contexts/AuthContext.tsx)

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginCredentials } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 2.4 Protected Route Component
**Create**: [`src/components/ProtectedRoute.tsx`](src/components/ProtectedRoute.tsx)

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'LEGAL_REVIEWER' | 'DEPARTMENT_OFFICER';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

---

## 🔌 Phase 3: API Service Layer

### 3.1 Authentication Service
**Create**: [`src/services/auth.service.ts`](src/services/auth.service.ts)

```typescript
import { apiClient } from '@/lib/api';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<{ message: string; user: User }> => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<{ user: User }>('/auth/me');
    return data.user;
  },
};
```

### 3.2 Cases Service
**Create**: [`src/services/cases.service.ts`](src/services/cases.service.ts)

```typescript
import { apiClient } from '@/lib/api';
import { Case, PaginatedResponse } from '@/types';

export const casesService = {
  getAll: async (params?: {
    status?: string;
    department?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Case>> => {
    const { data } = await apiClient.get('/cases', { params });
    return data;
  },

  getById: async (id: string): Promise<Case> => {
    const { data } = await apiClient.get(`/cases/${id}`);
    return data;
  },

  create: async (caseData: Partial<Case>): Promise<Case> => {
    const { data } = await apiClient.post('/cases', caseData);
    return data;
  },

  update: async (id: string, updates: Partial<Case>): Promise<Case> => {
    const { data } = await apiClient.patch(`/cases/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/cases/${id}`);
  },
};
```

### 3.3 Directives Service
**Create**: [`src/services/directives.service.ts`](src/services/directives.service.ts)

```typescript
import { apiClient } from '@/lib/api';
import { Directive } from '@/types';

export const directivesService = {
  getByCaseId: async (caseId: string): Promise<Directive[]> => {
    const { data } = await apiClient.get(`/directives?caseId=${caseId}`);
    return data;
  },

  create: async (directive: Partial<Directive>): Promise<Directive> => {
    const { data } = await apiClient.post('/directives', directive);
    return data;
  },

  update: async (id: string, updates: Partial<Directive>): Promise<Directive> => {
    const { data } = await apiClient.patch(`/directives/${id}`, updates);
    return data;
  },

  verify: async (id: string, notes?: string): Promise<Directive> => {
    const { data } = await apiClient.post(`/directives/${id}/verify`, { notes });
    return data;
  },
};
```

### 3.4 Upload Service
**Create**: [`src/services/upload.service.ts`](src/services/upload.service.ts)

```typescript
import { apiClient } from '@/lib/api';

export const uploadService = {
  uploadFile: async (
    file: File,
    metadata: {
      caseNumber: string;
      court: string;
      department: string;
      filingDate: string;
      priority: 'high' | 'medium' | 'low';
    },
    onProgress?: (progress: number) => void
  ): Promise<{ caseId: string; fileUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const { data } = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return data;
  },
};
```

### 3.5 Governance Service
**Create**: [`src/services/governance.service.ts`](src/services/governance.service.ts)

```typescript
import { apiClient } from '@/lib/api';
import { GovernanceMetrics, Department } from '@/types';

export const governanceService = {
  getMetrics: async (): Promise<GovernanceMetrics> => {
    const { data } = await apiClient.get('/governance/metrics');
    return data;
  },

  getDepartments: async (): Promise<Department[]> => {
    const { data } = await apiClient.get('/governance/departments');
    return data;
  },

  getDirectiveDistribution: async (): Promise<Array<{ name: string; value: number }>> => {
    const { data } = await apiClient.get('/governance/directive-distribution');
    return data;
  },

  getCaseAging: async (): Promise<Array<{ bucket: string; count: number }>> => {
    const { data } = await apiClient.get('/governance/case-aging');
    return data;
  },
};
```

### 3.6 Deadlines Service
**Create**: [`src/services/deadlines.service.ts`](src/services/deadlines.service.ts)

```typescript
import { apiClient } from '@/lib/api';
import { Deadline } from '@/types';

export const deadlinesService = {
  getByCaseId: async (caseId: string): Promise<Deadline[]> => {
    const { data } = await apiClient.get(`/deadlines?caseId=${caseId}`);
    return data;
  },

  create: async (deadline: Partial<Deadline>): Promise<Deadline> => {
    const { data } = await apiClient.post('/deadlines', deadline);
    return data;
  },

  update: async (id: string, updates: Partial<Deadline>): Promise<Deadline> => {
    const { data } = await apiClient.patch(`/deadlines/${id}`, updates);
    return data;
  },
};
```

### 3.7 Audit Logs Service
**Create**: [`src/services/audit.service.ts`](src/services/audit.service.ts)

```typescript
import { apiClient } from '@/lib/api';
import { ReviewerLog } from '@/types';

export const auditService = {
  getByCaseId: async (caseId: string): Promise<ReviewerLog[]> => {
    const { data } = await apiClient.get(`/audit-logs/case/${caseId}`);
    return data;
  },

  getAll: async (params?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ReviewerLog[]> => {
    const { data } = await apiClient.get('/audit-logs', { params });
    return data;
  },
};
```

---

## 🎨 Phase 4: Page Integration

### 4.1 Update Router with Auth
**Update**: [`src/router.tsx`](src/router.tsx)

```typescript
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UploadPage from '@/pages/UploadPage';
import WorkspacePage from '@/pages/WorkspacePage';
import VerificationPage from '@/pages/VerificationPage';
import GovernancePage from '@/pages/GovernancePage';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'workspace/:caseId', element: <WorkspacePage /> },
      { path: 'verification/:caseId', element: <VerificationPage /> },
      {
        path: 'governance',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <GovernancePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
```

### 4.2 Update Main App
**Update**: [`src/main.tsx`](src/main.tsx)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { router } from './router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="courtaction-theme">
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

### 4.3 Login Page Integration
**Update**: [`src/pages/LoginPage.tsx`](src/pages/LoginPage.tsx:12-16)

Replace mock login with real authentication:
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component with form inputs bound to state
}
```

### 4.4 Dashboard Page Integration
**Update**: [`src/pages/DashboardPage.tsx`](src/pages/DashboardPage.tsx:9-37)

Replace mock data with API calls:
```typescript
import { useEffect, useState } from 'react';
import { casesService } from '@/services/cases.service';
import { deadlinesService } from '@/services/deadlines.service';
import { governanceService } from '@/services/governance.service';
import { Case, Deadline, GovernanceMetrics } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [casesData, metricsData] = await Promise.all([
        casesService.getAll({ limit: 5 }),
        governanceService.getMetrics(),
      ]);
      
      setCases(casesData.data);
      setMetrics(metricsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // ... rest of component using real data
}
```

### 4.5 Upload Page Integration
**Update**: [`src/pages/UploadPage.tsx`](src/pages/UploadPage.tsx:17-40)

Add file upload functionality:
```typescript
import { useState } from 'react';
import { uploadService } from '@/services/upload.service';
import { casesService } from '@/services/cases.service';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cases, setCases] = useState<Case[]>([]);

  const handleFileUpload = async (file: File, metadata: any) => {
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadService.uploadFile(file, metadata, setProgress);
      toast.success('File uploaded successfully!');
      loadCases(); // Refresh case list
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // ... rest of component
}
```

### 4.6 Workspace Page Integration
**Update**: [`src/pages/WorkspacePage.tsx`](src/pages/WorkspacePage.tsx:11-14)

Load case and directive data:
```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { casesService } from '@/services/cases.service';
import { directivesService } from '@/services/directives.service';
import { deadlinesService } from '@/services/deadlines.service';

export default function WorkspacePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseId) loadCaseData(caseId);
  }, [caseId]);

  const loadCaseData = async (id: string) => {
    try {
      const [caseInfo, directivesList, deadlinesList] = await Promise.all([
        casesService.getById(id),
        directivesService.getByCaseId(id),
        deadlinesService.getByCaseId(id),
      ]);
      
      setCaseData(caseInfo);
      setDirectives(directivesList);
      setDeadlines(deadlinesList);
    } catch (error) {
      toast.error('Failed to load case data');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

### 4.7 Verification Page Integration
**Update**: [`src/pages/VerificationPage.tsx`](src/pages/VerificationPage.tsx:12-14)

Add verification actions:
```typescript
import { directivesService } from '@/services/directives.service';
import { auditService } from '@/services/audit.service';

export default function VerificationPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [auditLogs, setAuditLogs] = useState<ReviewerLog[]>([]);

  const handleVerify = async (directiveId: string, notes: string) => {
    try {
      await directivesService.verify(directiveId, notes);
      toast.success('Directive verified successfully');
      loadCaseData(caseId!); // Refresh data
    } catch (error) {
      toast.error('Verification failed');
    }
  };

  // ... rest of component
}
```

### 4.8 Governance Page Integration
**Update**: [`src/pages/GovernancePage.tsx`](src/pages/GovernancePage.tsx:8-31)

Load analytics data:
```typescript
import { useEffect, useState } from 'react';
import { governanceService } from '@/services/governance.service';

export default function GovernancePage() {
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [directiveDistribution, setDirectiveDistribution] = useState<any[]>([]);
  const [caseAging, setCaseAging] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGovernanceData();
  }, []);

  const loadGovernanceData = async () => {
    try {
      const [metricsData, deptData, distData, agingData] = await Promise.all([
        governanceService.getMetrics(),
        governanceService.getDepartments(),
        governanceService.getDirectiveDistribution(),
        governanceService.getCaseAging(),
      ]);
      
      setMetrics(metricsData);
      setDepartments(deptData);
      setDirectiveDistribution(distData);
      setCaseAging(agingData);
    } catch (error) {
      toast.error('Failed to load governance data');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component with real data
}
```

---

## 🚀 Phase 5: Render Deployment Configuration

### 5.1 Create Render Configuration
**Create**: `render.yaml`

```yaml
services:
  # Backend API Service
  - type: web
    name: court-action-ai-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install && npx prisma generate && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DATABASE_URL
        fromDatabase:
          name: court-action-ai-db
          property: connectionString
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: 24h
      - key: FRONTEND_URL
        value: https://court-action-ai.onrender.com
    healthCheckPath: /api/health

  # Frontend Service
  - type: web
    name: court-action-ai-frontend
    env: static
    region: oregon
    plan: free
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        value: https://court-action-ai-backend.onrender.com/api
      - key: VITE_APP_NAME
        value: Court Action AI
    routes:
      - type: rewrite
        source: /*
        destination: /index.html

databases:
  - name: court-action-ai-db
    databaseName: courtaction
    user: courtaction_user
    plan: free
    region: oregon
```

### 5.2 Update Backend for Production
**Update**: [`backend/src/server.ts`](backend/src/server.ts:28-31)

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 5.3 Create Deployment Scripts
**Update**: [`package.json`](package.json:6-10)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy:backend": "cd backend && npm run build",
    "deploy:frontend": "npm run build"
  }
}
```

---

## 📝 Phase 6: Documentation Updates

### 6.1 Create Render Deployment Guide
**Create**: `RENDER_DEPLOYMENT.md`

```markdown
# Render Deployment Guide

## Prerequisites
1. GitHub account with repository
2. Render account (free tier available)
3. Supabase project set up

## Step 1: Prepare Repository
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Create Supabase Project
1. Go to supabase.com
2. Create new project
3. Copy connection string and API keys

## Step 3: Deploy to Render
1. Go to render.com
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml`
5. Add environment variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
6. Click "Apply"

## Step 4: Run Database Migrations
```bash
# In Render shell for backend service
npx prisma db push
```

## Step 5: Verify Deployment
- Backend: https://court-action-ai-backend.onrender.com/api/health
- Frontend: https://court-action-ai.onrender.com
```

### 6.2 Update README
**Update**: [`README.md`](README.md)

Add sections for:
- Installation instructions
- Environment setup
- Development workflow
- Deployment guide
- API documentation link

---

## 🧪 Phase 7: Testing & Validation

### 7.1 Testing Checklist

**Authentication Flow:**
- [ ] User can register
- [ ] User can login
- [ ] Token is stored and sent with requests
- [ ] Protected routes redirect to login
- [ ] Logout clears session

**Dashboard:**
- [ ] Displays real case data
- [ ] Shows correct metrics
- [ ] Critical deadlines load
- [ ] Navigation works

**Upload:**
- [ ] File upload works
- [ ] Progress indicator shows
- [ ] Success/error messages display
- [ ] Case list refreshes

**Workspace:**
- [ ] Case data loads
- [ ] Directives display
- [ ] Deadlines show correctly
- [ ] PDF viewer works (if implemented)

**Verification:**
- [ ] Verification actions work
- [ ] Audit logs display
- [ ] Notes can be added

**Governance:**
- [ ] Metrics load
- [ ] Charts render
- [ ] Department data displays
- [ ] Export functionality works

**Error Handling:**
- [ ] Network errors show toast
- [ ] 401 redirects to login
- [ ] Loading states display
- [ ] Form validation works

---

## 📊 Implementation Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| 1 | Project Setup & Configuration | 2 hours |
| 2 | Authentication Infrastructure | 3 hours |
| 3 | API Service Layer | 3 hours |
| 4 | Page Integration | 6 hours |
| 5 | Render Deployment Config | 2 hours |
| 6 | Documentation | 2 hours |
| 7 | Testing & Validation | 3 hours |
| **Total** | | **21 hours** |

---

## 🎯 Success Criteria

✅ All pages connected to backend APIs
✅ Authentication working end-to-end
✅ Error handling and loading states implemented
✅ Deployed successfully to Render
✅ All CRUD operations functional
✅ Role-based access control working
✅ File upload operational
✅ Documentation complete

---

## 📚 Additional Resources

- [Backend API Documentation](backend/README.md)
- [Prisma Schema](backend/prisma/schema.prisma)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Render Deployment Docs](https://render.com/docs)
- [React Query (optional enhancement)](https://tanstack.com/query/latest)

---

## 🔄 Next Steps After Integration

1. **Performance Optimization**
   - Implement React Query for caching
   - Add pagination for large lists
   - Optimize bundle size

2. **Enhanced Features**
   - Real-time updates with WebSockets
   - Advanced search and filtering
   - Bulk operations
   - Export to PDF/Excel

3. **Security Enhancements**
   - Rate limiting on frontend
   - CSRF protection
   - Content Security Policy
   - Input sanitization

4. **Monitoring & Analytics**
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics
   - Audit log visualization

---

**Ready to implement?** Switch to Code mode to begin execution! 🚀