# URL Shortener Frontend

Runs on http://localhost:3000 using Vite + React + MUI.

Pages:

- Shorten URLs (up to 5 at once) with validity + optional shortcode.
- Statistics page shows stored shortcodes with click analytics.

Local storage keeps list of created shortcodes for stats view.

Logging: Uses logging-middleware package (frontend mode) – replace token or adapt if backend expects remote logging; currently set to a placeholder.

Dev:

```
npm install
npm run dev
```
