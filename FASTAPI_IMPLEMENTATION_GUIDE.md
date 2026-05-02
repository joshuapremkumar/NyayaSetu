# CourtAction AI - FastAPI Implementation Guide

## 🎯 Quick Start

This guide provides step-by-step instructions for implementing the FastAPI backend for CourtAction AI.

---

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL 15+ (or Render PostgreSQL)
- Git
- Code editor (VS Code recommended)

---

## 🚀 Phase 1: Project Setup

### Step 1: Remove Existing Express Backend

```bash
# Backup if needed
mv backend backend_express_backup

# Or delete
rm -rf backend
```

### Step 2: Create FastAPI Project Structure

```bash
# Create backend directory
mkdir -p backend/app/{api/v1,core,models,schemas,services,utils}
mkdir -p backend/alembic/versions
mkdir -p backend/tests
mkdir -p backend/uploads

# Create __init__.py files
touch backend/app/__init__.py
touch backend/app/api/__init__.py
touch backend/app/api/v1/__init__.py
touch backend/app/core/__init__.py
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py
touch backend/app/services/__init__.py
touch backend/app/utils/__init__.py
touch backend/tests/__init__.py
```

### Step 3: Create requirements.txt

```bash
cd backend
cat > requirements.txt << 'EOF'
# FastAPI
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.25
alembic==1.13.1
psycopg2-binary==2.9.9

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# Validation
pydantic==2.5.3
pydantic-settings==2.1.0
email-validator==2.1.0

# Utilities
python-dotenv==1.0.0
aiofiles==23.2.1

# Security
slowapi==0.1.9

# Testing
pytest==7.4.4
pytest-asyncio==0.23.3
httpx==0.26.0
EOF
```

### Step 4: Create .env.example

```bash
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/courtaction

# JWT Configuration
SECRET_KEY=your-secret-key-change-in-production-use-openssl-rand-hex-32
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
MAX_FILE_SIZE=52428800
ALLOWED_EXTENSIONS=.pdf

# OCR Service (Future)
OCR_ENABLED=false
WATSONX_API_KEY=
WATSONX_URL=
EOF
```

### Step 5: Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 🗄️ Phase 2: Database Setup

### Step 1: Create config.py

```python
# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 52428800  # 50MB
    ALLOWED_EXTENSIONS: str = ".pdf"
    
    # OCR
    OCR_ENABLED: bool = False
    WATSONX_API_KEY: Optional[str] = None
    WATSONX_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### Step 2: Create database.py

```python
# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 3: Create Enums

```python
# backend/app/models/__init__.py
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    LEGAL_REVIEWER = "LEGAL_REVIEWER"
    DEPARTMENT_OFFICER = "DEPARTMENT_OFFICER"

class CaseStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    VERIFIED = "verified"
    REJECTED = "rejected"

class CasePriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class DirectiveType(str, Enum):
    COMPLIANCE = "compliance"
    APPEAL = "appeal"
    REVIEW = "review"
    REINSTATEMENT = "reinstatement"
    COMPENSATION = "compensation"
    POLICY_AMENDMENT = "policy_amendment"
    ADMINISTRATIVE_ACTION = "administrative_action"
    ESCALATION = "escalation"
    STAY_ORDER = "stay_order"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class DeadlineType(str, Enum):
    COMPLIANCE = "compliance"
    APPEAL = "appeal"
    ESCALATION = "escalation"

class DeadlineUrgency(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    NORMAL = "normal"

class AuditAction(str, Enum):
    UPLOADED = "uploaded"
    PROCESSED = "processed"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    REJECTED = "rejected"
    EDITED = "edited"
```

### Step 4: Create User Model

```python
# backend/app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base
from app.models import UserRole

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.DEPARTMENT_OFFICER, nullable=False)
    department = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cases = relationship("Case", back_populates="uploaded_by")
    audit_logs = relationship("AuditLog", back_populates="user")
```

### Step 5: Create Case Model

```python
# backend/app/models/case.py
from sqlalchemy import Column, String, Integer, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base
from app.models import CaseStatus, CasePriority

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_number = Column(String, unique=True, nullable=False, index=True)
    court = Column(String, nullable=False)
    department = Column(String, nullable=False, index=True)
    filing_date = Column(Date, nullable=False)
    status = Column(Enum(CaseStatus), default=CaseStatus.PENDING, nullable=False, index=True)
    priority = Column(Enum(CasePriority), default=CasePriority.MEDIUM, nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    uploaded_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    uploaded_by = relationship("User", back_populates="cases")
    directives = relationship("Directive", back_populates="case", cascade="all, delete-orphan")
    deadlines = relationship("Deadline", back_populates="case", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="case", cascade="all, delete-orphan")
```

### Step 6: Create Directive Model

```python
# backend/app/models/directive.py
from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base
from app.models import DirectiveType, RiskLevel

class Directive(Base):
    __tablename__ = "directives"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    type = Column(Enum(DirectiveType), nullable=False, index=True)
    content = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.0)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.MEDIUM, nullable=False)
    responsible_department = Column(String, nullable=False, index=True)
    verified = Column(Boolean, default=False, index=True)
    verification_notes = Column(Text, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verified_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    case = relationship("Case", back_populates="directives")
    source_references = relationship("SourceReference", back_populates="directive", cascade="all, delete-orphan")
    verified_by = relationship("User", foreign_keys=[verified_by_id])
```

### Step 7: Create Remaining Models

```python
# backend/app/models/source_reference.py
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

class SourceReference(Base):
    __tablename__ = "source_references"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    directive_id = Column(UUID(as_uuid=True), ForeignKey("directives.id"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    paragraph_number = Column(Integer, nullable=False)
    snippet = Column(Text, nullable=False)
    highlight_start = Column(Integer, nullable=True)
    highlight_end = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    directive = relationship("Directive", back_populates="source_references")
```

```python
# backend/app/models/deadline.py
from sqlalchemy import Column, Integer, Date, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base
from app.models import DeadlineType, DeadlineUrgency

class Deadline(Base):
    __tablename__ = "deadlines"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
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

```python
# backend/app/models/audit_log.py
from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base
from app.models import AuditAction

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

### Step 8: Initialize Alembic

```bash
# Initialize Alembic
alembic init alembic

# Update alembic.ini
# Change: sqlalchemy.url = driver://user:pass@localhost/dbname
# To: sqlalchemy.url = 
```

Update `alembic/env.py`:
```python
from app.database import Base
from app.models.user import User
from app.models.case import Case
from app.models.directive import Directive
from app.models.source_reference import SourceReference
from app.models.deadline import Deadline
from app.models.audit_log import AuditLog
from app.config import settings

# Set target metadata
target_metadata = Base.metadata

# Set database URL
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
```

### Step 9: Create Initial Migration

```bash
# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

---

## 🔐 Phase 3: Authentication Implementation

### Step 1: Create Security Utilities

```python
# backend/app/core/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
```

### Step 2: Create Permission Decorators

```python
# backend/app/core/permissions.py
from functools import wraps
from fastapi import HTTPException, status
from app.models import UserRole

def require_role(*allowed_roles: UserRole):
    """Decorator to check if user has required role"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user=None, **kwargs):
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated"
                )
            
            if current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

def check_department_access(user, resource_department: str) -> bool:
    """Check if user has access to resource based on department"""
    if user.role == UserRole.ADMIN or user.role == UserRole.LEGAL_REVIEWER:
        return True
    return user.department == resource_department
```

### Step 3: Create API Dependencies

```python
# backend/app/api/deps.py
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import decode_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user

async def get_current_active_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user if they are an admin"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user
```

---

## 📝 Phase 4: Pydantic Schemas

### Step 1: Create Auth Schemas

```python
# backend/app/schemas/auth.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models import UserRole

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[UserRole] = UserRole.DEPARTMENT_OFFICER
    department: Optional[str] = None

class RefreshToken(BaseModel):
    refresh_token: str
```

### Step 2: Create User Schemas

```python
# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID
from app.models import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

### Step 3: Create Case Schemas

```python
# backend/app/schemas/case.py
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List
from uuid import UUID
from app.models import CaseStatus, CasePriority

class CaseBase(BaseModel):
    case_number: str
    court: str
    department: str
    filing_date: date
    priority: CasePriority = CasePriority.MEDIUM

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    court: Optional[str] = None
    department: Optional[str] = None
    filing_date: Optional[date] = None
    status: Optional[CaseStatus] = None
    priority: Optional[CasePriority] = None

class CaseResponse(CaseBase):
    id: UUID
    status: CaseStatus
    file_name: str
    file_path: Optional[str]
    file_size: Optional[int]
    uploaded_by_id: UUID
    uploaded_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CaseListResponse(BaseModel):
    cases: List[CaseResponse]
    total: int
    page: int
    page_size: int
```

---

## 🛣️ Phase 5: API Routes

### Step 1: Create Auth Routes

```python
# backend/app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import Token, UserRegister, RefreshToken
from app.schemas.user import UserResponse
from app.models.user import User
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role,
        department=user_data.department
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login and get JWT tokens"""
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: RefreshToken, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    payload = decode_token(token_data.refresh_token)
    
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user"
        )
    
    # Create new tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout (client should remove tokens)"""
    return {"message": "Successfully logged out"}
```

### Step 2: Create Main Application

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.api.v1 import auth

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="CourtAction AI API",
    description="Judicial Governance Platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# Health check
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "CourtAction AI API",
        "docs": "/api/docs"
    }
```

---

## 🚀 Phase 6: Running & Testing

### Step 1: Create .env File

```bash
cp .env.example .env
# Edit .env with your actual values
```

### Step 2: Run Database Migrations

```bash
alembic upgrade head
```

### Step 3: Start Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Test API

Visit: http://localhost:8000/api/docs

Test endpoints:
1. POST /api/auth/register - Create a user
2. POST /api/auth/login - Login and get tokens
3. GET /api/auth/me - Get current user (with Bearer token)

---

## 📦 Next Steps

1. ✅ Complete remaining API routes (cases, directives, etc.)
2. ✅ Implement file upload service
3. ✅ Add comprehensive error handling
4. ✅ Write unit tests
5. ✅ Create render.yaml for deployment
6. ✅ Deploy to Render

---

**Document Version**: 1.0
**Last Updated**: 2026-05-02
**Status**: Implementation Ready