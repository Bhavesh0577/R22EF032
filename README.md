# URL Shortener Monorepo

This repository contains three related packages:

1. `logging-middleware` – a small remote logging helper (stand‑alone npm style package)
2. `question1-backend` – an Express URL shortener API with in‑memory storage and JSON logging
3. `question2-frontend` – a React + Vite UI to create short URLs and view statistics

## 1. logging-middleware

Lightweight helper to send structured logs to a remote evaluation endpoint.

### Features

- Dynamic import / fallback to built‑in `fetch`
- Field validation for stack / level / package
- Optional express middleware helper
- Fire‑and‑forget or awaited logging
- Optional token decoding (debug)

### Usage

```js
import { createRemoteLogger } from "logging-middleware";
const logger = createRemoteLogger({ token: process.env.EVAL_BEARER_TOKEN });
logger.info("middleware", "app.start");
```

Run demo:

```powershell
$env:EVAL_BEARER_TOKEN = 'YOUR_TOKEN'
node logging-middleware/test/demo.js
```

## 2. question1-backend (URL Shortener API)

Express server providing endpoints to create and resolve short URLs, plus statistics.
Data is stored in memory (Map) – restarting the server clears data.

### Endpoints

| Method | Path               | Body                                                      | Description                                                                                              |
| ------ | ------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| POST   | `/shorturls`       | `{ url: string, validity?: minutes, shortcode?: string }` | Create a short URL. `validity` minutes (default 30, max 1440). Optional custom `shortcode` (3–30 chars). |
| GET    | `/shorturls/:code` | –                                                         | Get stats + click details for a shortcode.                                                               |
| GET    | `/:code`           | –                                                         | Redirect to original URL (302) and record click (referer, ip, geo).                                      |

### Response Samples

Create success (201):

```json
{
  "shortLink": "http://localhost:3000/abc1234",
  "expiry": "2025-09-01T12:34:00.000Z"
}
```

Stats (200):

```json
{
  "shortcode": "abc1234",
  "originalUrl": "https://example.org",
  "createdAt": "2025-09-01T12:00:00.000Z",
  "expiry": "2025-09-01T12:30:00.000Z",
  "expired": false,
  "totalClicks": 1,
  "clicks": [
    {
      "ts": "2025-09-01T12:05:00.000Z",
      "referer": null,
      "ip": "::1",
      "geo": null
    }
  ]
}
```

### Local Development

```powershell
cd question1-backend
npm install
npm run dev
```

By default serves on `http://localhost:3000` (PORT env variable to change). Frontend expects API on `http://localhost:3001`; to align, start backend with `PORT=3001`:

```powershell
$env:PORT=3001; npm run dev
```

### Logging

Structured JSON lines at `question1-backend/logs/app.log` via custom logger & middleware.

### Tests

```powershell
cd question1-backend
npm test
```

## 3. question2-frontend (React UI)

Vite + React + MUI interface to create up to 5 URLs at once and view stored shortcode statistics.
Shortcodes you create are cached in `localStorage` and displayed under the Statistics tab.

### Run Dev Server

```powershell
cd question2-frontend
npm install
npm run dev
```

Serves on `http://localhost:3000` by default. Ensure backend runs on `http://localhost:3001` (see note above) or adjust `backendBase` in `ShortenerPage.tsx`.

### Build

```powershell
npm run build
npm run preview
```

## Workspace Setup (fresh clone)

```powershell
git clone <repo-url>
cd R22EF032
# Install each package (can be sequential)
cd logging-middleware; npm install; cd ..
cd question1-backend; npm install; cd ..
cd question2-frontend; npm install; cd ..
```

## Environment Variables

Backend:

- `PORT` (default 3000)
- `HOST` (default `http://localhost`)

Logging middleware demo:

- `EVAL_BEARER_TOKEN` – required for remote logging.

Frontend currently hardcodes a dummy token `'frontend-local'` for local logging (adjust in code if needed).

## Development Notes

- URL data is volatile – add persistence for production.
- Rate limiting / auth not implemented.
- IP geo lookup uses `geoip-lite`; accuracy depends on DB snapshot.
- Logging middleware library validates enumerated fields to prevent bad payloads.

## Common NPM Scripts Summary

| Location           | Script          | Purpose                    |
| ------------------ | --------------- | -------------------------- |
| logging-middleware | `npm test`      | Send a demo remote log     |
| question1-backend  | `npm run dev`   | Start server in watch mode |
| question1-backend  | `npm test`      | Smoke test API endpoints   |
| question2-frontend | `npm run dev`   | Start React dev server     |
| question2-frontend | `npm run build` | Production build           |

## Ignore / Git Hygiene

Each package should ignore its own `node_modules` and `.env`. If previously committed, remove from git index (`git rm -r --cached <path>`). Top-level `.gitignore` can be expanded if monorepo grows.

## Future Improvements

- Persist URL + click data (e.g., SQLite / Postgres)
- Add pagination for stats clicks
- Add rate limiting & API keys
- CI workflow (lint + test) via GitHub Actions
- Convert logging middleware to TypeScript with type declarations

---

Feel free to open issues or extend functionality.
