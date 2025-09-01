// Reusable logging package that pushes logs to external evaluation service
// Public API: Log(stack, level, pkg, message, meta?) and express middleware factory
// The token must be supplied via environment variable EVAL_BEARER_TOKEN (only access_token string) or passed into createLogger

// Use global fetch in browsers; in Node fallback to dynamic import of node-fetch
let fetchFn = (typeof fetch !== 'undefined') ? fetch : null;
async function ensureFetch() {
  if (!fetchFn) {
    const mod = await import('node-fetch');
    fetchFn = mod.default;
  }
  return fetchFn;
}

const VALID_STACK = new Set(['backend', 'frontend']);
const VALID_LEVEL = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const VALID_PACKAGE = new Set([
  // frontend-only
  'component','hook','page','state','style',
  // shared
  'auth','config','middleware','utils',
  // backend-only
  'cache','controller','cron_job','db','domain','handler','repository','route','service'
]);

const LOG_ENDPOINT = 'http://20.244.56.144/evaluation-service/logs';

export function createRemoteLogger(options = {}) {
  const {
    token = process.env.EVAL_BEARER_TOKEN,
    defaultStack = 'backend',
    defaultPackage = 'middleware',
    timeoutMs = 3000,
  fireAndForget = true,
  allowMeta = false,
  debugToken = false
  } = options;

  if (!token) {
    throw new Error('Remote logger token missing: set EVAL_BEARER_TOKEN');
  }

  async function send(payload) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
  const f = await ensureFetch();
  const res = await f(LOG_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      clearTimeout(t);
      if (!res.ok) {
        const text = await res.text().catch(()=> '');
        throw new Error(`Log API failed ${res.status}: ${text}`);
      }
      return res.json().catch(()=>({}));
    } catch (err) {
      // Last resort local stderr (allowed inside library)
      process.stderr.write('[remote-logger] ' + err.message + '\n');
      return null;
    }
  }

  function validateField(set, value, field) {
    if (!set.has(value)) throw new Error(`Invalid ${field}: ${value}`);
  }

  function Log(stack, level, pkg, message, meta) {
    try {
      stack = stack || defaultStack;
      pkg = pkg || defaultPackage;
      validateField(VALID_STACK, stack, 'stack');
      validateField(VALID_LEVEL, level, 'level');
      validateField(VALID_PACKAGE, pkg, 'package');
      if (typeof message !== 'string' || !message) throw new Error('message required');
      const payload = { stack, level, package: pkg, message };
      if (allowMeta && meta) {
        // Attach serialized meta ONLY if explicitly enabled to avoid server rejection
        payload.meta = JSON.stringify(meta).slice(0, 2000);
      }
      if (fireAndForget) {
        send(payload); // no await
        return;
      } else {
        return send(payload);
      }
    } catch (err) {
      process.stderr.write('[remote-logger-validation] ' + err.message + '\n');
    }
  }

  // Convenience level helpers
  let decoded = null;
  if (debugToken) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        decoded = { exp: payload.exp, now: Math.floor(Date.now()/1000), expiresInSec: payload.exp ? (payload.exp - Math.floor(Date.now()/1000)) : null };
      }
    } catch { /* ignore */ }
  }

  const api = {
    Log,
    debug: (pkg, message, meta) => Log(defaultStack, 'debug', pkg, message, meta),
    info: (pkg, message, meta) => Log(defaultStack, 'info', pkg, message, meta),
    warn: (pkg, message, meta) => Log(defaultStack, 'warn', pkg, message, meta),
    error: (pkg, message, meta) => Log(defaultStack, 'error', pkg, message, meta),
    fatal: (pkg, message, meta) => Log(defaultStack, 'fatal', pkg, message, meta),
    expressMiddleware: () => (req, res, next) => {
      const start = Date.now();
      api.info('middleware', 'request.start', { method: req.method, path: req.originalUrl });
      res.on('finish', () => {
        const durationMs = Date.now() - start;
        api.info('middleware', 'request.finish', { status: res.statusCode, durationMs });
      });
      next();
    },
    _tokenDebug: decoded
  };
  return api;
}

// Default singleton using env token if present
let defaultLoggerInstance = null;
export function getLogger() {
  if (!defaultLoggerInstance) {
    defaultLoggerInstance = createRemoteLogger({});
  }
  return defaultLoggerInstance;
}
