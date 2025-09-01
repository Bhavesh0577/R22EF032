// Simple in-memory store. For production replace with persistent DB.
export const urls = new Map(); // shortcode -> { originalUrl, createdAt, expiry, clicks: [] }

export function createRecord(shortcode, originalUrl, validityMinutes) {
  const now = new Date();
  const expiry = new Date(now.getTime() + validityMinutes * 60 * 1000);
  const record = {
    shortcode,
    originalUrl,
    createdAt: now,
    expiry,
    clicks: [] // { ts, referer, ip, geo }
  };
  urls.set(shortcode, record);
  return record;
}

export function recordClick(shortcode, data) {
  const rec = urls.get(shortcode);
  if (!rec) return;
  rec.clicks.push(data);
}
