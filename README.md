# ⚖️ NyayaSetu AI

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4.1-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
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
- [Database Schema](#-database-schema)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**NyayaSetu AI** is an intelligent SaaS platform designed to streamline judicial governance for government departments. It leverages AI (OpenAI) and NLP to automatically analyze court order PDF documents, extract actionable directives, and manage compliance deadlines — reducing manual effort and minimizing the risk of non-compliance.

### The Problem

Government departments receive hundreds of court orders annually. Manually:
- 📄 Reading and parsing lengthy legal documents
- 🎯 Identifying specific directives and obligations
- 📅 Tracking multiple compliance deadlines
- 🏛️ Coordinating across departments

...is time-consuming, error-prone, and carries significant legal risk.

### The Solution

NyayaSetu AI automates the entire workflow:

```
📄 Upload Court Order  →  🤖 AI Analysis (OpenAI)  →  📋 Extract Directives  →  ⏰ Track Deadlines  →  ✅ Human Verification  →  📊 Governance Dashboard
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI-Powered Extraction** | Automatically extract directives, deadlines, and source references from court order PDFs using OpenAI GPT-4.1-mini with confidence scoring |
| ⏰ **Deadline Management** | Intelligent urgency detection with color-coded priority levels (Critical, High, Medium, Low) |
| 📤 **Vercel Blob Storage** | Secure PDF upload and storage via Vercel Blob with public access |
| 👥 **Role-Based Access** | Three-tier RBAC — Admin, Legal Reviewer, and Department Officer — with department-level data isolation |
| 📝 **Audit Trail** | Immutable logging of every action for governance, compliance, and transparency |
| 🔍 **Explainability** | Source references with page and paragraph numbers for full transparency on AI decisions |
| ✅ **Human Verification** | Mandatory human review workflow — approve, edit, or reject AI-extracted directives |
| 📊 **Governance Dashboard** | Real-time analytics, department risk metrics, case aging charts, and compliance reporting (approved records only) |

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW OVERVIEW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. 📤 UPLOAD        2. 🧠 EXTRACT        3. 📋 AI PROCESSING           │
│   Court Order PDF  →  Vercel Blob Store →  OpenAI GPT-4.1-mini          │
│                                                                        │
│   4. 👁️ REVIEW        5. ✅ VERIFY         6. 📊 GOVERNANCE              │
│   Human Reviewer   →  Approve/Edit/Reject →  Approved Records Dashboard │
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 APP ROUTER                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Client Components (React 19 + RSC)                    │  │
│  │  Landing • Login • Dashboard • Upload • Workspace      │  │
│  │  Verification • Governance                              │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  API Routes (Next.js Serverless)                       │  │
│  │  /api/auth • /api/upload • /api/extract                │  │
│  │  /api/review • /api/dashboard • /api/cases             │  │
│  │  /api/directives • /api/health                          │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   ┌───────────┐    ┌─────────────┐    ┌──────────────┐
   │ Neon      │    │ Vercel      │    │ OpenAI       │
   │ PostgreSQL│    │ Blob        │    │ GPT-4.1-mini │
   │ (Prisma)  │    │ (PDFs)      │    │ (Extraction) │
   └───────────┘    └─────────────┘    └──────────────┘
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | Full-stack framework (App Router, Server Actions, API Routes) |
| [React 19](https://react.dev/) | UI library |
| [TypeScript 5.7](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible component library (Radix primitives) |
| [Prisma 5](https://www.prisma.io/) | Database ORM |
| [Neon PostgreSQL](https://neon.tech/) | Serverless Postgres database |
| [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) | PDF file storage |
| [OpenAI GPT-4.1-mini](https://platform.openai.com/) | AI document extraction |
| [Zod](https://zod.dev/) | Schema validation |
| [JWT](https://jwt.io/) + [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Authentication & password hashing |
| [Recharts](https://recharts.org/) | Data visualization |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ — [Download](https://nodejs.org/)
- **npm** or **pnpm** — Package manager
- **Neon PostgreSQL** account (free tier) — [neon.tech](https://neon.tech)
- **OpenAI API** key — [platform.openai.com](https://platform.openai.com)

### Quick Start

```bash
# 1️⃣ Clone the repository
git clone https://github.com/joshuapremkumar/NyayaSetu-AI.git
cd NyayaSetu-AI

# 2️⃣ Install dependencies
npm install

# 3️⃣ Configure environment variables
cp .env.example .env
# Edit .env with your Neon DB URL, OpenAI key, etc. (see below)

# 4️⃣ Sync database schema
npx prisma db push

# 5️⃣ Seed default users
npm run db:seed

# 6️⃣ Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Environment Variables

Create a `.env` file at the project root:

```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://...pooler...?sslmode=require       # Neon pooler URL
DIRECT_URL=postgresql://...non-pooler...?sslmode=require     # Neon non-pooler URL

# Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4.1-mini

# Vercel Blob (optional for local dev, required for deployment)
BLOB_READ_WRITE_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Default Users

After seeding, log in with:

| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | `admin@courtaction.ai` | `admin123` |
| ⚖️ Legal Reviewer | `reviewer@courtaction.ai` | `reviewer123` |
| 👤 Department Officer | `officer@courtaction.ai` | `officer123` |

---

## 🔑 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login (returns JWT token)
POST   /api/auth/logout       Logout (client-side token removal)
GET    /api/auth/me           Get current user profile
```

### 📤 Upload & Extraction
```
POST   /api/upload            Upload PDF to Vercel Blob, create Case record
POST   /api/extract           Trigger AI extraction on uploaded PDF (OpenAI)
```

### ✅ Review & Verification
```
PATCH  /api/review/:id        Approve, edit, or reject a directive
```

### 📊 Dashboard & Analytics
```
GET    /api/dashboard         Get metrics + recent approved cases
```

### 📂 Cases
```
GET    /api/cases             List all cases (paginated, filtered)
GET    /api/cases/:id         Get case details with directives & deadlines
POST   /api/cases             Create new case
PATCH  /api/cases/:id         Update case status/priority
DELETE /api/cases/:id         Delete case (admin only)
```

### 📋 Directives
```
GET    /api/directives        List directives
GET    /api/directives/:id    Get directive with source references
POST   /api/directives        Create directive (admin/reviewer)
PATCH  /api/directives/:id    Update directive
```

### 🏥 Health
```
GET    /api/health            Health check
```

---

## 🔒 Security

| Layer | Measure |
|-------|---------|
| 🔐 **Authentication** | JWT tokens with 24h expiration, bcrypt password hashing (10 rounds) |
| 🛡️ **Authorization** | Role-based access control (RBAC), department-level data isolation |
| 🔏 **API Security** | Rate limiting (100 req/15min), CORS configuration, Helmet.js headers |
| ✅ **Input Validation** | Zod schema validation on all API inputs, PDF-only file filter, 50MB size limit |
| 🗄️ **Database** | SQL injection prevention via Prisma ORM, SSL-encrypted connections (Neon) |
| 📝 **Audit Trail** | Immutable logging of all actions with IP address tracking |
| 🔑 **Human-in-the-Loop** | Mandatory human verification — no AI extraction is auto-approved |

---

## 🚢 Deployment

NyayaSetu AI is built for **Vercel** as a single deployment.

### Deploy to Vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)

**Steps:**
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com) → **New Project**
3. Import your repository
4. Set environment variables:
   - `DATABASE_URL` — Neon pooler URL
   - `DIRECT_URL` — Neon non-pooler URL
   - `JWT_SECRET` — Random 32+ character string
   - `OPENAI_API_KEY` — Your OpenAI API key
   - `BLOB_READ_WRITE_TOKEN` — Vercel Blob token
5. Deploy

### Database Setup on Vercel

After deployment, run migrations:
```bash
vercel env pull .env.production  # Pull production env vars
npx prisma db push               # Push schema to production database
npm run db:seed                  # Seed default users
```

---

## 📁 Project Structure

```
NyayaSetu-AI/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 api/                      # API Routes (serverless)
│   │   ├── 📂 auth/                 # Login, Register, Me
│   │   ├── 📂 upload/               # PDF upload to Vercel Blob
│   │   ├── 📂 extract/              # OpenAI PDF extraction
│   │   ├── 📂 review/[id]/          # Directive review workflow
│   │   ├── 📂 dashboard/            # Dashboard metrics
│   │   ├── 📂 cases/                # Case CRUD
│   │   ├── 📂 directives/           # Directive CRUD
│   │   └── 📂 health/               # Health check
│   ├── 📂 dashboard/                # Protected dashboard pages
│   │   ├── 📂 workspace/[caseId]/   # AI extraction workspace
│   │   ├── 📂 verification/[caseId]/ # Human verification
│   │   ├── 📂 upload/               # File upload page
│   │   ├── 📂 governance/           # Governance dashboard
│   │   ├── layout.tsx               # Dashboard shell (sidebar)
│   │   └── page.tsx                 # Dashboard overview
│   ├── 📂 login/                    # Login page
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Tailwind 4 styles
│
├── 📂 components/                   # UI components
│   ├── 📂 ui/                       # shadcn/ui (50+ components)
│   ├── deadline-engine.tsx          # Deadline countdown widget
│   ├── directive-type.tsx           # Directive type badges
│   ├── explainability-source-box.tsx # Source citation display
│   ├── status-badges.tsx            # Status/risk/confidence badges
│   └── theme-provider.tsx           # Dark mode provider
│
├── 📂 lib/                          # Utilities
│   ├── api.ts                       # Client-side API helper
│   ├── auth.ts                      # JWT auth helpers
│   ├── extraction.ts                # OpenAI extraction logic
│   ├── prisma.ts                    # Prisma client singleton
│   └── utils.ts                     # cn() class merger
│
├── 📂 prisma/                       # Database
│   ├── schema.prisma                # Prisma schema (8 models)
│   └── seed.ts                      # Default user seeder
│
├── 📂 hooks/                        # Custom hooks
├── 📂 types/                        # TypeScript types
├── 📂 public/                       # Static assets
│
├── package.json                     # Dependencies + scripts
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
└── .env.example                     # Environment variable template
```

---

## 🗃️ Database Schema

| Model | Description |
|-------|-------------|
| `User` | Authentication — email, password hash, role, department |
| `Case` | Court case — case number, court, status, priority, file URL |
| `Directive` | AI-extracted directive — type, content, confidence, risk, review status |
| `SourceReference` | Explainability — page number, paragraph, snippet |
| `Deadline` | Compliance deadline — due date, urgency, completion status |
| `UploadedFile` | Vercel Blob record — URL, key, file metadata |
| `ReviewLog` | Audit trail for review actions — before/after JSON snapshots |
| `AuditLog` | General activity log — action, IP address, timestamp |

**Relations:** User → Cases → Directives → SourceReferences, Deadlines, ReviewLogs, AuditLogs

---

## 🛣️ Roadmap

| Priority | Feature | Status |
|----------|---------|--------|
| 🔴 | PDF viewer with text highlighting for extracted directives | 📋 Planned |
| 🔴 | Email notifications for upcoming deadlines | 📋 Planned |
| 🟠 | Multi-language support (vernacular court documents) | 📋 Planned |
| 🟠 | Integration with court case management systems | 📋 Planned |
| 🟡 | Advanced analytics dashboard with predictive risk scoring | 📋 Planned |
| 🟡 | Document version control | 📋 Planned |
| 🟢 | Background job queue for async AI processing | 📋 Planned |

---

## 🤝 Contributing

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes
# 4. Commit
git commit -m 'feat: add amazing feature'

# 5. Push and open a Pull Request
git push origin feature/amazing-feature
```

### Guidelines
- Follow the existing code style and conventions
- Write meaningful commit messages
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License**.

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
  <sub>⚖️ NyayaSetu AI — Transforming court orders into actionable intelligence</sub>
</p>
