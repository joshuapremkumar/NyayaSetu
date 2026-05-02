# CourtAction AI - Production Transformation Plan

## 🎯 Executive Summary

Transform the v0-generated CourtAction AI frontend into a **production-ready judicial governance SaaS platform** with enterprise-grade backend, authentication, database, and deployment infrastructure.

**Timeline**: Phased approach (4 phases)
**Architecture**: Hybrid (Supabase + Custom Express API)
**Deployment**: Render (Frontend + Backend)

---

## 📊 Current State Analysis

### ✅ Existing Assets (Preserve 100%)
- **Framework**: Vite + React 18 + TypeScript
- **Routing**: React Router v6 (createBrowserRouter)
- **UI Components**: 50+ Radix UI components with Tailwind CSS v4
- **Pages**: 7 complete pages (Landing, Login, Dashboard, Upload, Workspace, Verification, Governance)
- **Design System**: Professional judicial theme with blue (#0047CC) primary color
- **Type System**: Comprehensive TypeScript types for Case, Directive, Deadline, etc.
- **Mock Data**: Well-structured mock data ready for backend integration

### ⚠️ Missing Components (Build)
- Backend API infrastructure
- Authentication & authorization
- Database schema & ORM
- File upload & storage
- OCR/AI integration points
- Audit trail system
- Deployment configuration

---

## 🏗️ Architecture Design

### Technology Stack

**Frontend (Existing - Preserve)**
- Vite 5.x
- React 18.3
- TypeScript 5.7
- React Router 6
- Radix UI + Tailwind CSS 4

**Backend (New - Build)**
- **API Server**: Node.js 20 + Express.js 4.x
- **Database**: PostgreSQL 15+ (via Supabase)
- **ORM**: Prisma 5.x (type-safe queries)
- **Authentication**: Supabase Auth (email/password + JWT)
- **Storage**: Supabase Storage (PDF documents)
- **OCR Placeholder**: IBM watsonx.ai integration points
- **Deployment**: Render (Web Service + PostgreSQL)

### Why Hybrid Architecture?

1. **Supabase Benefits**:
   - Built-in authentication (email/password, JWT)
   - PostgreSQL database with real-time subscriptions
   - Secure file storage with access policies
   - Row-level security (RLS) for data isolation
   - Fast setup, minimal infrastructure code

2. **Custom Express API Benefits**:
   - Complex business logic (deadline calculations, risk scoring)
   - AI/OCR integration orchestration
   - Custom audit trail implementation
   - Workflow state machines
   - Advanced governance analytics

3. **Best of Both Worlds**:
   - Supabase handles auth, storage, basic CRUD
   - Express handles complex judicial workflows
   - Type-safe with Prisma + TypeScript
   - Scalable and maintainable

---

## 📋 Detailed Implementation Plan

### **PHASE A: Framework Compatibility & Setup**

#### A1. Project Structure Reorganization
```
court-action-ai/
├── frontend/                    # Existing Vite app (move here)
│   ├── src/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # New Express API
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Auth, validation
│   │   ├── services/           # External integrations
│   │   ├── utils/              # Helpers
│   │   └── server.ts           # Entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── package.json
│   └── tsconfig.json
├── shared/                      # Shared types
│   └── types/
├── docs/                        # Documentation
│   ├── API.md
│   └── DEPLOYMENT.md
├── .env.example
├── docker-compose.yml           # Local development
└── render.yaml                  # Deployment config
```

#### A2. Environment Configuration
- Create `.env.example` with all required variables
- Set up Supabase project (free tier)
- Configure environment variables for local/production

#### A3. Dependencies Installation
**Backend packages**:
- express, cors, helmet, compression
- @supabase/supabase-js
- prisma, @prisma/client
- jsonwebtoken, bcryptjs
- multer (file uploads)
- zod (validation)
- winston (logging)

---

### **PHASE B: Backend Skeleton & Database**

#### B1. Database Schema Design

**Core Tables**:

```prisma
// Users & Authentication
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  role          Role     @default(DEPARTMENT_OFFICER)
  department    String?
  fullName      String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  uploadedCases Case[]   @relation("UploadedBy")
  auditLogs     AuditLog[]
}

enum Role {
  ADMIN
  LEGAL_REVIEWER
  DEPARTMENT_OFFICER
}

// Cases
model Case {
  id              String      @id @default(uuid())
  caseNumber      String      @unique
  court           String
  department      String
  filingDate      DateTime
  status          CaseStatus  @default(PENDING)
  priority        Priority    @default(MEDIUM)
  fileName        String
  fileUrl         String
  fileSize        Int
  uploadedAt      DateTime    @default(now())
  uploadedById    String
  uploadedBy      User        @relation("UploadedBy", fields: [uploadedById], references: [id])
  
  directives      Directive[]
  deadlines       Deadline[]
  auditLogs       AuditLog[]
}

enum CaseStatus {
  PENDING
  PROCESSING
  VERIFIED
  REJECTED
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}

// Directives (Extracted from judgments)
model Directive {
  id                    String         @id @default(uuid())
  caseId                String
  case                  Case           @relation(fields: [caseId], references: [id], onDelete: Cascade)
  type                  DirectiveType
  content               String         @db.Text
  confidenceScore       Int            // 0-100
  riskLevel             RiskLevel
  responsibleDepartment String
  extractedAt           DateTime       @default(now())
  verifiedAt            DateTime?
  verifiedById          String?
  
  sourceReferences      SourceReference[]
}

enum DirectiveType {
  COMPLIANCE
  APPEAL
  REVIEW
  REINSTATEMENT
  COMPENSATION
  POLICY_AMENDMENT
  ADMINISTRATIVE_ACTION
  ESCALATION
  STAY_ORDER
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}

// Source References (Explainability)
model SourceReference {
  id              String    @id @default(uuid())
  directiveId     String
  directive       Directive @relation(fields: [directiveId], references: [id], onDelete: Cascade)
  pageNumber      Int
  paragraphNumber Int
  snippet         String    @db.Text
  highlightStart  Int?
  highlightEnd    Int?
}

// Deadlines
model Deadline {
  id             String          @id @default(uuid())
  caseId         String
  case           Case            @relation(fields: [caseId], references: [id], onDelete: Cascade)
  type           DeadlineType
  dueDate        DateTime
  urgency        DeadlineUrgency
  notified       Boolean         @default(false)
  completed      Boolean         @default(false)
  completedAt    DateTime?
}

enum DeadlineType {
  COMPLIANCE
  APPEAL
  ESCALATION
}

enum DeadlineUrgency {
  CRITICAL
  WARNING
  NORMAL
}

// Audit Trail
model AuditLog {
  id          String      @id @default(uuid())
  caseId      String?
  case        Case?       @relation(fields: [caseId], references: [id], onDelete: Cascade)
  action      AuditAction
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  timestamp   DateTime    @default(now())
  notes       String?     @db.Text
  metadata    Json?       // Additional context
}

enum AuditAction {
  UPLOADED
  PROCESSED
  REVIEWED
  APPROVED
  REJECTED
  EDITED
  DELETED
}
```

#### B2. Prisma Setup
- Initialize Prisma with Supabase connection
- Create migrations
- Generate Prisma Client
- Seed database with test data

#### B3. Express API Structure

**Core Routes**:
```
POST   /api/auth/login              # Email/password login
POST   /api/auth/logout             # Logout
GET    /api/auth/me                 # Get current user

GET    /api/cases                   # List cases (filtered, paginated)
POST   /api/cases                   # Upload new case
GET    /api/cases/:id               # Get case details
PATCH  /api/cases/:id               # Update case
DELETE /api/cases/:id               # Delete case

GET    /api/cases/:id/directives    # Get case directives
POST   /api/cases/:id/directives    # Create directive (AI extraction)
PATCH  /api/directives/:id          # Update directive
POST   /api/directives/:id/verify   # Verify directive

GET    /api/deadlines               # Get all deadlines
GET    /api/deadlines/critical      # Get critical deadlines
PATCH  /api/deadlines/:id/complete  # Mark deadline complete

GET    /api/governance/metrics      # Dashboard metrics
GET    /api/governance/departments  # Department risk exposure
GET    /api/governance/analytics    # Advanced analytics

GET    /api/audit-logs              # Get audit trail
GET    /api/audit-logs/case/:id     # Case-specific logs

POST   /api/upload                  # File upload endpoint
GET    /api/files/:id               # Download file
```

---

### **PHASE C: Authentication & Authorization**

#### C1. Supabase Auth Integration
- Set up Supabase Auth with email/password
- Configure JWT secret and expiration
- Create auth middleware for Express

#### C2. Role-Based Access Control (RBAC)

**Role Permissions**:

| Feature | Admin | Legal Reviewer | Department Officer |
|---------|-------|----------------|-------------------|
| Upload Cases | ✅ | ✅ | ✅ |
| View All Cases | ✅ | ✅ | ❌ (own dept only) |
| AI Extraction | ✅ | ✅ | ✅ |
| Verify Directives | ✅ | ✅ | ❌ |
| Approve/Reject | ✅ | ✅ | ❌ |
| Governance Dashboard | ✅ | ✅ | ❌ (limited view) |
| User Management | ✅ | ❌ | ❌ |
| Audit Logs | ✅ | ✅ | ❌ |

#### C3. Frontend Auth Integration
- Create auth context/provider
- Add protected route wrapper
- Update LoginPage with real auth
- Add token refresh logic
- Implement logout functionality

---

### **PHASE D: Core Features Implementation**

#### D1. File Upload & Storage
- Configure Supabase Storage bucket
- Implement secure file upload (PDF only)
- Add file size validation (max 50MB)
- Generate signed URLs for downloads
- Implement file deletion

#### D2. OCR & AI Extraction Placeholders
```typescript
// services/ai-extraction.service.ts
export class AIExtractionService {
  async extractDirectives(fileUrl: string): Promise<ExtractionResult> {
    // TODO: Integrate IBM watsonx.ai
    // For now, return mock extraction
    return {
      directives: [...],
      deadlines: [...],
      sourceReferences: [...],
      confidenceScore: 94,
      processingTime: 2.4
    };
  }
  
  async ocrDocument(fileUrl: string): Promise<string> {
    // TODO: Integrate OCR service
    return "Extracted text...";
  }
}
```

#### D3. Verification Workflow
- Implement state machine for case status
- Add approval/rejection logic
- Send notifications on status changes
- Track reviewer actions in audit log

#### D4. Deadline Engine
- Calculate deadlines based on directive type
- Implement urgency calculation
- Create deadline notification system
- Add deadline completion tracking

#### D5. Audit Trail System
- Log all user actions automatically
- Capture metadata (IP, user agent, etc.)
- Implement audit log queries
- Add export functionality

#### D6. Governance Analytics
- Calculate department risk scores
- Aggregate case aging metrics
- Generate directive distribution stats
- Implement real-time dashboard queries

---

### **PHASE E: Deployment & Production Readiness**

#### E1. Render Configuration

**render.yaml**:
```yaml
services:
  # Backend API
  - type: web
    name: courtaction-api
    env: node
    buildCommand: cd backend && npm install && npx prisma generate && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production

  # Frontend (Static Site)
  - type: web
    name: courtaction-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        value: https://courtaction-api.onrender.com
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false

databases:
  - name: courtaction-db
    databaseName: courtaction
    user: courtaction
```

#### E2. Environment Variables
```env
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
JWT_SECRET=xxx
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://courtaction.onrender.com

# Frontend (.env)
VITE_API_URL=https://courtaction-api.onrender.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

#### E3. Security Hardening
- Enable CORS with whitelist
- Add rate limiting (express-rate-limit)
- Implement helmet.js security headers
- Add input validation with Zod
- Enable HTTPS only
- Implement CSRF protection
- Add SQL injection prevention (Prisma handles this)
- Sanitize file uploads

#### E4. Performance Optimization
- Enable gzip compression
- Add response caching
- Optimize database queries (indexes)
- Implement pagination
- Add CDN for static assets
- Enable database connection pooling

#### E5. Monitoring & Logging
- Set up Winston logger
- Add error tracking (Sentry optional)
- Implement health check endpoint
- Add performance monitoring
- Create deployment logs

---

## 🚀 Implementation Order (Step-by-Step)

### Week 1: Foundation
1. ✅ Analyze existing codebase
2. Create project structure (frontend/backend split)
3. Set up Supabase project
4. Initialize Prisma with schema
5. Create database migrations
6. Set up Express server skeleton

### Week 2: Authentication & Database
7. Implement Supabase Auth integration
8. Create auth middleware
9. Build user management endpoints
10. Update frontend auth context
11. Connect LoginPage to real auth
12. Implement protected routes

### Week 3: Core Features
13. Build case management API
14. Implement file upload system
15. Create directive endpoints
16. Add deadline calculation logic
17. Build audit trail system
18. Update frontend to use real APIs

### Week 4: Advanced Features & Deployment
19. Add OCR/AI placeholders
20. Implement verification workflow
21. Build governance analytics
22. Add RBAC enforcement
23. Configure Render deployment
24. Deploy to production
25. Test end-to-end

---

## 📊 Success Criteria

### Must Have (MVP)
- ✅ User login with email/password
- ✅ Upload PDF judgments
- ✅ Store cases in PostgreSQL
- ✅ Basic verification workflow
- ✅ Dashboard with metrics
- ✅ Audit trail logging
- ✅ Deployed on Render

### Should Have (Phase 2)
- ⏳ Full OCR integration
- ⏳ IBM watsonx.ai extraction
- ⏳ Directive auto-extraction
- ⏳ Email notifications
- ⏳ Advanced analytics

### Could Have (Future)
- 🔮 CCMS integration
- 🔮 Mobile app
- 🔮 Real-time collaboration
- 🔮 Advanced reporting

---

## 🎨 Frontend Preservation Strategy

**Zero UI Changes Required**:
- All existing pages remain identical
- Design system stays intact
- Component structure unchanged
- Only data source changes (mock → API)

**Integration Points**:
1. Replace mock data imports with API calls
2. Add loading states
3. Add error handling
4. Update form submissions
5. Add real-time updates (optional)

---

## 📝 Next Steps

1. **Review this plan** - Confirm architecture decisions
2. **Set up Supabase** - Create project and get credentials
3. **Begin Phase A** - Restructure project
4. **Implement Phase B** - Build backend skeleton
5. **Continue sequentially** - Follow week-by-week plan

---

## 🔗 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Render Deployment](https://render.com/docs)
- [React Router Auth](https://reactrouter.com/en/main/start/overview)

---

**Document Version**: 1.0
**Last Updated**: 2026-05-02
**Status**: Ready for Implementation