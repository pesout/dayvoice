# Frontend AGENTS.md

## Purpose

Agent-specific guidance for the React frontend of Dayvoice.

---

## Structure

```
frontend/src/
├── App.tsx                      # Routes, auth guards, providers
├── main.tsx                     # React entry point
├── index.css                    # Global styles, design tokens, custom utilities
├── pages/                       # Page components (one per route)
│   ├── LoginPage.tsx            # Email + password login form
│   ├── RegisterPage.tsx         # Registration with Zod validation
│   ├── RecordPage.tsx           # Main page — audio recording
│   ├── RecordingsPage.tsx       # List of user's recordings
│   ├── RecordingDetailPage.tsx  # Recording detail (audio, transcript, summary tabs)
│   ├── DigestsPage.tsx          # List of daily digests
│   ├── DigestDetailPage.tsx     # Digest detail (summary + todos)
│   └── NotFound.tsx             # 404 page
├── components/                  # Reusable components
│   ├── AudioRecorder.tsx        # Recording UI (mic button, timer, processing state)
│   ├── BottomNav.tsx            # Fixed bottom navigation (3 tabs)
│   ├── RecordingCard.tsx        # Recording list item card
│   ├── DigestCard.tsx           # Digest list item card
│   ├── TodoList.tsx             # Checkbox list with localStorage persistence
│   ├── TabSwitcher.tsx          # Tab navigation component
│   ├── Logo.tsx                 # Gradient text logo
│   ├── ConfirmDialog.tsx        # Confirmation modal
│   ├── EmptyState.tsx           # Empty state illustration
│   └── ui/                      # shadcn/ui component library (70+ components)
├── hooks/                       # Custom hooks
│   ├── useLocalStorageTodos.ts  # Todo checkbox state in localStorage
│   ├── use-mobile.tsx           # Mobile breakpoint detection
│   └── use-toast.ts             # Toast notification system
├── lib/                         # Utilities
│   ├── api.ts                   # API client + type definitions (Todo, Recording, Digest)
│   └── utils.ts                 # cn() — Tailwind class merge utility
└── mocks/                       # Reference mock data (not imported in production code)
    └── data.ts
```

---

## Commands

```bash
npm run dev               # Dev server on http://localhost:8080
npm run build             # Production build
npm run lint              # ESLint
npm run test              # Vitest unit tests
npm run test:watch        # Vitest watch mode
```

---

## Dev server proxy

The Vite dev server proxies all `/api` requests to `http://localhost:3000` (backend). Configured in `vite.config.ts`:

```typescript
proxy: {
  "/api": {
    target: "http://localhost:3000",
    changeOrigin: true,
  },
},
```

Ensure the backend is running before starting the frontend dev server.

---

## API client

All API communication goes through `src/lib/api.ts`:

- **Singleton**: `export const api = new ApiClient()`
- **Auth**: Stores JWT token in `localStorage` under key `token`. Adds `Authorization: Bearer` header automatically.
- **401 handling**: Clears token and redirects to `/login` on unauthorized responses.
- **Type exports**: `Todo`, `Recording`, `Digest` interfaces are exported from this file.

### Usage

```typescript
import { api, type Recording } from "@/lib/api";

// Login
await api.login(email, password);

// Fetch recordings
const recordings = await api.getRecordings();

// Upload recording
const recording = await api.uploadRecording(audioBlob, durationSeconds);

// Delete
await api.deleteRecording(id);
```

---

## Authentication

- Auth state: `!!localStorage.getItem("token")`
- `AuthGuard` component wraps protected routes — redirects to `/login` if no token.
- `PublicRoute` component wraps login/register — redirects to `/` if already authenticated.
- Token set by `api.login()`, cleared by `api.logout()` or on 401 response.

---

## Routing

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/login` | LoginPage | Public | Login form |
| `/register` | RegisterPage | Public | Registration form |
| `/` | RecordPage | Protected | Audio recording |
| `/recordings` | RecordingsPage | Protected | Recordings list |
| `/recordings/:id` | RecordingDetailPage | Protected | Recording detail |
| `/digests` | DigestsPage | Protected | Digests list |
| `/digests/:id` | DigestDetailPage | Protected | Digest detail |
| `*` | NotFound | - | 404 page |

---

## Styling

- **Framework**: Tailwind CSS 3 with custom design tokens in `index.css`.
- **Component library**: shadcn/ui (Radix UI based) in `src/components/ui/`.
- **Custom utilities**: `.btn-gradient`, `.text-gradient`, `.shadow-surface`, `.shadow-mic-active`, `.animate-recording-pulse`.
- **Design system**: Purple-pink gradient primary, pastel yellow secondary, white background, Inter font.
- **Mobile-first**: Max width 480px centered layout, fixed bottom navigation.

### Class merge

Always use `cn()` from `@/lib/utils` when combining conditional Tailwind classes:
```typescript
import { cn } from "@/lib/utils";
cn("base-class", condition && "conditional-class")
```

---

## Component patterns

### Data fetching

Pages use `useEffect` + `useState` for data fetching:
```typescript
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.getData()
    .then(setData)
    .catch(() => toast.error("Error message"))
    .finally(() => setLoading(false));
}, []);
```

### Forms

- Login/Register use controlled inputs with `useState`.
- Register uses `zod` for client-side validation.
- Errors displayed inline below fields.
- API errors shown as a banner above the form.

### Audio recording

`AudioRecorder` component manages the full recording lifecycle:
1. `idle` → User clicks mic → `recording` (MediaRecorder API, webm format)
2. `recording` → User clicks stop → `processing` (uploads to API)
3. `processing` → API returns → navigates to recording detail
4. Error handling: microphone permission denied, upload failure

### Todo persistence

Todo checkbox state is stored in `localStorage` per recording/digest:
- Key format: `todos-rec-<id>` or `todos-digest-<id>`
- Managed by `useLocalStorageTodos` hook

---

## Key dependencies

| Package | Purpose |
|---------|---------|
| `react-router-dom` | Client-side routing |
| `@tanstack/react-query` | Installed but not yet used (available for future use) |
| `zod` | Form validation schemas |
| `react-hook-form` | Form management (available, used with shadcn form components) |
| `sonner` | Toast notifications |
| `lucide-react` | Icon library |
| `date-fns` | Date formatting utilities |

---

## Security rules

- **Never use `dangerouslySetInnerHTML`.** React auto-escapes JSX output, which prevents XSS. If you ever need to render HTML from the backend, sanitize it first with a library like DOMPurify.
- **Never put tokens or secrets in URLs.** Query parameters are logged in browser history, server logs, and analytics. Use `Authorization` headers for auth.
- **Always validate user input on the frontend** (for UX) — but never rely on it for security. The backend must independently validate all input.
- **Token handling:**
  - JWT is stored in `localStorage` under the key `token`.
  - The API client automatically clears the token and redirects to `/login` on 401.
  - Never expose the token in the URL, in error messages, or in logs.
- **No sensitive data in client-side storage.** Only store the JWT token and todo checkbox state in `localStorage`. Never store passwords, API keys, or personal data.
- **API client is the only HTTP layer.** Never call `fetch()` directly — always use the `api` singleton from `@/lib/api`. This ensures auth headers are attached and 401s are handled consistently.
- **Dependency security**: Run `npm audit` periodically. Fix critical/high vulnerabilities before committing.

---

## Best practices

- **Run `npm run build` before committing** to catch TypeScript and bundling errors.
- **Run `npm run lint`** to catch code quality issues.
- **Follow existing page patterns.** New pages should match the structure of existing ones: `useEffect` for data fetching, `useState` for local state, `Loader2` spinner, toast for errors.
- **Keep components small.** If a component grows beyond ~150 lines, extract sub-components.
- **Prefer composition over props bloat.** If a component takes more than 5-6 props, consider splitting it or using children.
- **Avoid inline styles.** Use Tailwind utility classes. Use `cn()` for conditional classes.
- **No dead imports.** Remove unused imports. ESLint will flag these.
- **Error boundaries.** Currently not implemented — consider adding a React error boundary wrapper for production resilience.

---

## Important conventions

- **Language**: All UI text in Czech. Use informal tone (tykání).
- **Types**: Import `Todo`, `Recording`, `Digest` from `@/lib/api`, NOT from `@/mocks/data`.
- **No direct fetch calls**: Always use the `api` singleton from `@/lib/api`.
- **Empty states**: Use `EmptyState` component with appropriate icon, title, and description.
- **Loading states**: Show `Loader2` spinner (from lucide-react) centered on the page.
- **Confirmations**: Use `ConfirmDialog` component for destructive actions.
- **Toast notifications**: Use `toast()` from sonner for success/error messages.

---

## Keeping this file up to date

**When you change the frontend, update this file in the same commit.** This includes adding/removing pages or components, changing routing, changing the API client, changing auth flow, adding dependencies, or changing conventions. Also update the root `AGENTS.md` if the change is visible at the repo level.
