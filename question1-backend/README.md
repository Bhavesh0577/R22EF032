# URL Shortener Microservice

Implements required endpoints:

POST /shorturls -> create short link
GET /shorturls/:code -> statistics
GET /:code -> redirect

Defaults validity to 30 minutes. Supports optional custom shortcode. In-memory storage. Logs to logs/app.log using custom logging middleware.

## Run

Install deps then start:

```
npm install
npm run dev
```

Set HOST and PORT via env if needed (HOST should not have trailing slash). Default HOST=http://localhost PORT=3000.

## Example Create
```
POST http://localhost:3000/shorturls
{ "url": "https://example.com/very/long", "validity": 45 }
```
Response 201:
```
{ "shortLink": "http://localhost:3000/AbC123x", "expiry": "2025-01-01T00:30:00.000Z" }
```
