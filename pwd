# InterviewIQ Backend Documentation

A comprehensive guide to the InterviewIQ backend architecture for new developers.

---

## 📁 Project Structure

```
server/
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL)
│   └── seed.ts                # Seeds questions, users, test cases
├── docker/
│   └── Dockerfile             # Docker image for code execution sandbox
├── src/
│   ├── index.ts               # App entry point (Express + Socket.IO)
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── routes/                # API route definitions
│   ├── controllers/           # Request handlers (business logic)
│   ├── services/              # Database query layer
│   ├── middleware/             # Auth, validation, error handling
│   ├── execution/             # Docker-based code runner
│   ├── ai/                    # OpenAI integration
│   └── socket/                # WebSocket for live interviews
├── temp/                      # Temporary files for code execution
├── .env                       # Environment variables
└── package.json
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Express.js** | REST API framework |
| **TypeScript** | Type-safe JavaScript |
| **PostgreSQL** | Primary database |
| **Prisma ORM** | Database access & migrations |
| **Docker** | Sandboxed code execution |
| **OpenAI (GPT-4)** | Code evaluation & interview AI |
| **Socket.IO** | Real-time interview chat |
| **JWT** | Authentication tokens |
| **Helmet** | Security headers |
| **Zod** | Request validation |
| **bcryptjs** | Password hashing |

---

## 🔐 Authentication Flow

```
User registers/logs in → Server returns JWT token
                           ↓
Frontend stores token in localStorage
                           ↓
Every API request sends: Authorization: Bearer <token>
                           ↓
auth.ts middleware verifies JWT → attaches userId & userRole to request
```

**Middleware:** `src/middleware/auth.ts`
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies using `JWT_SECRET` from `.env`
- Attaches `userId` and `userRole` to the request object
- Returns 401 if token is missing or invalid

**Role Guard:** `src/middleware/roleGuard.ts`
- Used after `authenticate` to restrict routes to specific roles (e.g., ADMIN)

---

## 🌐 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| POST | `/register` | ❌ | Create new user account |
| POST | `/login` | ❌ | Login, returns JWT token |
| GET | `/profile` | ✅ | Get current user's profile |

### Questions (`/api/questions`)

| Method | Endpoint | Auth? | Role | Description |
|--------|----------|-------|------|-------------|
| GET | `/` | ❌ | Any | List all questions |
| GET | `/:id` | ❌ | Any | Get single question with test cases |
| POST | `/` | ✅ | ADMIN | Create new question |
| PUT | `/:id` | ✅ | ADMIN | Update question |
| DELETE | `/:id` | ✅ | ADMIN | Delete question |

### Code Execution (`/api/execute`)

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| POST | `/` | ❌ | Execute code in Docker sandbox |

**Request body:**
```json
{
  "language": "cpp",
  "code": "vector<int> twoSum(...) { ... }",
  "testCases": [
    { "input": "[2,7,11,15]\n9", "expected": "[0,1]" }
  ]
}
```

**Response (with test cases):**
```json
{
  "success": true,
  "testCaseResults": [
    {
      "testCase": 1,
      "input": "[2,7,11,15]\n9",
      "expected": "[0,1]",
      "actual": "[0,1]",
      "passed": true,
      "runtime": 380
    }
  ],
  "passed": 1,
  "total": 1,
  "runtime": 380
}
```

### Submissions (`/api/submissions`)

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| POST | `/` | ✅ | Submit code for evaluation |
| GET | `/mine` | ✅ | Get current user's submissions |
| GET | `/analytics` | ✅ | Get submission statistics |
| GET | `/:id` | ✅ | Get single submission detail |

### Interviews (`/api/interviews`)

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| POST | `/sessions` | ✅ | Start new interview session |
| PATCH | `/sessions/:id/end` | ✅ | End an interview session |
| GET | `/sessions` | ✅ | List user's interview sessions |
| GET | `/sessions/:id` | ✅ | Get session with messages |

---

## 🐳 Code Execution Engine

The most complex part of the backend. Located in `src/execution/`.

### How It Works

```
User submits function code (e.g., twoSum)
    ↓
cppWrapper.ts: parseFunctionSignature() → extracts return type, params
    ↓
cppWrapper.ts: generateCppDriver() → creates full main.cpp with:
    - #include directives
    - Input parsers (parseVectorInt, etc.)
    - main() that reads stdin, calls user function, prints result
    ↓
dockerRunner.ts: writes main.cpp to temp/<uuid>/
    ↓
Docker container runs:  g++ -std=c++17 main.cpp -o main && ./main < input.txt
    ↓
Output compared with expected → { passed: true/false, actual, expected }
    ↓
Temp folder cleaned up
```

### Key Files

| File | Purpose |
|------|---------|
| `cppWrapper.ts` | Parses C++ function signatures, generates main() driver |
| `dockerRunner.ts` | Manages Docker containers, compilation, execution, test case running |

### Security Constraints (Docker)

| Constraint | Value | Purpose |
|---|---|---|
| `--network=none` | No network | Prevents internet access |
| `--memory=100m` | 100MB RAM | Prevents memory bombs |
| `--cpus=0.5` | Half CPU | Prevents CPU hogging |
| `--pids-limit=64` | 64 processes | Prevents fork bombs |
| `--rm` | Auto-remove | Cleans up containers |
| Timeout | 15 seconds | Prevents infinite loops |

### Supported Languages

| Language | Compile Command | Run Command |
|---|---|---|
| C++ | `g++ -std=c++17 main.cpp -o main` | `./main` |
| Java | `javac Main.java` | `java Main` |
| Python | — (interpreted) | `python3 main.py` |

---

## 🤖 AI Integration

Located in `src/ai/`. Uses **OpenAI GPT-4** for two features:

### 1. Code Evaluation (`evaluator.ts`)

After a user submits code, the AI evaluates it and returns:

```json
{
  "logicScore": 9,
  "readabilityScore": 8,
  "optimizationScore": 7,
  "edgeCaseAnalysis": "Handles empty arrays but not negative numbers",
  "suggestions": ["Consider using early termination"],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "overallScore": 8.0
}
```

### 2. Follow-up Questions (`followupGenerator.ts`)

Generates follow-up interview questions based on the user's solution.

### 3. Prompt Templates (`promptTemplates.ts`)

Contains prompt templates for evaluation and interview system prompts.

---

## 🔌 WebSocket (Real-time Interview)

Located in `src/socket/interviewSocket.ts`. Powers the live AI interview feature.

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_session` | Client → Server | Join an interview room |
| `session_joined` | Server → Client | Confirmation with message count |
| `send_message` | Client → Server | Send a message to AI interviewer |
| `ai_typing` | Server → Client | AI is typing indicator |
| `ai_message` | Server → Client | AI's response |
| `end_session` | Client → Server | End the interview |
| `session_ended` | Server → Client | Confirmation |

### Flow

```
Client connects with JWT token → auth middleware verifies
    ↓
Client emits "join_session" with sessionId and topic
    ↓
Server loads conversation history from DB
    ↓
If new session → AI sends greeting
    ↓
Client sends message → Server forwards to OpenAI → AI responds
    ↓
All messages saved to InterviewMessage table
```

---

## 🗄 Database Schema

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    User      │     │   Question   │     │  TestCase    │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ id           │     │ id           │←───→│ questionId   │
│ email        │     │ title        │     │ input        │
│ name         │     │ description  │     │ expected     │
│ password     │     │ difficulty   │     │ isHidden     │
│ role (enum)  │     │ tags[]       │     └─────────────┘
└──────┬───────┘     │ hints[]      │
       │             │ constraints  │
       │             │ starterCode  │
       │             └──────┬───────┘
       │                    │
       ▼                    ▼
┌──────────────────────────────────┐
│           Submission             │
├──────────────────────────────────┤
│ id, userId, questionId           │
│ code, language, status           │
│ stdout, stderr, runtime, memory  │
│ passed, total                    │
└───────────────┬──────────────────┘
                │
                ▼
┌──────────────────────────────────┐
│          AIEvaluation            │
├──────────────────────────────────┤
│ logicScore, readabilityScore     │
│ optimizationScore, overallScore  │
│ edgeCaseAnalysis, suggestions[]  │
│ timeComplexity, spaceComplexity  │
└──────────────────────────────────┘

┌──────────────────┐     ┌────────────────────┐
│ InterviewSession │←───→│ InterviewMessage    │
├──────────────────┤     ├────────────────────┤
│ userId, topic    │     │ sessionId           │
│ mode, status     │     │ role (user/assistant)│
│ score, feedback  │     │ content             │
└──────────────────┘     └────────────────────┘
```

---

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/interviewiq"

# Auth
JWT_SECRET="your-secret-key"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4"

# Server
PORT=3001
CLIENT_URL="http://localhost:3000"
NODE_ENV="development"

# Docker (code execution)
DOCKER_TIMEOUT=15000
DOCKER_MEMORY_LIMIT=100m
DOCKER_CPU_LIMIT=0.5
DOCKER_IMAGE=code-sandbox
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
cd server
npm install

# 2. Set up .env file (copy from .env.example)
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, OPENAI_API_KEY

# 3. Set up database
npx prisma generate
npx prisma db push

# 4. Seed sample data
npm run db:seed

# 5. Build Docker sandbox image
cd docker
docker build -t code-sandbox .
cd ..

# 6. Start development server
npm run dev
# Server runs at http://localhost:3001
```

---

## 📜 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `tsx watch src/index.ts` | Start dev server with hot reload |
| `build` | `tsc` | Compile TypeScript to JavaScript |
| `start` | `node dist/index.js` | Start production server |
| `db:generate` | `prisma generate` | Generate Prisma client |
| `db:push` | `prisma db push` | Push schema to database |
| `db:migrate` | `prisma migrate dev` | Run database migrations |
| `db:seed` | `tsx prisma/seed.ts` | Seed database with sample data |
| `lint` | `eslint src/` | Run linter |
