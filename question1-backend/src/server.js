import 'dotenv/config';
import express from 'express';
import { nanoid } from 'nanoid';
import geoip from 'geoip-lite';
import { loggingMiddleware, logError, logger } from './logging/logger.js';
import cors from 'cors';
import { createShortUrlSchema } from './validation.js';
import { urls, createRecord, recordClick } from './store.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(loggingMiddleware);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'http://localhost';

function buildShortLink(shortcode) {
  return `${HOST}:${PORT}/${shortcode}`;
}

function generateUniqueCode() {
  let code;
  do { code = nanoid(7); } while (urls.has(code));
  return code;
}

function isExpired(rec) {
  return rec.expiry.getTime() < Date.now();
}


app.post('/shorturls', (req, res) => {
  try {
    const parsed = createShortUrlSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn('create.invalid_input', { issues: parsed.error.issues });
      return res.status(400).json({ error: 'INVALID_INPUT', details: parsed.error.issues });
    }
    const { url, validity, shortcode } = parsed.data;
    const validityMinutes = validity ?? 30;

    let finalCode = shortcode || generateUniqueCode();
    if (shortcode) {
      if (urls.has(shortcode)) {
        logger.warn('create.shortcode_conflict', { shortcode });
        return res.status(409).json({ error: 'SHORTCODE_IN_USE' });
      }
      finalCode = shortcode;
    } else {
      finalCode = generateUniqueCode();
    }

    const rec = createRecord(finalCode, url, validityMinutes);
    logger.info('create.success', { shortcode: finalCode, validityMinutes });
    return res.status(201).json({ shortLink: buildShortLink(finalCode), expiry: rec.expiry.toISOString() });
  } catch (err) {
    logError(err, req);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});


app.get('/shorturls/:code', (req, res) => {
  try {
    const code = req.params.code;
    const rec = urls.get(code);
  if (!rec) return res.status(404).json({ error: 'NOT_FOUND' });
  const expired = isExpired(rec);
  if (expired) logger.info('stats.expired', { code });
    return res.json({
      shortcode: rec.shortcode,
      originalUrl: rec.originalUrl,
      createdAt: rec.createdAt.toISOString(),
      expiry: rec.expiry.toISOString(),
      expired,
      totalClicks: rec.clicks.length,
      clicks: rec.clicks.map(c => ({ ts: c.ts, referer: c.referer, ip: c.ip, geo: c.geo }))
    });
  } catch (err) {
  logError(err, req);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});


app.get('/:code', (req, res) => {
  try {
    const code = req.params.code;
    const rec = urls.get(code);
  if (!rec) return res.status(404).json({ error: 'NOT_FOUND' });
  if (isExpired(rec)) return res.status(410).json({ error: 'EXPIRED' });


    const referer = req.get('referer') || null;
    const ip = req.ip || req.connection?.remoteAddress;
    let geo = null;
    try { geo = geoip.lookup(ip)?.country || null; } catch { geo = null; }
  recordClick(code, { ts: new Date().toISOString(), referer, ip, geo });

    return res.redirect(302, rec.originalUrl);
  } catch (err) {
  logError(err, req);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});


app.use((req, res) => res.status(404).json({ error: 'ROUTE_NOT_FOUND' }));


app.use((err, req, res, next) => { 
  logError(err, req);
  res.status(500).json({ error: 'INTERNAL_ERROR' });
});

app.listen(PORT, () => {
  logger.info('server.started', { port: PORT });
});
