# AGENTS.md

## Purpose

This file provides concrete, copy-pastable instructions for AI coding agents and human contributors working in this repository. It covers setup, development workflows, testing, and validation steps specific to this codebase.

---

## Repo map

```
/
├── frontend/              # React + Vite + Tailwind CSS (PWA, mobile-first)
│   ├── src/
│   │   ├── pages/         # Page components (Login, Register, Record, Recordings, Digests)
│   │   ├── components/    # Reusable UI components + shadcn/ui library
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # API client, utilities
│   │   └── mocks/         # Mock data (reference only, not used in production)
│   ├── vite.config.ts     # Dev server + proxy config
│   └── package.json
├── backend/               # NestJS API (TypeScript)
│   ├── src/
│   │   ├── auth/          # Authentication (JWT, register, login)
│   │   ├── users/         # User entity and service
│   │   ├── recordings/    # Recording CRUD, file upload, AI processing
│   │   ├── digests/       # Daily digest CRUD, CRON generation
│   │   ├── llm/           # LLM abstraction layer (provider-agnostic)
│   │   │   ├── providers/ # Provider implementations (OpenAI, etc.)
│   │   ├── entities/      # TypeORM entities (User, Recording, Digest)
│   │   ├── app.module.ts  # Root module
│   │   └── main.ts        # Bootstrap
│   ├── .env               # Local environment variables (not committed)
│   ├── .env.example       # Template for env vars
│   └── package.json
├── AGENTS.md              # This file — agent guidance for the whole repo
├── .gitignore
└── README.md              # Project overview and setup instructions
```

---

## Quickstart

Prerequisites:
- Node.js 20+
- MySQL server running locally
- OpenAI API key (or another LLM provider key, for AI features)

```bash
# 1. Create the MySQL database
mysql -u <user> -p -e "CREATE DATABASE IF NOT EXISTS dayvoice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Backend setup
cd backend
cp .env.example .env
# Fill in DB credentials, JWT_SECRET, OPENAI_API_KEY
npm install
npm run start:dev    # runs on http://localhost:3000, tables auto-created

# 3. Frontend setup (separate terminal)
cd frontend
npm install
npm run dev          # runs on http://localhost:8080, proxies /api to backend
```

---

## Common commands

### Backend

```bash
cd backend
npm run start:dev         # dev mode with watch
npm run build             # compile TypeScript
npm run start:prod        # run compiled JS
```

### Frontend

```bash
cd frontend
npm run dev               # dev server on :8080
npm run build             # production build
npm run lint              # ESLint
npm run test              # Vitest unit tests
```

---

## Architecture overview

### Data flow

1. User records audio in browser (MediaRecorder API, webm format)
2. Frontend sends audio blob to `POST /api/recordings` (multipart/form-data)
3. Backend saves file to disk, calls LLM service for transcription (default: OpenAI Whisper)
4. Backend sends transcript to LLM service for summary + TODO extraction (default: OpenAI GPT)
5. Complete recording (with transcript, summary, todos) returned to frontend
6. Daily CRON job generates digest from all recordings of the previous day

### Authentication

- JWT-based auth with `passport-jwt`
- Token stored in `localStorage` on the frontend
- All `/api/recordings` and `/api/digests` endpoints require `Authorization: Bearer <token>`
- Audio streaming endpoint (`/api/recordings/:id/audio`) is public (UUID provides security)

### Database

- MySQL with TypeORM
- `synchronize: true` in development — entities auto-create/update tables
- Three tables: `users`, `recordings`, `digests`

### File storage

- Audio files stored on filesystem at `UPLOAD_DIR` (default: `./uploads`)
- Organized in subdirectories by user ID: `uploads/<userId>/<timestamp>.webm`

---

## Environment variables

Template at `backend/.env.example`. Never commit `.env` files.

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | Yes | MySQL host |
| `DB_PORT` | Yes | MySQL port (default 3306) |
| `DB_USERNAME` | Yes | MySQL user |
| `DB_PASSWORD` | Yes | MySQL password |
| `DB_DATABASE` | Yes | Database name |
| `JWT_SECRET` | Yes | Random string for signing JWT tokens |
| `JWT_EXPIRATION` | No | Token lifetime (default: `7d`) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for Whisper + GPT |
| `WHISPER_MODEL` | No | Whisper model name (default: `whisper-1`) |
| `GPT_MODEL` | No | GPT model name (default: `gpt-4o`) |
| `LLM_TEMPERATURE` | No | LLM temperature for text generation (default: `0.3`) |
| `LLM_MAX_TOKENS` | No | Max tokens for LLM responses (default: `1024`) |
| `DAILY_DIGEST_CRON_HOUR` | No | Time for daily digest generation (default: `04:00`) |
| `UPLOAD_DIR` | No | Path for audio file storage (default: `./uploads`) |

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register new user (email + password) |
| POST | `/api/auth/login` | No | Login, returns JWT token |
| GET | `/api/recordings` | Yes | List user's recordings (newest first) |
| GET | `/api/recordings/:id` | Yes | Get recording detail |
| POST | `/api/recordings` | Yes | Upload audio (multipart, field: `audio`) |
| DELETE | `/api/recordings/:id` | Yes | Delete recording + audio file |
| GET | `/api/recordings/:id/audio` | No | Stream audio file |
| GET | `/api/digests` | Yes | List user's daily digests |
| GET | `/api/digests/:id` | Yes | Get digest detail |

---

## Code quality rules

- **Language**: All code in TypeScript. All user-facing strings in Czech.
- **No `console.log`** in committed backend code — use NestJS `Logger` service.
- **Validation**: Backend uses `class-validator` with `ValidationPipe`. Frontend uses `zod` for form validation.
- **Auth**: Always use `@UseGuards(JwtAuthGuard)` on protected endpoints.
- **Error messages**: Return user-friendly Czech messages from the backend.
- **Build before commit**: Run `npm run build` in both `backend/` and `frontend/` to catch type errors before committing.

---

## Security rules

### Secrets and environment

- **Never commit `.env` files.** They are in `.gitignore`. Verify with `git status` before committing.
- **Never hardcode secrets** (API keys, DB passwords, JWT secrets) in source code. Always read from environment variables.
- **`JWT_SECRET` must be a strong random string** in production (min 32 characters). The default `change-me` is for development only.
- **`OPENAI_API_KEY` is sensitive.** Treat it like a password. Never log it, never return it in API responses.

### Backend security

- **Input validation is mandatory.** Every endpoint that accepts user input must use DTOs with `class-validator` decorators. The global `ValidationPipe` with `whitelist: true` strips unknown fields — never disable this.
- **SQL injection prevention**: TypeORM parameterized queries are used throughout. Never construct raw SQL with string concatenation. If raw queries are needed, always use parameterized placeholders (`?` or `:param`).
- **File upload validation**: Only accept expected file types. The `FileInterceptor` handles multipart parsing — never read `req.body` directly for file uploads. Uploaded files are written to a dedicated `uploads/` directory outside the web root.
- **Path traversal prevention**: Never use user-supplied input to construct filesystem paths without sanitization. File paths are built from UUIDs and timestamps, not from user-controlled filenames.
- **Authorization checks**: Every data-access endpoint must verify `userId` ownership. A user must never be able to read, modify, or delete another user's recordings or digests.
- **Password storage**: Passwords are hashed with bcrypt (10 rounds). Never store, log, or return plaintext passwords.
- **Rate limiting**: Not implemented in MVP. Add `@nestjs/throttler` before production deployment.

### Frontend security

- **XSS prevention**: React auto-escapes JSX output. Never use `dangerouslySetInnerHTML`. If rendering HTML from the backend is ever needed, sanitize it first (e.g., with DOMPurify).
- **Token storage**: JWT is stored in `localStorage`. This is acceptable for MVP but is vulnerable to XSS. For production, consider `httpOnly` cookies.
- **No sensitive data in URLs**: Never put tokens or passwords in URL query parameters — they get logged in browser history and server logs.
- **User input**: Always validate on the frontend (for UX) AND on the backend (for security). Frontend validation alone is never sufficient.

### General

- **Dependency updates**: Periodically run `npm audit` in both `backend/` and `frontend/`. Fix critical/high vulnerabilities promptly.
- **CORS**: Currently open (`app.enableCors()`) for development. Restrict to specific origins before production.
- **Error messages**: Never leak stack traces, internal paths, or database details in API error responses. Use generic Czech-language messages for users; log details server-side only.

---

## Testing

### Frontend

```bash
cd frontend
npm run test              # Vitest unit tests
npm run test:watch        # watch mode
```

### Manual testing

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678"}'

# Use returned accessToken for authenticated requests
curl http://localhost:3000/api/recordings \
  -H "Authorization: Bearer <token>"
```

---

## Troubleshooting

### Backend won't start — MySQL connection refused

Ensure MySQL is running and credentials in `.env` match:
```bash
mysql -u <user> -p -e "SELECT 1;"
```

### Tables not created

Tables are auto-created via TypeORM `synchronize: true`. Ensure the database exists:
```bash
mysql -u <user> -p -e "CREATE DATABASE IF NOT EXISTS dayvoice;"
```

### Frontend proxy not working

The Vite dev server proxies `/api` to `http://localhost:3000`. Ensure the backend is running first.

### LLM / OpenAI API errors

Ensure `OPENAI_API_KEY` is set in `backend/.env`. Without it, recording upload will fail at the transcription step (audio file is still saved). To switch LLM providers, change the `useClass` binding in `backend/src/llm/llm.module.ts`.

---

## Best practices

- **Small, focused changes**: Each PR or commit should do one thing. Don't mix features with refactors.
- **Don't break the build**: Run `npm run build` in both backend and frontend before committing. Fix all TypeScript errors.
- **Test after changes**: After modifying API endpoints, test them manually with curl or the frontend. After modifying frontend pages, verify in the browser.
- **Consistent patterns**: Follow existing patterns in the codebase. New endpoints should look like existing endpoints. New pages should look like existing pages.
- **Error handling everywhere**: Backend services must catch and handle errors gracefully. Frontend must show user-friendly error messages via toast or inline errors.
- **No dead code**: Remove unused imports, variables, and functions. Don't comment out code — delete it (git has history).

---

## Documentation hygiene

- **`README.md`** — Human-facing: project overview, setup for newcomers.
- **`AGENTS.md`** (this file) — Agent-facing: precise commands, file paths, rules.
- **`backend/AGENTS.md`** — Backend-specific agent guidance.
- **`frontend/AGENTS.md`** — Frontend-specific agent guidance.

### Keeping AGENTS.md up to date

**Rule: Whenever you make a structural change to the codebase, update the relevant AGENTS.md file(s) in the same commit.**

This includes but is not limited to:
- Adding, renaming, or removing files/directories mentioned in the repo map or structure sections
- Adding or changing API endpoints
- Adding or changing environment variables
- Changing the authentication flow or security rules
- Adding new dependencies that affect how agents should work with the code
- Changing build commands, dev server ports, or proxy configuration
- Changing conventions (coding style, naming patterns, component patterns)

If you only change the backend, update `backend/AGENTS.md` and the root `AGENTS.md` (if the change is visible at the repo level). Same for frontend. When in doubt, update all three.
