# Metro Chatbot Monorepo

This repository now contains:

- `frontend/`: Next.js Metro chatbot UI
- `backend/`: Express API server with `POST /api/chat`

## Frontend

```sh
cd frontend
npm install
npm run dev
```

Optional environment variable (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Backend

```sh
cd backend
npm install
node server.js
```

Required environment variables in `backend/.env`:

```env
HF_TOKEN=your_hugging_face_token
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.2
PORT=3001
```

Backend endpoint:

- `POST /api/chat`
  - body: `{ "messages": [{ "role": "user", "content": "My name is Anna" }] }`
  - response: `{ "text": "..." }`
