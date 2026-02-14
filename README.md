# 🚀 InterviewIQ — AI-Powered Coding Interview Simulator

<div align="center">

**Master your coding interviews with an AI-powered practice platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

</div>

---

## ✨ Features

- 🧠 **AI-Powered Code Evaluation** — GPT-4 reviews your code like a FAANG interviewer
- 💻 **Monaco Code Editor** — Professional editor with syntax highlighting and multi-language support
- 🎯 **Real-time Code Execution** — Docker-sandboxed execution with timeout and memory limits
- 💬 **Live AI Interview Mode** — WebSocket-based conversational AI interviewer
- 📊 **Performance Analytics** — Track progress, identify weak areas, maintain streaks
- 🎨 **Premium UI** — Glassmorphism, smooth animations, dark theme, responsive design
- 🔐 **JWT Authentication** — Secure login/register with role-based access control

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Monaco Editor, Zustand |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, Socket.io |
| **Database** | PostgreSQL, Redis |
| **AI** | OpenAI GPT-4, Structured JSON outputs, Prompt templates |
| **DevOps** | Docker Compose, GitHub Actions CI/CD |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop
- PostgreSQL (or use Docker Compose)
- OpenAI API key

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/interviewiq.git
cd interviewiq
```

### 2. Start Database Services

```bash
docker-compose up -d
```

### 3. Backend Setup

```bash
cd server
npm install
cp .env.example .env   # Edit with your OpenAI API key
npx prisma db push
npx prisma generate
npm run db:seed         # Seed sample questions
npm run dev
```

### 4. Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 5. Open in Browser

Visit **http://localhost:3000**

**Demo accounts** (after seeding):
- Admin: `admin@interviewiq.com` / `admin123`
- Candidate: `candidate@interviewiq.com` / `candidate123`

## 📂 Project Structure

```
interviewiq/
├── client/                 # Next.js 14 Frontend
│   ├── app/                # App Router pages
│   │   ├── auth/           # Login & Register
│   │   ├── dashboard/      # Analytics dashboard
│   │   └── interview/      # Problems & coding editor
│   ├── components/         # Reusable UI components
│   ├── lib/                # API client & socket
│   └── store/              # Zustand state management
│
├── server/                 # Express.js Backend
│   ├── src/
│   │   ├── ai/             # OpenAI integration & prompts
│   │   ├── controllers/    # Route handlers
│   │   ├── execution/      # Docker code runner
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── routes/          # API endpoints
│   │   ├── services/       # Business logic
│   │   └── socket/         # WebSocket handlers
│   └── prisma/             # Database schema & seeds
│
├── docker-compose.yml      # PostgreSQL & Redis
└── .github/workflows/      # CI/CD pipeline
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get current user |
| GET | `/api/questions` | List questions (filterable) |
| GET | `/api/questions/:id` | Get question detail |
| POST | `/api/submissions` | Submit code for execution + AI eval |
| GET | `/api/submissions/analytics` | Get user analytics |
| POST | `/api/interviews/sessions` | Start AI interview |

## 🤖 AI Evaluation Output

```json
{
  "logic_score": 9,
  "readability_score": 8,
  "optimization_score": 9,
  "edge_case_analysis": "Handles empty arrays, duplicate values...",
  "suggestions": ["Consider using early return...", "Add input validation..."],
  "time_complexity": "O(n)",
  "space_complexity": "O(n)",
  "overall_score": 8.5
}
```

## 📜 License

MIT © InterviewIQ
