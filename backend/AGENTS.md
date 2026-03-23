# Backend AGENTS.md

## Purpose

Agent-specific guidance for the NestJS backend of Dayvoice.

---

## Structure

```
backend/src/
├── main.ts                    # App bootstrap, CORS, global prefix, validation pipe
├── app.module.ts              # Root module — imports all feature modules
├── entities/                  # TypeORM entities
│   ├── user.entity.ts         # User (id, email, passwordHash, createdAt)
│   ├── recording.entity.ts    # Recording (id, userId, audioPath, transcript, summary, todos, durationSeconds)
│   └── digest.entity.ts       # Digest (id, userId, date, dayName, summary, todos, recordingIds)
├── auth/                      # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts     # POST /auth/register, POST /auth/login
│   ├── auth.service.ts        # Register (bcrypt hash), Login (JWT sign)
│   ├── jwt.strategy.ts        # Passport JWT strategy
│   ├── jwt-auth.guard.ts      # Guard for protected routes
│   └── dto/
│       ├── register.dto.ts    # email + password validation
│       └── login.dto.ts
├── users/                     # Users module
│   ├── users.module.ts
│   └── users.service.ts       # findByEmail, findById, create
├── recordings/                # Recordings module
│   ├── recordings.module.ts
│   ├── recordings.controller.ts  # CRUD + audio streaming
│   └── recordings.service.ts     # File save, LLM processing, CRUD
├── digests/                   # Digests module
│   ├── digests.module.ts
│   ├── digests.controller.ts  # GET list + detail
│   └── digests.service.ts     # CRON job, daily digest generation
└── llm/                       # LLM abstraction layer (provider-agnostic)
    ├── llm.service.ts         # Abstract LlmService class + SummaryResult type
    ├── llm.module.ts          # Module that binds LlmService to a provider
    └── providers/
        └── openai-llm.service.ts  # OpenAI implementation (Whisper + GPT)
```

---

## Commands

```bash
npm run start:dev         # Start dev server with watch mode (port 3000)
npm run build             # Compile TypeScript to dist/
npm run start:prod        # Run compiled app from dist/
```

---

## Adding a new endpoint

1. Create/update DTO in `<module>/dto/` with `class-validator` decorators.
2. Implement service method.
3. Add controller route. Apply `@UseGuards(JwtAuthGuard)` if auth required.
4. Import any new modules in the feature module's `imports`.
5. Run `npm run build` to verify compilation.

---

## Entity conventions

- Use `@PrimaryGeneratedColumn('uuid')` for all IDs.
- Use `@CreateDateColumn()` for timestamps.
- Store JSON data (todos, recordingIds) as `@Column({ type: 'json' })`.
- Relations use `@ManyToOne` / `@OneToMany` with explicit `@JoinColumn`.
- TypeORM `synchronize: true` auto-creates tables in dev. For production, switch to migrations.

---

## Authentication flow

1. User registers via `POST /api/auth/register` — password hashed with bcrypt (10 rounds).
2. User logs in via `POST /api/auth/login` — receives JWT token.
3. Token sent as `Authorization: Bearer <token>` header on subsequent requests.
4. `JwtAuthGuard` validates token and injects `req.user = { id, email }`.
5. Token expires per `JWT_EXPIRATION` env var (default: 7 days).

---

## File upload handling

- Audio uploaded as `multipart/form-data` with field name `audio`.
- `FileInterceptor('audio')` from `@nestjs/platform-express` handles parsing.
- File stored in memory (`buffer`), then written to `UPLOAD_DIR/<userId>/<timestamp>.webm`.
- Audio streaming endpoint: `GET /api/recordings/:id/audio` — no auth required, serves file with `Content-Type: audio/webm`.

---

## LLM abstraction layer

All AI/LLM calls go through the abstract `LlmService` class (`llm/llm.service.ts`). The rest of the application never imports the OpenAI SDK directly.

**Architecture:**
- `LlmService` — abstract class with three methods: `transcribe()`, `generateSummary()`, `generateDailyDigest()`. Also exports the `SummaryResult` type.
- `LlmModule` — binds `LlmService` to a concrete provider via `{ provide: LlmService, useClass: OpenaiLlmService }`.
- `providers/openai-llm.service.ts` — OpenAI implementation (Whisper for transcription, GPT for summaries).

**Swapping providers:** To replace OpenAI with another LLM provider, create a new class extending `LlmService` in `llm/providers/` and change `useClass` in `llm/llm.module.ts`. No other files need to change.

**Configuration (env vars):**
- `OPENAI_API_KEY` — API key for OpenAI provider.
- `WHISPER_MODEL` — Whisper model name (default: `whisper-1`).
- `GPT_MODEL` — GPT model name (default: `gpt-4o`).
- `LLM_TEMPERATURE` — Temperature for text generation (default: `0.3`).
- `LLM_MAX_TOKENS` — Max tokens for LLM responses (default: `1024`).

**Error handling:** Each method in `OpenaiLlmService` catches API errors, logs them via NestJS `Logger`, and re-throws with a descriptive message. Callers (recordings, digests) catch these and fall back to default text.

---

## CRON job (daily digests)

- Registered dynamically in `DigestsService.onModuleInit()` using `SchedulerRegistry` + `CronJob`.
- Time configurable via `DAILY_DIGEST_CRON_HOUR` (format: `HH:MM`, default: `04:00`).
- Queries recordings from the previous day (00:00–23:59).
- Groups by user, generates one digest per user per day.
- Skips if no recordings or if digest already exists for that date/user.
- Errors are logged, not thrown (won't crash the app).

---

## Error handling

- `ValidationPipe` with `whitelist: true` strips unknown properties.
- `NotFoundException` for missing resources (Czech messages).
- `ConflictException` for duplicate email registration.
- `UnauthorizedException` for wrong credentials.
- LLM failures: logged, recording saved with fallback text "Zpracování se nezdařilo."

---

## Security rules

- **Always validate input.** Every endpoint accepting data must use a DTO with `class-validator` decorators. Never trust raw `req.body` or `req.params`.
- **Always check resource ownership.** Every query for recordings or digests must filter by `userId` from the JWT token (`req.user.id`). Never allow a user to access another user's data by guessing an ID.
- **Never construct SQL manually.** Use TypeORM repository methods or query builder with parameterized values. Never concatenate user input into SQL strings.
- **Never expose internal paths or stack traces.** Catch errors and return generic Czech messages. Log details with `this.logger.error()`.
- **File upload safety:**
  - Write files only to the configured `UPLOAD_DIR`.
  - Build paths from UUIDs and timestamps — never from user-supplied filenames.
  - Validate the uploaded file exists before processing (`audioFile.buffer` check).
- **Secrets management:**
  - Read all secrets from `ConfigService` / environment variables.
  - Never hardcode API keys, passwords, or JWT secrets in source code.
  - Never log secrets or include them in error responses.
- **Password handling:** Hash with bcrypt (10 rounds minimum). Never store, log, return, or compare plaintext passwords outside `auth.service.ts`.
- **CORS:** Currently open for development. Before production, restrict to specific frontend origins.
- **Rate limiting:** Not implemented in MVP. Add `@nestjs/throttler` on auth endpoints before production to prevent brute-force attacks.

---

## Best practices

- **Run `npm run build` before committing** to catch TypeScript errors early.
- **Follow existing module patterns.** New modules should mirror the structure of `recordings/` or `digests/` — a module file, controller, service, and DTOs.
- **Use NestJS `Logger`**, not `console.log`. Each service should have `private readonly logger = new Logger(ServiceName.name)`.
- **Keep controllers thin.** Business logic belongs in services. Controllers handle HTTP concerns (decorators, status codes, response formatting).
- **Keep services focused.** If a service grows beyond ~200 lines, consider splitting it.
- **DTOs for all input.** Even simple endpoints benefit from explicit DTO classes for documentation and validation.
- **Explicit typing.** Avoid `any` where possible. Use `unknown` with type guards when dealing with external data (API responses, parsed JSON).
- **Graceful degradation for LLM.** If the API is unreachable, the recording should still be saved with empty transcript and a fallback summary message.

---

## Key design decisions

- **Synchronous AI processing**: Recording upload waits for LLM service (transcription + summary) to complete before responding. This keeps the frontend simple (no polling) at the cost of slower upload response.
- **No migrations in MVP**: `synchronize: true` handles schema updates. Switch to migrations before production.
- **Audio endpoint without auth**: `<audio>` elements can't send JWT headers. UUID in the URL provides sufficient security for MVP.
- **Flat module structure**: Each domain has its own folder under `src/`. No deeply nested hierarchy.

---

## Keeping this file up to date

**When you change the backend, update this file in the same commit.** This includes adding/removing endpoints, changing entity schemas, adding env vars, changing auth flow, or modifying the module structure. Also update the root `AGENTS.md` if the change is visible at the repo level (e.g., new API endpoints, new env vars).
