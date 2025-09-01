import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const LOG_DIR = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, 'app.log');

function writeLog(entry) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), ...entry }) + '\n';
  fs.appendFile(LOG_FILE, line, err => {
    if (err) {

      process.stderr.write('Failed to write log: ' + err.message + '\n');
    }
  });
}

export const logger = {
  info: (msg, meta={}) => writeLog({ level: 'INFO', msg, ...meta }),
  warn: (msg, meta={}) => writeLog({ level: 'WARN', msg, ...meta }),
  error: (msg, meta={}) => writeLog({ level: 'ERROR', msg, ...meta }),
  debug: (msg, meta={}) => writeLog({ level: 'DEBUG', msg, ...meta })
};

export function loggingMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  const { method, originalUrl } = req;
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  let bodyStr;
  try { bodyStr = JSON.stringify(req.body); } catch { bodyStr = '[unstringifiable]'; }

  logger.info('request.received', { requestId, method, url: originalUrl, body: bodyStr, ip: req.ip });

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info('response.sent', { requestId, method, url: originalUrl, status: res.statusCode, durationMs: durationMs.toFixed(2) });
  });
  next();
}

export function logError(err, req) {
  logger.error('error', { requestId: req?.requestId, message: err.message, stack: err.stack });
}
