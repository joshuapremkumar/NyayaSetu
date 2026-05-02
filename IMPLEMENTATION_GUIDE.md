# CourtAction AI - Implementation Guide

## 🎯 Quick Start Guide

This guide provides step-by-step instructions for implementing the CourtAction AI transformation plan.

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] Node.js 20+ installed
- [ ] pnpm or npm installed
- [ ] Git installed
- [ ] Supabase account (free tier)
- [ ] Render account (free tier)
- [ ] Code editor (VS Code recommended)

---

## 🚀 Phase 1: Project Setup & Restructuring

### Step 1: Create Backend Directory Structure

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors helmet compression dotenv
npm install @supabase/supabase-js prisma @prisma/client
npm install jsonwebtoken bcryptjs multer zod winston
npm install express-rate-limit express-validator

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/multer @types/bcryptjs
npm install -D @types/jsonwebtoken ts-node nodemon
npm install -D prisma
```

### Step 2: Configure TypeScript for Backend

Create `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Create Backend Package.json Scripts

Update `backend/package.json`:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

### Step 4: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep secret!)
   - Database connection string

### Step 5: Create Environment Files

Create `backend/.env`:
```env
# Server
PORT=3001
NODE_ENV=development

# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Supabase
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=application/pdf
```

Create `.env.example` (without sensitive values) for version control.

### Step 6: Initialize Prisma

```bash
cd backend
npx prisma init
```

This creates `prisma/schema.prisma`. Update it with the schema from TRANSFORMATION_PLAN.md.

---

## 🗄️ Phase 2: Database Setup

### Step 1: Create Prisma Schema

Copy the complete schema from `TRANSFORMATION_PLAN.md` into `backend/prisma/schema.prisma`.

### Step 2: Run Migrations

```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Step 3: Seed Database (Optional)

Create `backend/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@judiciary.gov',
      role: 'ADMIN',
      fullName: 'System Administrator',
      department: 'IT Department',
    },
  });

  console.log('Seeded admin user:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx prisma db seed
```

---

## 🔐 Phase 3: Authentication Implementation

### Step 1: Create Auth Service

Create `backend/src/services/auth.service.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export class AuthService {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Generate custom JWT with role
    const token = jwt.sign(
      { 
        userId: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return { token, user: data.user };
  }

  async register(email: string, password: string, role: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, fullName }
      }
    });

    if (error) throw error;
    return data;
  }

  verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }
}
```

### Step 2: Create Auth Middleware

Create `backend/src/middleware/auth.middleware.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = authService.verifyToken(token) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Step 3: Create Auth Routes

Create `backend/src/routes/auth.routes.ts`:
```typescript
import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authService = new AuthService();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, fullName } = req.body;
    const result = await authService.register(email, password, role, fullName);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', authenticate, async (req: any, res) => {
  res.json({ user: req.user });
});

router.post('/logout', authenticate, async (req, res) => {
  // Client-side will remove token
  res.json({ message: 'Logged out successfully' });
});

export default router;
```

---

## 🏗️ Phase 4: Core API Implementation

### Step 1: Create Express Server

Create `backend/src/server.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import caseRoutes from './routes/case.routes';
import directiveRoutes from './routes/directive.routes';
import deadlineRoutes from './routes/deadline.routes';
import governanceRoutes from './routes/governance.routes';
import auditRoutes from './routes/audit.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/directives', directiveRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/audit-logs', auditRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
```

### Step 2: Create Case Service & Routes

Create `backend/src/services/case.service.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CaseService {
  async list(filters: any) {
    return prisma.case.findMany({
      where: filters,
      include: {
        uploadedBy: true,
        directives: true,
        deadlines: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.case.findUnique({
      where: { id },
      include: {
        uploadedBy: true,
        directives: {
          include: { sourceReferences: true }
        },
        deadlines: true,
        auditLogs: {
          include: { user: true },
          orderBy: { timestamp: 'desc' }
        },
      },
    });
  }

  async create(data: any) {
    return prisma.case.create({
      data,
      include: { uploadedBy: true },
    });
  }

  async update(id: string, data: any) {
    return prisma.case.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.case.delete({
      where: { id },
    });
  }
}
```

---

## 🎨 Phase 5: Frontend Integration

### Step 1: Create API Client

Create `frontend/src/lib/api.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  }

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  }

  async delete(endpoint: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  }
}

export const api = new ApiClient();
```

### Step 2: Create Auth Context

Create `frontend/src/contexts/AuthContext.tsx`:
```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  userId: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(data => setUser(data.user))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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

### Step 3: Update LoginPage

Update `frontend/src/pages/LoginPage.tsx` to use real auth:
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
// ... existing imports

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  // ... rest of component with real form handling
}
```

---

## 🚀 Phase 6: Deployment

### Step 1: Create render.yaml

Create `render.yaml` in project root (see TRANSFORMATION_PLAN.md for full config).

### Step 2: Deploy to Render

1. Push code to GitHub
2. Connect GitHub repo to Render
3. Render will auto-detect `render.yaml`
4. Set environment variables in Render dashboard
5. Deploy!

### Step 3: Configure Environment Variables in Render

For Backend Service:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`

For Frontend Service:
- `VITE_API_URL` (your backend URL)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## ✅ Testing Checklist

- [ ] Backend server starts without errors
- [ ] Database migrations run successfully
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] JWT token is generated
- [ ] Protected routes require authentication
- [ ] RBAC permissions work correctly
- [ ] Can upload case file
- [ ] Can list cases
- [ ] Can view case details
- [ ] Frontend connects to backend API
- [ ] Login page works with real auth
- [ ] Dashboard loads real data
- [ ] File upload works
- [ ] Deployment successful on Render

---

## 🐛 Common Issues & Solutions

### Issue: Prisma Client not generated
**Solution**: Run `npx prisma generate`

### Issue: Database connection fails
**Solution**: Check DATABASE_URL format and Supabase connection string

### Issue: CORS errors
**Solution**: Verify CORS_ORIGIN matches frontend URL

### Issue: JWT verification fails
**Solution**: Ensure JWT_SECRET is same across all environments

### Issue: File upload fails
**Solution**: Check Supabase storage bucket permissions

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Render Deployment](https://render.com/docs)

---

**Last Updated**: 2026-05-02
**Version**: 1.0