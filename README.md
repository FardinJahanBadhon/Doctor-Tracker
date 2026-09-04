# Doctor Tracker

A secure administrative web application for managing doctors and their patients.

> **Status:** Project foundation only. Authentication, doctor management, patient management, and the dashboard have not been built yet — they'll be added feature by feature.

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui (Radix primitives), Lucide React, Redux Toolkit + RTK Query
- **Backend:** Node.js + Express + TypeScript, MongoDB via Mongoose
- **API:** RESTful, JSON over HTTP, frontend and backend as two independently run applications

## Project Structure

```
Doctor Tracker/
├── frontend/     Next.js app (App Router, TypeScript, Tailwind, shadcn/ui, Redux Toolkit + RTK Query)
├── backend/      Express API (TypeScript, MongoDB via Mongoose)
└── README.md
```

### `frontend/src/`

| Folder | Purpose |
|---|---|
| `app/` | Next.js App Router pages and layouts |
| `components/ui/` | shadcn/ui primitives (generated via the `shadcn` CLI) |
| `components/common/` | Reusable app-specific components built on top of `ui/` |
| `components/layout/` | Page shell components (sidebar, navbar, etc. — added with the UI feature) |
| `features/` | Feature-specific UI and logic, one subfolder per feature, added as each is built |
| `store/` | Redux store setup — `index.ts` (root store), `hooks.ts` (typed `useAppDispatch`/`useAppSelector`), `api/apiSlice.ts` (base RTK Query API; feature endpoints are injected into it) |
| `hooks/` | Reusable custom React hooks |
| `services/` | Non-RTK-Query API helpers, if needed |
| `types/` | Shared TypeScript types |
| `utils/` | Pure utility functions |
| `constants/` | App-wide constants (routes, query keys, etc.) |
| `lib/` | Library glue code (currently `utils.ts`, shadcn's `cn()` helper) |

### `backend/src/`

| Folder | Purpose |
|---|---|
| `config/` | Environment config (`env.ts`), MongoDB connection (`db.ts`), CORS options |
| `controllers/` | Request handlers — parse the request, call a service, send the response |
| `models/` | Mongoose schemas (empty — added per feature) |
| `routes/` | Express routers, mounted under `/api` in `routes/index.ts` |
| `middleware/` | `errorHandler`, `notFound`, `asyncHandler` (auth middleware added with the Auth feature) |
| `services/` | Business logic / database queries (empty — added per feature) |
| `validators/` | Request validation schemas (empty — added per feature) |
| `utils/` | Shared utilities (`ApiError`) |
| `types/` | Shared TypeScript types |

## Setup Guide

### Prerequisites

- Node.js 20+
- A running MongoDB instance (local `mongod` on `mongodb://127.0.0.1:27017`, or a MongoDB Atlas connection string)

### Backend

```bash
cd backend
cp .env.example .env      # adjust MONGODB_URI / PORT / CLIENT_ORIGIN if needed
npm install
npm run dev                 # starts the API on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL should point at the backend above
npm install
npm run dev                   # starts the app on http://localhost:3000
```

### Environment Variables

**`backend/.env.example`**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/doctor_tracker
CLIENT_ORIGIN=http://localhost:3000
```

**`frontend/.env.example`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Verifying the Setup

1. Start the backend, then check `http://localhost:5000/api/health` directly (or `curl http://localhost:5000/api/health`) — it should return `{ "success": true, "message": "...", "db": "connected", ... }`. `db` should say `connected`, not `disconnected` — if it doesn't, MongoDB isn't reachable at the configured `MONGODB_URI`.
2. Start the frontend and open `http://localhost:3000` — the page calls the backend's `/health` endpoint through Redux Toolkit Query and renders the result live:
   - A green "Doctor Tracker API is running" line with `MongoDB: connected` means the whole chain (Next.js → Redux store → RTK Query → Express → MongoDB) is wired correctly.
   - A red "Could not reach the backend" message means the frontend can't reach the URL in `NEXT_PUBLIC_API_URL` — check the backend is running and the port/URL match.
3. `npm run typecheck` in `backend/` and `npm run build` in `frontend/` should both complete with no errors.

## Roadmap

This foundation will be extended feature by feature:

1. ~~Project setup and architecture~~ ✅
2. Authentication (JWT, protected routes)
3. Doctor management (CRUD, search, filter, pagination)
4. Patient management (CRUD, search, filter, pagination)
5. Dashboard and data visualization
6. Performance optimization, polish, and documentation
