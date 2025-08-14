WhatsApp Web Clone - Full Stack

This project contains a Node.js backend (Express, MongoDB, Socket.IO) and a Next.js frontend that mimics WhatsApp Web. It ingests sample webhook payloads, groups conversations by `wa_id`, shows messages with statuses, and supports sending demo messages (stored only).

Structure

- `server/`: Express API, Mongoose models, ingestion script
- `client/`: Next.js frontend
- `whatsapp sample payloads/`: Provided sample JSON payloads

Quick start (local)

1. Create a MongoDB Atlas cluster. Get the connection string for database `whatsapp`.
2. In `server/`, create `.env`:

```
MONGODB_URI=YOUR_MONGODB_URI
PORT=3001
CORS_ORIGIN=http://localhost:3000
ENABLE_CHANGE_STREAMS=false
```

3. Install dependencies:

```
cd server && npm install
cd ../client && npm install
```

4. Seed DB with sample payloads:

```
cd ../server
npm run ingest
```

5. Run services (two terminals):

- API: `cd server && npm run dev`
- Frontend: `cd client && npm run dev`

Open http://localhost:3000

Deployment

- Backend: Render (Web Service), env vars as above
- Frontend: Vercel, set `NEXT_PUBLIC_API_BASE` to your backend URL

API

- `GET /api/conversations` → list grouped chats
- `GET /api/messages?wa_id=...` → messages for a chat
- `POST /api/send { waId, text }` → create outbound message (demo)

Real-time

- Socket.IO events: `message:new`, `message:update`
- Optional: Enable `ENABLE_CHANGE_STREAMS=true` on server if your cluster supports it


