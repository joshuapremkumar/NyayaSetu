# CourtAction AI - FastAPI Architecture

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (React)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Vite + React 18 + TypeScript Frontend                   │   │
│  │  - Landing Page                                           │   │
│  │  - Login/Auth (JWT tokens)                                │   │
│  │  - Dashboard (Metrics, Cases, Deadlines)                  │   │
│  │  - Upload (PDF Documents)                                 │   │
│  │  - AI Workspace (Extraction Interface)                    │   │
│  │  - Verification (Review & Approve)                        │   │
│  │  - Governance (Analytics & Reports)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER (FastAPI)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FastAPI Backend (Python 3.11+)                          │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  OAuth2 Password Bearer + JWT Authentication       │  │   │
│  │  │  - Token generation (access + refresh)             │  │   │
│  │  │  - Password hashing (bcrypt)                       │  │   │
│  │  │  - Token validation middleware                     │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Role-Based Access Control (RBAC)                  │  │   │
│  │  │  - Admin, Legal Reviewer, Department Officer       │  │   │
│  │  │  - Permission decorators                           │  │   │
│  │  │  - Department-based data isolation                 │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  API Routes (FastAPI Routers)                      │  │   │
│  │  │  - /api/auth/*        (login, register, refresh)   │  │   │
│  │  │  - /api/users/*       (user management)            │  │   │
│  │  │  - /api/cases/*       (case CRUD)                  │  │   │
│  │  │  - /api/directives/*  (directive management)       │  │   │
│  │  │  - /api/deadlines/*   (deadline tracking)          │  │   │
│  │  │  - /api/upload/*      (file upload)                │  │   │
│  │  │  - /api/verification/* (review workflow)           │  │   │
│  │  │  - /api/governance/*  (analytics & metrics)        │  │   │
│  │  │  - /api/audit/*       (audit logs)                 │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Business Logic Services                           │  │   │
│  │  │  - AuthService (JWT, password hashing)             │  │   │
│  │  │  - CaseService (case management)                   │  │   │
│  │  │  - DirectiveService (extraction, verification)     │  │   │
│  │  │  - DeadlineService (calculation, tracking)         │  │   │
│  │  │  - FileService (PDF upload, storage)               │  │   │
│  │  │  - OCRService (placeholder for future)             │  │   │
│  │  │  - AuditService (logging)                          │  │   │
│  │  │  - GovernanceService (metrics, analytics)          │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↕ SQLAlchemy ORM
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (PostgreSQL)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Render PostgreSQL Database                              │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Tables:                                           │  │   │
│  │  │  - users (authentication & profiles)               │  │   │
│  │  │  - cases (judicial case records)                   │  │   │
│  │  │  - directives (extracted court directives)         │  │   │
│  │  │  - source_references (explainability)              │  │   │
│  │  │  - deadlines (compliance tracking)                 │  │   │
│  │  │  - audit_logs (complete audit trail)               │  │   │
│  │  │  - files (PDF metadata & storage paths)            │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↕ File System
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER (Render Disk)                   │
│  - PDF documents stored in persistent disk                       │
│  - Organized by case ID                                          │
│  - Secure access via signed URLs                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↕ Future Integration
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES (Phase 2)                     │
│  - IBM watsonx.ai (OCR & AI extraction)                          │
│  - Document processing pipeline                                  │
│  - Entity recognition                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 FastAPI Project Structure

```
courtaction-ai/
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── config.py                 # Configuration & settings
│   │   ├── database.py               # Database connection
│   │   │
│   │   ├── models/                   # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── case.py
│   │   │   ├── directive.py
│   │   │   ├── deadline.py
│   │   │   ├── audit_log.py
│   │   │   └── file.py
│   │   │
│   │   ├── schemas/                  # Pydantic schemas (request/response)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── case.py
│   │   │   ├── directive.py
│   │   │   ├── deadline.py
│   │   │   ├── auth.py
│   │   │   └── governance.py
│   │   │
│   │   ├── api/                      # API routes
│   │   │   ├── __init__.py
│   │   │   ├── deps.py               # Dependencies (auth, db)
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── cases.py
│   │   │       ├── directives.py
│   │   │       ├── deadlines.py
│   │   │       ├── upload.py
│   │   │       ├── verification.py
│   │   │       ├── governance.py
│   │   │       └── audit.py
│   │   │
│   │   ├── services/                 # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── case_service.py
│   │   │   ├── directive_service.py
│   │   │   ├── deadline_service.py
│   │   │   ├── file_service.py
│   │   │   ├── ocr_service.py        # Placeholder for future
│   │   │   ├── audit_service.py
│   │   │   └── governance_service.py
│   │   │
│   │   ├── core/                     # Core utilities
│   │   │   ├── __init__.py
│   │   │   ├── security.py           # JWT, password hashing
│   │   │   ├── permissions.py        # RBAC decorators
│   │   │   └── exceptions.py         # Custom exceptions
│   │   │
│   │   └── utils/                    # Helper functions
│   │       ├── __init__.py
│   │       ├── validators.py
│   │       └── helpers.py
│   │
│   ├── alembic/                      # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── tests/                        # Unit & integration tests
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_cases.py
│   │   └── test_directives.py
│   │
│   ├── uploads/                      # PDF storage (persistent disk)
│   │   └── .gitkeep
│   │
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example
│   ├── .env
│   ├── alembic.ini
│   └── README.md
│
├── frontend/                         # React Frontend (existing)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── render.yaml                       # Render deployment config
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema (SQLAlchemy Models)

### User Model
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.DEPARTMENT_OFFICER)
    department = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cases = relationship("Case", back_populates="uploaded_by")
    audit_logs = relationship("AuditLog", back_populates="user")
```

### Case Model
```python
class Case(Base):
    __tablename__ = "cases"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_number = Column(String, unique=True, nullable=False, index=True)
    court = Column(String, nullable=False)
    department = Column(String, nullable=False, index=True)
    filing_date = Column(Date, nullable=False)
    status = Column(Enum(CaseStatus), default=CaseStatus.PENDING, index=True)
    priority = Column(Enum(CasePriority), default=CasePriority.MEDIUM)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    uploaded_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    uploaded_by = relationship("User", back_populates="cases")
    directives = relationship("Directive", back_populates="case", cascade="all, delete-orphan")
    deadlines = relationship("Deadline", back_populates="case", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="case", cascade="all, delete-orphan")
```

### Directive Model
```python
class Directive(Base):
    __tablename__ = "directives"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    type = Column(Enum(DirectiveType), nullable=False, index=True)
    content = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.0)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.MEDIUM)
    responsible_department = Column(String, nullable=False, index=True)
    verified = Column(Boolean, default=False)
    verification_notes = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verified_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    case = relationship("Case", back_populates="directives")
    source_references = relationship("SourceReference", back_populates="directive", cascade="all, delete-orphan")
    verified_by = relationship("User")
```

### SourceReference Model
```python
class SourceReference(Base):
    __tablename__ = "source_references"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    directive_id = Column(UUID(as_uuid=True), ForeignKey("directives.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    paragraph_number = Column(Integer, nullable=False)
    snippet = Column(Text, nullable=False)
    highlight_start = Column(Integer, nullable=True)
    highlight_end = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    directive = relationship("Directive", back_populates="source_references")
```

### Deadline Model
```python
class Deadline(Base):
    __tablename__ = "deadlines"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    type = Column(Enum(DeadlineType), nullable=False)
    due_date = Column(Date, nullable=False, index=True)
    days_remaining = Column(Integer, nullable=False)
    urgency = Column(Enum(DeadlineUrgency), nullable=False, index=True)
    completed = Column(Boolean, default=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    case = relationship("Case", back_populates="deadlines")
```

### AuditLog Model
```python
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    action = Column(Enum(AuditAction), nullable=False)
    notes = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    case = relationship("Case", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
```

---

## 🔐 Authentication Flow

```
┌──────────┐                                    ┌──────────────┐
│  Client  │                                    │   FastAPI    │
│ (React)  │                                    │   Backend    │
└────┬─────┘                                    └──────┬───────┘
     │                                                  │
     │  1. POST /api/auth/login                        │
     │     { email, password }                         │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │  2. Validate credentials                        │
     │     - Query user from database                  │
     │     - Verify password with bcrypt               │
     │                                                  │
     │  3. Generate JWT tokens                         │
     │     - Access token (15 min expiry)              │
     │     - Refresh token (7 days expiry)             │
     │<─────────────────────────────────────────────────┤
     │                                                  │
     │  4. Return tokens + user data                   │
     │     {                                            │
     │       access_token: "eyJ...",                    │
     │       refresh_token: "eyJ...",                   │
     │       token_type: "bearer",                      │
     │       user: { id, email, role, ... }             │
     │     }                                            │
     │                                                  │
     │  5. Store tokens in localStorage                │
     │                                                  │
     │  6. All subsequent requests                     │
     │     Authorization: Bearer <access_token>        │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │  7. Validate JWT token                          │
     │     - Verify signature                          │
     │     - Check expiration                          │
     │     - Extract user info                         │
     │                                                  │
     │  8. Check permissions (RBAC)                    │
     │     - Verify role                               │
     │     - Check department access                   │
     │                                                  │
     │  9. Return protected resource                   │
     │<─────────────────────────────────────────────────┤
     │                                                  │
     │  10. When access token expires                  │
     │      POST /api/auth/refresh                     │
     │      { refresh_token }                          │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │  11. Return new access token                    │
     │<─────────────────────────────────────────────────┤
     │                                                  │
```

---

## 🛣️ API Endpoints Structure

### Authentication Endpoints
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login (get JWT tokens)
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/logout            # Logout (invalidate token)
GET    /api/auth/me                # Get current user info
```

### User Management Endpoints
```
GET    /api/users                  # List users (Admin only)
GET    /api/users/{id}             # Get user by ID
PUT    /api/users/{id}             # Update user
DELETE /api/users/{id}             # Delete user (Admin only)
PATCH  /api/users/{id}/role        # Change user role (Admin only)
```

### Case Management Endpoints
```
GET    /api/cases                  # List cases (filtered by role/dept)
POST   /api/cases                  # Create new case
GET    /api/cases/{id}             # Get case details
PUT    /api/cases/{id}             # Update case
DELETE /api/cases/{id}             # Delete case
PATCH  /api/cases/{id}/status      # Update case status
GET    /api/cases/{id}/timeline    # Get case timeline
```

### Directive Endpoints
```
GET    /api/directives             # List directives
POST   /api/directives             # Create directive (manual)
GET    /api/directives/{id}        # Get directive details
PUT    /api/directives/{id}        # Update directive
DELETE /api/directives/{id}        # Delete directive
POST   /api/directives/extract     # Extract from case (OCR placeholder)
```

### Verification Endpoints
```
GET    /api/verification/pending   # Get pending verifications
POST   /api/verification/{id}/approve  # Approve directive
POST   /api/verification/{id}/reject   # Reject directive
PUT    /api/verification/{id}/edit     # Edit and approve
```

### Deadline Endpoints
```
GET    /api/deadlines              # List deadlines
POST   /api/deadlines              # Create deadline
GET    /api/deadlines/{id}         # Get deadline details
PUT    /api/deadlines/{id}         # Update deadline
PATCH  /api/deadlines/{id}/complete # Mark as complete
GET    /api/deadlines/upcoming     # Get upcoming deadlines
GET    /api/deadlines/overdue      # Get overdue deadlines
```

### File Upload Endpoints
```
POST   /api/upload/case            # Upload case PDF
GET    /api/upload/{file_id}       # Download file
DELETE /api/upload/{file_id}       # Delete file
GET    /api/upload/{file_id}/preview # Get file preview
```

### Governance Endpoints
```
GET    /api/governance/dashboard   # Get dashboard metrics
GET    /api/governance/departments # Get department statistics
GET    /api/governance/risk-analysis # Get risk analysis
GET    /api/governance/compliance  # Get compliance metrics
GET    /api/governance/reports     # Generate reports
```

### Audit Log Endpoints
```
GET    /api/audit                  # List audit logs
GET    /api/audit/case/{id}        # Get case audit trail
GET    /api/audit/user/{id}        # Get user activity
GET    /api/audit/export           # Export audit logs
```

---

## 🔒 Role-Based Access Control (RBAC)

### Permission Matrix

| Endpoint | Admin | Legal Reviewer | Dept Officer |
|----------|-------|----------------|--------------|
| **Authentication** |
| POST /auth/register | ✅ | ❌ | ❌ |
| POST /auth/login | ✅ | ✅ | ✅ |
| **Users** |
| GET /users | ✅ | ✅ (limited) | ❌ |
| PUT /users/{id} | ✅ | ✅ (self) | ✅ (self) |
| DELETE /users/{id} | ✅ | ❌ | ❌ |
| **Cases** |
| GET /cases | ✅ (all) | ✅ (all) | ✅ (dept only) |
| POST /cases | ✅ | ✅ | ✅ |
| PUT /cases/{id} | ✅ | ✅ | ❌ |
| DELETE /cases/{id} | ✅ | ❌ | ❌ |
| **Directives** |
| GET /directives | ✅ (all) | ✅ (all) | ✅ (dept only) |
| POST /directives | ✅ | ✅ | ✅ |
| PUT /directives/{id} | ✅ | ✅ | ❌ |
| **Verification** |
| POST /verification/approve | ✅ | ✅ | ❌ |
| POST /verification/reject | ✅ | ✅ | ❌ |
| **Deadlines** |
| GET /deadlines | ✅ (all) | ✅ (all) | ✅ (dept only) |
| PATCH /deadlines/complete | ✅ | ✅ | ✅ (dept only) |
| **Governance** |
| GET /governance/dashboard | ✅ | ✅ | ✅ (limited) |
| GET /governance/reports | ✅ | ✅ | ❌ |
| **Audit** |
| GET /audit | ✅ | ✅ | ❌ |
| GET /audit/export | ✅ | ❌ | ❌ |

### Implementation Example
```python
from functools import wraps
from fastapi import HTTPException, status

def require_role(*allowed_roles: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            if current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Usage
@router.post("/cases")
@require_role("ADMIN", "LEGAL_REVIEWER", "DEPARTMENT_OFFICER")
async def create_case(case: CaseCreate, current_user: User = Depends(get_current_user)):
    ...
```

---

## 📦 Technology Stack

### Backend
- **Framework**: FastAPI 0.109+
- **Python**: 3.11+
- **ORM**: SQLAlchemy 2.0+
- **Migrations**: Alembic
- **Authentication**: python-jose (JWT), passlib (bcrypt)
- **Validation**: Pydantic v2
- **Database**: PostgreSQL 15 (Render)
- **File Upload**: python-multipart
- **CORS**: fastapi-cors-middleware

### Frontend (Existing)
- **Framework**: React 18 + Vite
- **Language**: TypeScript 5.7
- **Routing**: React Router 6
- **UI**: Radix UI + Tailwind CSS 4
- **State**: React hooks

### Deployment
- **Platform**: Render
- **Database**: Render PostgreSQL
- **Storage**: Render Persistent Disk
- **CI/CD**: Git-based auto-deploy

---

## 🚀 Deployment Configuration (render.yaml)

```yaml
services:
  # FastAPI Backend
  - type: web
    name: courtaction-api
    env: python
    region: oregon
    plan: starter
    buildCommand: |
      cd backend
      pip install -r requirements.txt
      alembic upgrade head
    startCommand: |
      cd backend
      uvicorn app.main:app --host 0.0.0.0 --port $PORT
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
        value: 15
      - key: REFRESH_TOKEN_EXPIRE_DAYS
        value: 7
      - key: FRONTEND_URL
        value: https://courtaction.onrender.com
      - key: ENVIRONMENT
        value: production
    disk:
      name: uploads
      mountPath: /opt/render/project/src/backend/uploads
      sizeGB: 10

  # React Frontend
  - type: web
    name: courtaction-frontend
    env: static
    region: oregon
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
```

---

## 🔄 Data Flow - Case Upload & Processing

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Upload  │    │ FastAPI  │    │  Storage │    │    OCR   │    │ Database │
│   Page   │    │  Server  │    │  (Disk)  │    │ Service  │    │(Postgres)│
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ 1. Select PDF │               │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │ 2. POST /api/upload/case      │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │               │ 3. Validate   │               │               │
     │               │    - File type│               │               │
     │               │    - File size│               │               │
     │               │    - Auth     │               │               │
     │               │               │               │               │
     │               │ 4. Save to disk               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ 5. File path  │               │               │
     │               │<──────────────┤               │               │
     │               │               │               │               │
     │               │ 6. Create Case record         │               │
     │               │───────────────────────────────────────────────>│
     │               │               │               │               │
     │               │ 7. Case ID    │               │               │
     │               │<───────────────────────────────────────────────┤
     │               │               │               │               │
     │               │ 8. Create audit log           │               │
     │               │───────────────────────────────────────────────>│
     │               │               │               │               │
     │ 9. Return Case│               │               │               │
     │<──────────────┤               │               │               │
     │               │               │               │               │
     │ 10. Navigate to Workspace     │               │               │
     │               │               │               │               │
     │ 11. POST /api/directives/extract              │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │               │ 12. Read PDF  │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ 13. PDF data  │               │               │
     │               │<──────────────┤               │               │
     │               │               │               │               │
     │               │ 14. Extract directives        │               │
     │               │    (Mock/Placeholder)         │               │
     │               │───────────────────────────────>│               │
     │               │               │               │               │
     │               │ 15. Extracted data            │               │
     │               │<───────────────────────────────┤               │
     │               │               │               │               │
     │               │ 16. Save directives & deadlines               │
     │               │───────────────────────────────────────────────>│
     │               │               │               │               │
     │               │ 17. Create audit log          │               │
     │               │───────────────────────────────────────────────>│
     │               │               │               │               │
     │ 18. Return results            │               │               │
     │<──────────────┤               │               │               │
     │               │               │               │               │
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/courtaction

# JWT Configuration
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Server
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_EXTENSIONS=.pdf

# OCR Service (Future)
OCR_ENABLED=false
WATSONX_API_KEY=
WATSONX_URL=
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

---

## 📊 Performance & Security

### Performance Optimizations
- Database connection pooling (SQLAlchemy)
- Query optimization with indexes
- Pagination for list endpoints
- Async/await for I/O operations
- Response caching (Redis - future)
- File streaming for large PDFs

### Security Measures
- JWT token authentication
- Password hashing with bcrypt (12 rounds)
- CORS whitelist
- Rate limiting (slowapi)
- Input validation (Pydantic)
- SQL injection prevention (SQLAlchemy ORM)
- File upload validation
- HTTPS only in production
- Secure headers (fastapi-security)

---

## 🧪 Testing Strategy

### Unit Tests
- Service layer logic
- Authentication functions
- Permission checks
- Data validation

### Integration Tests
- API endpoint testing
- Database operations
- File upload/download
- Authentication flow

### Test Structure
```python
# tests/test_auth.py
def test_register_user():
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User"
    })
    assert response.status_code == 201

def test_login():
    response = client.post("/api/auth/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

---

## 📈 Future Enhancements (Phase 2)

1. **IBM watsonx.ai Integration**
   - OCR for PDF text extraction
   - AI-powered directive extraction
   - Entity recognition
   - Confidence scoring

2. **Advanced Features**
   - Real-time notifications (WebSockets)
   - Email notifications
   - Advanced search (Elasticsearch)
   - Document versioning
   - Bulk operations

3. **Scalability**
   - Redis caching
   - Background job queue (Celery)
   - Horizontal scaling
   - CDN for static assets

---

**Document Version**: 2.0 (FastAPI Architecture)
**Last Updated**: 2026-05-02
**Status**: Ready for Review & Implementation