# Dayvoice

Mobilní PWA pro hlasové poznámky s automatickým AI přepisem, chytrým shrnutím a denními přehledy.

**Tvůj den, tvůj hlas.**

## Hlavni funkce

- Nahrávání hlasových poznámek (max 30 minut)
- Automatický přepis řeči (OpenAI Whisper)
- AI shrnutí a extrakce TODO úkolů (OpenAI GPT)
- Denní přehledy generované automaticky (CRON)
- Registrace a přihlášení (email + heslo, JWT)

## Tech stack

| Vrstva | Technologie |
|--------|-------------|
| Frontend | React + Vite + Tailwind CSS (PWA, mobile-first) |
| Backend | NestJS (TypeScript) |
| Databáze | MySQL |
| AI | OpenAI API (Whisper + GPT) |
| Autentizace | JWT (passport-jwt) |

## Struktura repozitáře

```
dayvoice/
├── frontend/          # React + Vite + Tailwind (Lovable)
├── backend/           # NestJS API
├── AGENTS.md          # Instrukce pro AI agenty
├── .gitignore
└── README.md
```

## Prerekvizity

- Node.js 20+
- MySQL server
- OpenAI API klíč

## Rychlý start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Vyplň .env (DB přístupy, OPENAI_API_KEY, JWT_SECRET)
npm install
npm run start:dev
```

Backend běží na `http://localhost:3000`. API prefix: `/api`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend běží na `http://localhost:8080`. Proxy na backend je nakonfigurováno ve `vite.config.ts`.

### 3. Databáze

Vytvoř MySQL databázi `dayvoice`. Při prvním spuštění backendu se tabulky vytvoří automaticky (TypeORM `synchronize: true`).

```sql
CREATE DATABASE dayvoice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Konfigurace (.env)

| Proměnná | Popis | Výchozí |
|----------|-------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USERNAME` | MySQL uživatel | - |
| `DB_PASSWORD` | MySQL heslo | - |
| `DB_DATABASE` | Název databáze | `dayvoice` |
| `JWT_SECRET` | Tajný klíč pro JWT | - |
| `JWT_EXPIRATION` | Platnost tokenu | `7d` |
| `OPENAI_API_KEY` | OpenAI API klíč | - |
| `WHISPER_MODEL` | Model pro přepis | `whisper-1` |
| `GPT_MODEL` | Model pro shrnutí | `gpt-4o` |
| `DAILY_DIGEST_CRON_HOUR` | Čas generování přehledů | `04:00` |
| `UPLOAD_DIR` | Cesta pro audio soubory | `./uploads` |

## API endpointy

| Metoda | Cesta | Popis | Auth |
|--------|-------|-------|------|
| POST | `/api/auth/register` | Registrace | Ne |
| POST | `/api/auth/login` | Přihlášení | Ne |
| GET | `/api/recordings` | Seznam nahrávek | Ano |
| GET | `/api/recordings/:id` | Detail nahrávky | Ano |
| POST | `/api/recordings` | Upload nahrávky (multipart) | Ano |
| DELETE | `/api/recordings/:id` | Smazání nahrávky | Ano |
| GET | `/api/recordings/:id/audio` | Stream audio souboru | Ne |
| GET | `/api/digests` | Seznam denních přehledů | Ano |
| GET | `/api/digests/:id` | Detail přehledu | Ano |
