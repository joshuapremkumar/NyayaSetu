# ⚖️ CourtAction AI

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-5.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong>🤖 AI-Powered Intelligent Court Order Management & Compliance Platform</strong>
</p>

<p align="center">
  Transform complex court orders into actionable directives. Track deadlines. Ensure compliance.
</p>

<p align="center">
  <em>Built for the IBM Hackathon Dev Day</em>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Security](#-security)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**CourtAction AI** is an intelligent SaaS platform designed to streamline judicial governance for government departments. It leverages AI and NLP to automatically analyze court order documents, extract actionable directives, and manage compliance deadlines — reducing manual effort and minimizing the risk of non-compliance.

### The Problem

Government departments receive hundreds of court orders annually. Manually:
- 📄 Reading and parsing lengthy legal documents
- 🎯 Identifying specific directives and obligations
- 📅 Tracking multiple compliance deadlines
- 🏛️ Coordinating across departments

...is time-consuming, error-prone, and carries significant legal risk.

### The Solution

CourtAction AI automates the entire workflow:

```
📄 Upload Court Order  →  🤖 AI Analysis  →  📋 Extract Directives  →  ⏰ Track Deadlines  →  ✅ Ensure Compliance
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI-Powered Analysis** | Automatically extract directives from court orders using advanced NLP with confidence scoring |
| ⏰ **Deadline Management** | Intelligent urgency detection with color-coded priority levels (Critical 🔴, High 🟠, Medium 🟡, Low 🟢) |
| 🏛️ **Multi-Department Support** | Manage cases across different government departments with department-level data isolation |
| 👥 **Role-Based Access** | Three-tier RBAC — Admin, Legal Reviewer, and Department Officer — with granular permissions |
| 📝 **Audit Trail** | Immutable audit logging of every action for governance, compliance, and transparency |
| 📤 **Document Upload** | Upload PDF and DOCX court order documents (up to 50MB) |
| 🔍 **Explainability** | Source references with page and paragraph numbers for full transparency on AI decisions |
| 📊 **Governance Dashboard** | Real-time analytics, department risk metrics, and compliance reporting |

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW OVERVIEW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│   │  1. 📤   │    │  2. 🧠   │    │  3. 📋   │    │  4. 👁️   │          │
│   │  UPLOAD  │───>│  ANALYZE │───>│ EXTRACT  │───>│  REVIEW  │          │
│   │          │    │          │    │          │    │          │          │
│   │ Court    │    │ AI/NLP   │    │ Direct.  │    │ Legal    │          │
│   │ Order    │    │ Process  │    │ & Dates  │    │ Team     │          │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘          │
│                                                    │                      │
│                                                    ▼                      │
│                    ┌──────────┐    ┌──────────┐                           │
│                    │  6. 📊   │    │  5. ⏰   │                           │
│                    │  REPORT  │<───│  TRACK   │                           │
│                    │          │    │          │                           │
│                    │ Analytics│    │ Deadline │                           │
│                    │ & Export │    │ Monitor  │                           │
│                    └──────────┘    └──────────┘                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  React 18 + Vite + TypeScript + Radix UI + Tailwind    │  │
│  │                                                        │  │
│  │  Pages: Landing • Login • Dashboard • Upload           │  │
│  │         Workspace • Verification • Governance          │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼──────────────────────────────────┐
│                   APPLICATION LAYER                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Express.js API Server (Node.js 20 + TypeScript)       │  │
│  │                                                        │  │
│  │  🔐 Auth Middleware (JWT)  •  🛡️ RBAC Middleware       │  │
│  │                                                        │  │
│  │  Routes: /api/auth • /api/cases • /api/directives      │  │
│  │          /api/deadlines • /api/governance • /api/upload│  │
│  │                                                        │  │
│  │  Services: Case • Directive • Deadline • AI • Audit    │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │ Prisma ORM
┌───────────────────────────▼──────────────────────────────────┐
│                      DATA LAYER                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 15                                          │  │
│  │                                                        │  │
│  │  Tables: users • cases • directives                    │  │
│  │          source_references • deadlines • audit_logs    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            │ Future Integration
┌───────────────────────────▼──────────────────────────────────┐
│                  EXTERNAL SERVICES                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  IBM watsonx.ai (AI Extraction) • CCMS Integration     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev/) | 18 | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.7 | Type Safety |
| [Vite](https://vite.dev/) | 5 | Build Tool |
| [React Router](https://reactrouter.com/) | 6 | Routing |
| [Radix UI](https://www.radix-ui.com/) | - | Accessible Components |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Styling |
| [React Hook Form](https://react-hook-form.com/) | - | Form Management |
| [Zod](https://zod.dev/) | - | Schema Validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org/) | 20 | Runtime |
| [Express](https://expressjs.com/) | 4 | API Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.7 | Type Safety |
| [Prisma](https://www.prisma.io/) | 5 | ORM |
| [PostgreSQL](https://www.postgresql.org/) | 15 | Database |
| [JWT](https://jwt.io/) | - | Authentication |
| [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) | - | Password Hashing |
| [Multer](https://github.com/expressjs/multer) | - | File Upload |
| [Helmet](https://helmetjs.github.io/) | - | Security Headers |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ — [Download](https://nodejs.org/)
- **PostgreSQL** 15+ — [Download](https://www.postgresql.org/download/)
- **npm** or **pnpm** — Package manager

### Quick Start

```bash
# 1️⃣ Clone the repository
git clone https://github.com/your-username/court-action-ai.git
cd court-action-ai

# 2️⃣ Install dependencies
pnpm install                     # Frontend
cd backend && pnpm install       # Backend

# 3️⃣ Setup database
createdb courtaction_ai

# 4️⃣ Configure backend environment
# Create backend/.env (see below)

# 5️⃣ Run migrations & seed database
cd backend
npx prisma migrate dev
npx prisma db seed

# 6️⃣ Start development servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Environment Variables

Create `backend/.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:password@localhost:5432/courtaction_ai
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

### Default Users

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | `admin@courtaction.ai` | `admin123` |
| ⚖️ Legal Reviewer | `reviewer@courtaction.ai` | `reviewer123` |
| 👤 Department Officer | `officer@courtaction.ai` | `officer123` |

### Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

---

## 🔑 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login user
POST   /api/auth/logout       Logout user
GET    /api/auth/me           Get current user
```

### 📂 Cases
```
GET    /api/cases             List all cases
GET    /api/cases/:id         Get case details
POST   /api/cases             Create new case
PUT    /api/cases/:id         Update case
DELETE /api/cases/:id         Delete case
```

### 📋 Directives
```
GET    /api/directives                    List directives
GET    /api/directives/:id                Get directive details
PUT    /api/directives/:id/verify         Verify directive
```

### ⏰ Deadlines
```
GET    /api/deadlines                     List deadlines
PUT    /api/deadlines/:id/complete        Mark deadline complete
```

### 📤 Upload
```
POST   /api/upload                        Upload court order document
```

### 📊 Governance
```
GET    /api/governance/stats              Get governance statistics
```

---

## 🔒 Security

CourtAction AI implements enterprise-grade security:

| Layer | Measure |
|-------|---------|
| 🔐 **Authentication** | JWT tokens with 24h expiration, bcrypt password hashing |
| 🛡️ **Authorization** | Role-based access control (RBAC), department-level data isolation |
| 🔏 **API Security** | Rate limiting (100 req/min), CORS whitelist, Helmet.js headers |
| ✅ **Input Validation** | Zod schema validation, file type/size restrictions |
| 🗄️ **Database** | SQL injection prevention via Prisma ORM, encrypted connections |
| 📝 **Audit Trail** | Immutable logging of all actions with IP tracking |

---

## 🚢 Deployment

This project is configured for one-click deployment to **Render** with a `render.yaml` blueprint.

### Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Steps:**
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your repository
5. Render auto-detects `render.yaml` and deploys:
   - PostgreSQL database
   - Backend API service
   - Frontend static site

> 📖 See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📁 Project Structure

```
court-action-ai/
│
├── 📂 backend/                     # Backend API
│   ├── 📂 prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── seed.ts                 # Database seeding script
│   ├── 📂 src/
│   │   ├── 📂 lib/                 # Utilities (Prisma client)
│   │   ├── 📂 middleware/          # Auth & upload middleware
│   │   ├── 📂 routes/              # API route handlers
│   │   └── server.ts               # Express server entry
│   ├── 📂 uploads/                 # Uploaded document storage
│   └── package.json
│
├── 📂 src/                         # Frontend source
│   ├── 📂 components/              # Reusable React components
│   ├── 📂 pages/                   # Page components
│   ├── 📂 layouts/                 # Layout components
│   ├── 📂 data/                    # Mock data (for dev)
│   ├── 📂 domain/                  # Domain models
│   └── 📂 types/                   # TypeScript type definitions
│
├── 📂 public/                      # Static assets
├── 📂 hooks/                       # Custom React hooks
├── 📂 lib/                         # Frontend utilities
├── 📂 styles/                      # Global styles
│
├── render.yaml                     # Render deployment blueprint
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Frontend dependencies
```

---

## 🗃️ Database Schema

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ email       │
│ name        │
│ passwordHash│
│ role        │
│ department  │
│ createdAt   │
│ updatedAt   │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌──────────────┐         ┌──────────────┐
│    Case      │────────>│   AuditLog   │
│──────────────│         │──────────────│
│ id (PK)      │         │ id (PK)      │
│ caseNumber   │         │ caseId (FK)  │
│ court        │         │ userId (FK)  │
│ department   │         │ action       │
│ filingDate   │         │ notes        │
│ status       │         │ ipAddress    │
│ priority     │         │ timestamp    │
│ fileName     │         └──────────────┘
│ fileUrl      │
│ uploadedBy   │
│ createdAt    │
│ updatedAt    │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│  Directive   │
│──────────────│
│ id (PK)      │
│ caseId (FK)  │
│ type         │
│ content      │
│ confidence   │
│ riskLevel    │
│ department   │
│ verified     │
│ notes        │
│ verifiedAt   │
│ verifiedBy   │
│ createdAt    │
│ updatedAt    │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌───────────────────────┐
│  SourceReference      │
│───────────────────────│
│ id (PK)               │
│ directiveId (FK)      │
│ pageNumber            │
│ paragraphNumber       │
│ snippet               │
│ highlightStart        │
│ highlightEnd          │
│ createdAt             │
└───────────────────────┘

┌──────────────┐
│   Deadline   │
│──────────────│
│ id (PK)      │
│ caseId (FK)  │
│ type         │
│ dueDate      │
│ daysRemaining│
│ urgency      │
│ completed    │
│ completedAt  │
│ createdAt    │
│ updatedAt    │
└──────────────┘
```

---

## 🛣️ Roadmap

| Priority | Feature | Status |
|----------|---------|--------|
| 🔴 | Advanced AI models for directive extraction (IBM watsonx.ai) | 📋 Planned |
| 🔴 | Email notifications for upcoming deadlines | 📋 Planned |
| 🟠 | Mobile application | 📋 Planned |
| 🟠 | Integration with court case management systems | 📋 Planned |
| 🟡 | Advanced analytics dashboard with visualizations | 📋 Planned |
| 🟡 | Multi-language support | 📋 Planned |
| 🟢 | Document version control | 📋 Planned |
| 🟢 | Redis caching layer | 📋 Planned |
| 🟢 | Background job queue for async AI processing | 📋 Planned |

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes
# 4. Run tests
npm test                    # Frontend
cd backend && npm test      # Backend

# 5. Commit your changes
git commit -m 'feat: add amazing feature'

# 6. Push and open a Pull Request
git push origin feature/amazing-feature
```

### Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture & technical design |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Step-by-step implementation guide |
| [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) | Deployment to Render |
| [INTEGRATION_ARCHITECTURE.md](./INTEGRATION_ARCHITECTURE.md) | Frontend-backend integration |
| [TRANSFORMATION_PLAN.md](./TRANSFORMATION_PLAN.md) | Complete transformation roadmap |

---

## 👥 Team

<p align="center">
  <strong>Built with ❤️ at the IBM Hackathon Dev Day</strong>
</p>

<p align="center">
  <strong>For better governance and judicial compliance</strong>
</p>

---

<p align="center">
  <sub>⚖️ CourtAction AI — Transforming court orders into actionable intelligence</sub>
</p>
