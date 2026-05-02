# CourtAction AI - System Architecture

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React 18 + Vite + TypeScript Frontend                   │   │
│  │  - Landing Page                                           │   │
│  │  - Login/Auth                                             │   │
│  │  - Dashboard (Metrics, Cases, Deadlines)                  │   │
│  │  - Upload (PDF Documents)                                 │   │
│  │  - AI Workspace (Extraction Interface)                    │   │
│  │  - Verification (Review & Approve)                        │   │
│  │  - Governance (Analytics & Reports)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express.js API Server (Node.js 20)                      │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Authentication Middleware (JWT + Supabase Auth)   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Authorization Middleware (RBAC)                   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  API Routes                                        │  │   │
│  │  │  - /api/auth/*                                     │  │   │
│  │  │  - /api/cases/*                                    │  │   │
│  │  │  - /api/directives/*                               │  │   │
│  │  │  - /api/deadlines/*                                │  │   │
│  │  │  - /api/governance/*                               │  │   │
│  │  │  - /api/audit-logs/*                               │  │   │
│  │  │  - /api/upload/*                                   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Business Logic Services                           │  │   │
│  │  │  - CaseService                                     │  │   │
│  │  │  - DirectiveService                                │  │   │
│  │  │  - DeadlineService                                 │  │   │
│  │  │  - AIExtractionService (Placeholder)               │  │   │
│  │  │  - AuditService                                    │  │   │
│  │  │  - GovernanceService                               │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Prisma ORM
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Supabase Platform                                       │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  PostgreSQL 15 Database                            │  │   │
│  │  │  - users                                           │  │   │
│  │  │  - cases                                           │  │   │
│  │  │  - directives                                      │  │   │
│  │  │  - source_references                               │  │   │
│  │  │  - deadlines                                       │  │   │
│  │  │  - audit_logs                                      │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Supabase Auth (JWT)                               │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Supabase Storage (PDF Files)                      │  │   │
│  │  │  - Bucket: case-documents                          │  │   │
│  │  │  - Access: Authenticated users only                │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Future Integration
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES (Phase 2)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  IBM watsonx.ai (AI Extraction)                          │   │
│  │  - Document OCR                                          │   │
│  │  - Directive Extraction                                  │   │
│  │  - Entity Recognition                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CCMS Integration (Future)                               │   │
│  │  - Case Management System Sync                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────┐                                    ┌──────────────┐
│  User    │                                    │   Supabase   │
│ (Browser)│                                    │     Auth     │
└────┬─────┘                                    └──────┬───────┘
     │                                                  │
     │  1. POST /api/auth/login                        │
     │     { email, password }                         │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │  2. Validate credentials                        │
     │     & generate JWT                              │
     │<─────────────────────────────────────────────────┤
     │                                                  │
     │  3. Return JWT + User data                      │
     │     { token, user: { id, email, role } }        │
     │                                                  │
     │  4. Store token in localStorage                 │
     │     Set Authorization header                    │
     │                                                  │
     │  5. All subsequent requests                     │
     │     Authorization: Bearer <JWT>                 │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │  6. Verify JWT & extract user                   │
     │<─────────────────────────────────────────────────┤
     │                                                  │
     │  7. Return protected resource                   │
     │                                                  │
```

---

## 📊 Data Flow - Case Upload & Processing

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Upload  │    │   API    │    │ Storage  │    │    AI    │    │ Database │
│   Page   │    │  Server  │    │ (Supabase)│   │ Service  │    │(Postgres)│
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ 1. Select PDF │               │               │               │
     │───────────────>               │               │               │
     │               │               │               │               │
     │ 2. POST /api/upload           │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │               │ 3. Upload to  │               │               │
     │               │    Storage    │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ 4. Return URL │               │               │
     │               │<──────────────┤               │               │
     │               │               │               │               │
     │               │ 5. Create Case record         │               │
     │               │───────────────────────────────────────────────>│
     │               │               │               │               │
     │               │ 6. Case ID    │               │               │
     │               │<───────────────────────────────────────────────┤
     │               │               │               │               │
     │ 7. Return Case│               │               │               │
     │<──────────────┤               │               │               │
     │               │               │               │               │
     │ 8. Navigate to Workspace      │               │               │
     │               │               │               │               │
     │ 9. POST /api/cases/:id/extract│               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │               │ 10. Trigger AI Extraction     │               │
     │               │───────────────────────────────>│               │
     │               │               │               │               │
     │               │               │ 11. Download  │               │
     │               │               │     PDF       │               │
     │               │               │<──────────────┤               │
     │               │               │               │               │
     │               │ 12. Extract directives        │               │
     │               │     (Mock for now)            │               │
     │               │<───────────────────────────────┤               │
     │               │               │               │               │
     │               │ 13. Save directives & deadlines               │
     │               │───────────────────────────────────────────────>│
     │               │               │               │               │
     │               │ 14. Create audit log          │               │
     │               │───────────────────────────────────────────────>│
     │               │               │               │               │
     │ 15. Return extraction results │               │               │
     │<──────────────┤               │               │               │
     │               │               │               │               │
```

---

## 🔒 Role-Based Access Control (RBAC)

### Permission Matrix

| Resource | Action | Admin | Legal Reviewer | Dept Officer |
|----------|--------|-------|----------------|--------------|
| **Cases** |
| | List All | ✅ | ✅ | ❌ (dept only) |
| | View Details | ✅ | ✅ | ✅ (dept only) |
| | Upload | ✅ | ✅ | ✅ |
| | Update | ✅ | ✅ | ❌ |
| | Delete | ✅ | ❌ | ❌ |
| **Directives** |
| | View | ✅ | ✅ | ✅ (dept only) |
| | Extract (AI) | ✅ | ✅ | ✅ |
| | Edit | ✅ | ✅ | ❌ |
| | Verify | ✅ | ✅ | ❌ |
| | Approve/Reject | ✅ | ✅ | ❌ |
| **Deadlines** |
| | View All | ✅ | ✅ | ❌ (dept only) |
| | Mark Complete | ✅ | ✅ | ✅ (dept only) |
| **Governance** |
| | View Dashboard | ✅ | ✅ | ✅ (limited) |
| | Export Reports | ✅ | ✅ | ❌ |
| | View Analytics | ✅ | ✅ | ❌ |
| **Audit Logs** |
| | View All | ✅ | ✅ | ❌ |
| | View Own | ✅ | ✅ | ✅ |
| **Users** |
| | List | ✅ | ❌ | ❌ |
| | Create | ✅ | ❌ | ❌ |
| | Update | ✅ | ❌ | ❌ |
| | Delete | ✅ | ❌ | ❌ |

### Implementation

```typescript
// middleware/rbac.middleware.ts
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};

// Usage in routes
router.get('/cases', 
  authenticate, 
  requireRole('ADMIN', 'LEGAL_REVIEWER', 'DEPARTMENT_OFFICER'),
  caseController.list
);

router.post('/directives/:id/verify',
  authenticate,
  requireRole('ADMIN', 'LEGAL_REVIEWER'),
  directiveController.verify
);
```

---

## 📁 Database Schema Details

### Entity Relationships

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ email       │
│ role        │
│ department  │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────┴──────┐         ┌──────────────┐
│    Case     │────────>│  AuditLog    │
│─────────────│ 1     N │──────────────│
│ id (PK)     │         │ id (PK)      │
│ caseNumber  │         │ caseId (FK)  │
│ uploadedBy  │         │ userId (FK)  │
│ status      │         │ action       │
└──────┬──────┘         │ timestamp    │
       │ 1              └──────────────┘
       │
       │ N
┌──────┴──────────┐
│   Directive     │
│─────────────────│
│ id (PK)         │
│ caseId (FK)     │
│ type            │
│ content         │
│ confidenceScore │
└──────┬──────────┘
       │ 1
       │
       │ N
┌──────┴────────────────┐
│  SourceReference      │
│───────────────────────│
│ id (PK)               │
│ directiveId (FK)      │
│ pageNumber            │
│ snippet               │
└───────────────────────┘

┌──────────────┐
│   Deadline   │
│──────────────│
│ id (PK)      │
│ caseId (FK)  │
│ type         │
│ dueDate      │
│ urgency      │
└──────────────┘
```

### Indexes for Performance

```sql
-- Cases
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_department ON cases(department);
CREATE INDEX idx_cases_uploaded_at ON cases(uploaded_at DESC);
CREATE INDEX idx_cases_case_number ON cases(case_number);

-- Directives
CREATE INDEX idx_directives_case_id ON directives(case_id);
CREATE INDEX idx_directives_type ON directives(type);
CREATE INDEX idx_directives_department ON directives(responsible_department);

-- Deadlines
CREATE INDEX idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX idx_deadlines_urgency ON deadlines(urgency);
CREATE INDEX idx_deadlines_completed ON deadlines(completed);

-- Audit Logs
CREATE INDEX idx_audit_logs_case_id ON audit_logs(case_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
```

---

## 🚀 Deployment Architecture (Render)

```
┌─────────────────────────────────────────────────────────────┐
│                    Render Platform                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Static Site (Frontend)                            │    │
│  │  - Build: npm run build                            │    │
│  │  - Serve: dist/ folder                             │    │
│  │  - Domain: courtaction.onrender.com                │    │
│  │  - CDN: Automatic                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕ HTTPS                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Web Service (Backend API)                         │    │
│  │  - Runtime: Node.js 20                             │    │
│  │  - Build: npm install && prisma generate           │    │
│  │  - Start: npm start                                │    │
│  │  - Domain: courtaction-api.onrender.com            │    │
│  │  - Health Check: /api/health                       │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database                               │    │
│  │  - Version: 15                                     │    │
│  │  - Backups: Daily automatic                        │    │
│  │  - Connection: Internal URL                        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                         │
│  - Authentication                                            │
│  - File Storage                                              │
│  - Real-time (optional)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 CI/CD Pipeline (Future)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Git    │────>│  GitHub  │────>│  Render  │────>│   Live   │
│  Commit  │     │ Actions  │     │  Deploy  │     │   Site   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │
                      ├─> Run Tests
                      ├─> Lint Code
                      ├─> Build Frontend
                      ├─> Build Backend
                      └─> Deploy if passing
```

---

## 📊 Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| API Response Time | < 200ms | Caching, indexes, connection pooling |
| Page Load Time | < 2s | Code splitting, lazy loading, CDN |
| File Upload | < 30s for 50MB | Chunked upload, progress tracking |
| AI Extraction | < 60s | Async processing, queue system |
| Database Queries | < 50ms | Optimized queries, proper indexes |
| Concurrent Users | 100+ | Horizontal scaling on Render |

---

## 🔐 Security Measures

1. **Authentication**
   - JWT tokens with 24h expiration
   - Refresh token rotation
   - Secure password hashing (bcrypt)

2. **Authorization**
   - Role-based access control
   - Row-level security in database
   - Department-based data isolation

3. **Data Protection**
   - HTTPS only (TLS 1.3)
   - Encrypted database connections
   - Secure file storage with signed URLs

4. **Input Validation**
   - Zod schema validation
   - File type/size restrictions
   - SQL injection prevention (Prisma)

5. **API Security**
   - Rate limiting (100 req/min per IP)
   - CORS whitelist
   - Helmet.js security headers
   - CSRF protection

6. **Audit Trail**
   - All actions logged
   - IP address tracking
   - Immutable audit records

---

## 📈 Scalability Considerations

### Current Architecture (MVP)
- Single Render instance
- Supabase free tier
- Handles 100+ concurrent users

### Future Scaling (Phase 2+)
- Multiple Render instances (load balancing)
- Supabase Pro tier (more connections)
- Redis caching layer
- Background job queue (Bull/BullMQ)
- CDN for static assets
- Database read replicas

---

**Document Version**: 1.0
**Last Updated**: 2026-05-02
**Status**: Architecture Approved