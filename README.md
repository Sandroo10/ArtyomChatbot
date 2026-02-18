# Metro Echoes Chatbot

Metro-inspired chatbot project with a Next.js frontend and an Express backend powered by Hugging Face chat completions.

## Architecture

- `frontend/`:
  - Next.js (App Router) UI
  - Chat experience, styling, and client-side interaction logic
  - Sends chat requests to backend `/api/chat`
- `backend/`:
  - Express API service
  - Hugging Face Router integration
  - Conversation shaping + Artyom persona prompt
  - Anonymous cooldown/limit enforcement

## Key Features

- Metro-themed immersive chat UI
- Artyom persona with structured behavior prompt
- Message formatting support:
  - `*thought/action*` and `**thought/action**` rendered italic and lighter in UI
- Backend-enforced usage policy:
  - 10 exchanges per cooldown window
  - 5-hour temporary block (no login required)
- Weekly automated API checks via GitHub Actions

## Requirements

- Node.js 20+ recommended
- npm

## Local Development

Run backend and frontend in separate terminals.

### 1) Backend

```sh
cd backend
npm install
node server.js
```

### 2) Frontend

```sh
cd frontend
npm install
npm run dev
```


## API Contract

### `POST /api/chat`

Request:

```json
{
  "messages": [
    { "role": "user", "content": "My name is Anna" },
    { "role": "assistant", "content": "Stay close." }
  ]
}
```

Success response:

```json
{
  "text": "..."
}
```

When near/at limit, response may include:

```json
{
  "text": "...",
  "limit": {
    "exchange_count": 10,
    "remaining_exchanges": 0,
    "blocked_until": "2026-01-01T00:00:00.000Z"
  }
}
```

Cooldown-blocked response:

```json
{
  "error": "Message limit reached.",
  "details": "Your adventures are halted here, Anya will accompany Artyom for now.",
  "retry_after_seconds": 18000,
  "blocked_until": "2026-01-01T00:00:00.000Z"
}
```

## Deployment (Vercel)

Deploy as two Vercel projects from the same repository.

### Backend project

- Root Directory: `backend`
- Uses `backend/vercel.json` + `server.js`
- Environment variables:
  - `HF_TOKEN`
  - `HF_MODEL` (optional if default is acceptable)

### Frontend project

- Root Directory: `frontend`
- Environment variable:
  - `NEXT_PUBLIC_API_BASE_URL=https://<your-backend>.vercel.app`
- Use only the backend base domain (no `/api/chat` suffix)

## Testing

Frontend test command:

```sh
cd frontend
npm run test
```

`frontend/src/test/chatbot.test.ts` runs endpoint checks against:

- `TEST_API_URL` + `/api/chat`

## Weekly CI

Workflow: `.github/workflows/weekly-tests.yml`

- Runs every Monday at 09:00 UTC
- Also supports manual trigger (`workflow_dispatch`)
- Requires GitHub Actions repository secret:
  - `TEST_API_URL=https://<your-backend>.vercel.app`

## Operational Notes

- Cooldown state is currently in-memory on backend.
- In-memory state resets on redeploy/restart.
- For stronger persistence across instances, move limit state to Redis.

## Legal

This project is a fan-made, non-profit concept. It is not affiliated with, endorsed by, or connected to Metro, Metro 2033, 4A Games, or Deep Silver.
