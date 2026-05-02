# Integration Architecture
## Court Action AI - System Design & Data Flow

---

## 🏛️ System Architecture

```mermaid
graph TB
    subgraph Client["Client Browser"]
        UI[React UI Components]
        Router[React Router]
        AuthCtx[Auth Context]
        Services[Service Layer]
    end
    
    subgraph Frontend["Frontend Layer (Vite + React)"]
        Pages[Page Components]
        API[API Client - Axios]
        State[Local State Management]
    end
    
    subgraph Backend["Backend Layer (Node.js + Express)"]
        Routes[API Routes]
        Middleware[Auth Middleware]
        Controllers[Route Handlers]
        Validation[Zod Validation]
    end
    
    subgraph Data["Data Layer"]
        Prisma[Prisma ORM]
        DB[(PostgreSQL Database)]
        Files[File Storage]
    end
    
    subgraph External["External Services"]
        Supabase[Supabase Auth]
        Render[Render Hosting]
    end
    
    UI --> Router
    Router --> Pages
    Pages --> AuthCtx
    Pages --> Services
    Services --> API
    API --> Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Validation
    Controllers --> Prisma
    Controllers --> Supabase
    Prisma --> DB
    Controllers --> Files
    
    style Client fill:#e3f2fd
    style Frontend fill:#f3e5f5
    style Backend fill:#fff3e0
    style Data fill:#e8f5e9
    style External fill:#fce4ec
```

---

## 🔄 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant AuthContext
    participant APIClient
    participant Backend
    participant Supabase
    participant Database
    
    User->>LoginPage: Enter credentials
    LoginPage->>AuthContext: login(email, password)
    AuthContext->>APIClient: POST /auth/login
    APIClient->>Backend: Request with credentials
    Backend->>Supabase: Verify credentials
    Supabase-->>Backend: Auth token
    Backend->>Database: Fetch user data
    Database-->>Backend: User profile
    Backend-->>APIClient: {token, user}
    APIClient-->>AuthContext: Store token & user
    AuthContext->>LoginPage: Success
    LoginPage->>User: Redirect to Dashboard
    
    Note over APIClient,Backend: All subsequent requests include token in Authorization header
```

---

## 📊 Data Flow - Case Upload

```mermaid
sequenceDiagram
    participant User
    participant UploadPage
    participant UploadService
    participant Backend
    participant Multer
    participant Prisma
    participant Database
    participant FileSystem
    
    User->>UploadPage: Select PDF file
    User->>UploadPage: Fill metadata form
    UploadPage->>UploadService: uploadFile(file, metadata)
    UploadService->>Backend: POST /upload (multipart/form-data)
    Backend->>Multer: Process file upload
    Multer->>FileSystem: Save file
    FileSystem-->>Multer: File path
    Backend->>Prisma: Create case record
    Prisma->>Database: INSERT INTO cases
    Database-->>Prisma: Case ID
    Prisma-->>Backend: Case object
    Backend-->>UploadService: {caseId, fileUrl}
    UploadService-->>UploadPage: Success
    UploadPage->>User: Show success message
    UploadPage->>UploadPage: Refresh case list
```

---

## 🔍 Data Flow - AI Workspace

```mermaid
sequenceDiagram
    participant User
    participant WorkspacePage
    participant Services
    participant Backend
    participant Database
    
    User->>WorkspacePage: Navigate to /workspace/:caseId
    WorkspacePage->>Services: Load case data
    
    par Parallel API Calls
        Services->>Backend: GET /cases/:id
        Backend->>Database: SELECT case
        Database-->>Backend: Case data
        Backend-->>Services: Case object
    and
        Services->>Backend: GET /directives?caseId=:id
        Backend->>Database: SELECT directives
        Database-->>Backend: Directives array
        Backend-->>Services: Directives
    and
        Services->>Backend: GET /deadlines?caseId=:id
        Backend->>Database: SELECT deadlines
        Database-->>Backend: Deadlines array
        Backend-->>Services: Deadlines
    end
    
    Services-->>WorkspacePage: All data loaded
    WorkspacePage->>User: Display case workspace
```

---

## ✅ Data Flow - Verification

```mermaid
sequenceDiagram
    participant Reviewer
    participant VerificationPage
    participant DirectiveService
    participant Backend
    participant Database
    participant AuditLog
    
    Reviewer->>VerificationPage: Review directive
    Reviewer->>VerificationPage: Click "Verify"
    VerificationPage->>DirectiveService: verify(directiveId, notes)
    DirectiveService->>Backend: POST /directives/:id/verify
    Backend->>Database: UPDATE directive SET verified=true
    Database-->>Backend: Updated directive
    Backend->>AuditLog: Log verification action
    AuditLog->>Database: INSERT INTO audit_logs
    Backend-->>DirectiveService: Success
    DirectiveService-->>VerificationPage: Updated directive
    VerificationPage->>Reviewer: Show success message
    VerificationPage->>VerificationPage: Refresh audit trail
```

---

## 📈 Data Flow - Governance Dashboard

```mermaid
sequenceDiagram
    participant Admin
    participant GovernancePage
    participant GovernanceService
    participant Backend
    participant Database
    
    Admin->>GovernancePage: Navigate to /governance
    GovernancePage->>GovernanceService: Load analytics
    
    par Parallel Analytics Queries
        GovernanceService->>Backend: GET /governance/metrics
        Backend->>Database: Complex aggregation query
        Database-->>Backend: Metrics data
        Backend-->>GovernanceService: GovernanceMetrics
    and
        GovernanceService->>Backend: GET /governance/departments
        Backend->>Database: Department risk analysis
        Database-->>Backend: Department data
        Backend-->>GovernanceService: Department[]
    and
        GovernanceService->>Backend: GET /governance/directive-distribution
        Backend->>Database: Directive type counts
        Database-->>Backend: Distribution data
        Backend-->>GovernanceService: Chart data
    and
        GovernanceService->>Backend: GET /governance/case-aging
        Backend->>Database: Case age buckets
        Database-->>Backend: Aging data
        Backend-->>GovernanceService: Aging chart data
    end
    
    GovernanceService-->>GovernancePage: All analytics loaded
    GovernancePage->>Admin: Display charts & metrics
```

---

## 🗄️ Database Schema Overview

```mermaid
erDiagram
    User ||--o{ Case : uploads
    User ||--o{ AuditLog : creates
    Case ||--o{ Directive : contains
    Case ||--o{ Deadline : has
    Case ||--o{ AuditLog : tracks
    Directive ||--o{ SourceReference : references
    
    User {
        uuid id PK
        string email UK
        string passwordHash
        string name
        enum role
        string department
        datetime createdAt
        datetime updatedAt
    }
    
    Case {
        uuid id PK
        string caseNumber UK
        string court
        string department
        datetime filingDate
        enum status
        enum priority
        string fileName
        string fileUrl
        uuid uploadedById FK
        datetime uploadedAt
        datetime updatedAt
    }
    
    Directive {
        uuid id PK
        uuid caseId FK
        enum type
        string content
        float confidenceScore
        enum riskLevel
        string responsibleDepartment
        boolean verified
        string verificationNotes
        datetime verifiedAt
        uuid verifiedById
        datetime createdAt
        datetime updatedAt
    }
    
    Deadline {
        uuid id PK
        uuid caseId FK
        enum type
        datetime dueDate
        int daysRemaining
        enum urgency
        boolean completed
        datetime completedAt
        datetime createdAt
        datetime updatedAt
    }
    
    SourceReference {
        uuid id PK
        uuid directiveId FK
        int pageNumber
        int paragraphNumber
        string snippet
        int highlightStart
        int highlightEnd
        datetime createdAt
    }
    
    AuditLog {
        uuid id PK
        uuid caseId FK
        uuid userId FK
        enum action
        string notes
        string ipAddress
        datetime timestamp
    }
```

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph Request["Incoming Request"]
        Client[Client Request]
        Token[JWT Token]
    end
    
    subgraph Security["Security Layers"]
        RateLimit[Rate Limiter]
        CORS[CORS Policy]
        Helmet[Helmet Security]
        Auth[Auth Middleware]
        RBAC[Role Check]
    end
    
    subgraph Validation["Data Validation"]
        Zod[Zod Schema]
        Sanitize[Input Sanitization]
    end
    
    subgraph Processing["Request Processing"]
        Handler[Route Handler]
        Business[Business Logic]
    end
    
    Client --> RateLimit
    Token --> RateLimit
    RateLimit --> CORS
    CORS --> Helmet
    Helmet --> Auth
    Auth --> RBAC
    RBAC --> Zod
    Zod --> Sanitize
    Sanitize --> Handler
    Handler --> Business
    
    style Request fill:#ffebee
    style Security fill:#e8f5e9
    style Validation fill:#fff3e0
    style Processing fill:#e3f2fd
```

---

## 🚀 Deployment Architecture (Render)

```mermaid
graph TB
    subgraph GitHub["GitHub Repository"]
        Code[Source Code]
        Config[render.yaml]
    end
    
    subgraph Render["Render Platform"]
        Blueprint[Blueprint Service]
        
        subgraph Frontend["Frontend Service"]
            FrontBuild[Build Process]
            FrontStatic[Static Files]
            FrontCDN[CDN Distribution]
        end
        
        subgraph Backend["Backend Service"]
            BackBuild[Build Process]
            BackNode[Node.js Server]
            BackHealth[Health Check]
        end
        
        subgraph Database["Database Service"]
            PostgreSQL[(PostgreSQL)]
            Backups[Automated Backups]
        end
    end
    
    subgraph External["External Services"]
        Supabase[Supabase Auth]
        Storage[File Storage]
    end
    
    Code --> Blueprint
    Config --> Blueprint
    Blueprint --> FrontBuild
    Blueprint --> BackBuild
    Blueprint --> PostgreSQL
    
    FrontBuild --> FrontStatic
    FrontStatic --> FrontCDN
    
    BackBuild --> BackNode
    BackNode --> BackHealth
    BackNode --> PostgreSQL
    BackNode --> Supabase
    BackNode --> Storage
    
    PostgreSQL --> Backups
    
    style GitHub fill:#f3e5f5
    style Render fill:#e3f2fd
    style External fill:#fff3e0
```

---

## 📱 Component Hierarchy

```mermaid
graph TB
    App[App Root]
    App --> Theme[ThemeProvider]
    Theme --> Auth[AuthProvider]
    Auth --> Router[RouterProvider]
    
    Router --> Landing[LandingPage]
    Router --> Login[LoginPage]
    Router --> Protected[ProtectedRoute]
    
    Protected --> Layout[DashboardLayout]
    
    Layout --> Dashboard[DashboardPage]
    Layout --> Upload[UploadPage]
    Layout --> Workspace[WorkspacePage]
    Layout --> Verification[VerificationPage]
    Layout --> Governance[GovernancePage]
    
    Dashboard --> DashCards[Metric Cards]
    Dashboard --> DashTable[Cases Table]
    Dashboard --> DashDeadlines[Deadlines List]
    
    Upload --> UploadZone[Upload Zone]
    Upload --> FileList[File List]
    Upload --> Filters[Filter Controls]
    
    Workspace --> PDFViewer[PDF Viewer]
    Workspace --> ExtractPanel[Extraction Panel]
    Workspace --> DeadlineEngine[Deadline Engine]
    
    Verification --> CaseSummary[Case Summary]
    Verification --> DirectiveReview[Directive Review]
    Verification --> AuditTrail[Audit Trail]
    
    Governance --> Metrics[KPI Metrics]
    Governance --> Charts[Analytics Charts]
    Governance --> DeptRisk[Department Risk]
    
    style App fill:#e3f2fd
    style Protected fill:#fff3e0
    style Layout fill:#f3e5f5
```

---

## 🔄 State Management Flow

```mermaid
graph LR
    subgraph Global["Global State"]
        AuthState[Auth State]
        ThemeState[Theme State]
    end
    
    subgraph Page["Page State"]
        LocalState[Local State]
        Loading[Loading States]
        Errors[Error States]
    end
    
    subgraph API["API Layer"]
        Services[Service Functions]
        Cache[Response Cache]
    end
    
    subgraph Backend["Backend"]
        Database[(Database)]
    end
    
    AuthState --> LocalState
    ThemeState --> LocalState
    LocalState --> Services
    Services --> Cache
    Cache --> Database
    Database --> Cache
    Cache --> Services
    Services --> Loading
    Services --> Errors
    Services --> LocalState
    
    style Global fill:#e8f5e9
    style Page fill:#e3f2fd
    style API fill:#fff3e0
    style Backend fill:#f3e5f5
```

---

## 📦 Build & Deployment Pipeline

```mermaid
graph LR
    subgraph Development["Development"]
        Code[Write Code]
        Test[Local Testing]
        Commit[Git Commit]
    end
    
    subgraph CI["Continuous Integration"]
        Push[Git Push]
        Trigger[Render Webhook]
        Build[Build Process]
    end
    
    subgraph Backend["Backend Build"]
        BInstall[npm install]
        BPrisma[Prisma Generate]
        BCompile[TypeScript Compile]
        BDist[dist/ Output]
    end
    
    subgraph Frontend["Frontend Build"]
        FInstall[npm install]
        FCompile[Vite Build]
        FDist[dist/ Output]
    end
    
    subgraph Deploy["Deployment"]
        BDeploy[Backend Deploy]
        FDeploy[Frontend Deploy]
        DBMigrate[DB Migration]
        Health[Health Check]
    end
    
    Code --> Test
    Test --> Commit
    Commit --> Push
    Push --> Trigger
    Trigger --> Build
    
    Build --> BInstall
    Build --> FInstall
    
    BInstall --> BPrisma
    BPrisma --> BCompile
    BCompile --> BDist
    BDist --> BDeploy
    
    FInstall --> FCompile
    FCompile --> FDist
    FDist --> FDeploy
    
    BDeploy --> DBMigrate
    FDeploy --> Health
    DBMigrate --> Health
    
    style Development fill:#e3f2fd
    style CI fill:#f3e5f5
    style Backend fill:#fff3e0
    style Frontend fill:#e8f5e9
    style Deploy fill:#fce4ec
```

---

## 🎯 API Endpoint Map

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Case Management Endpoints
- `GET /api/cases` - List all cases (paginated)
- `GET /api/cases/:id` - Get case by ID
- `POST /api/cases` - Create new case
- `PATCH /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Directive Endpoints
- `GET /api/directives` - List directives (filter by caseId)
- `POST /api/directives` - Create directive
- `PATCH /api/directives/:id` - Update directive
- `POST /api/directives/:id/verify` - Verify directive

### Deadline Endpoints
- `GET /api/deadlines` - List deadlines (filter by caseId)
- `POST /api/deadlines` - Create deadline
- `PATCH /api/deadlines/:id` - Update deadline

### Upload Endpoint
- `POST /api/upload` - Upload PDF file

### Governance Endpoints
- `GET /api/governance/metrics` - Dashboard KPIs
- `GET /api/governance/departments` - Department risk data
- `GET /api/governance/directive-distribution` - Directive type distribution
- `GET /api/governance/case-aging` - Case aging analysis

### Audit Log Endpoints
- `GET /api/audit-logs` - List all audit logs
- `GET /api/audit-logs/case/:caseId` - Get logs for specific case

---

## 🔧 Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**: Radix UI + Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

### DevOps
- **Hosting**: Render
- **Database**: Render PostgreSQL
- **Version Control**: Git + GitHub
- **CI/CD**: Render Auto-Deploy

---

This architecture document provides a comprehensive visual overview of the entire system. Use it alongside the implementation plan for a complete understanding of the integration strategy.