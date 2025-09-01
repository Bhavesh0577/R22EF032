# Logging Middleware Package

Reusable remote logging utility per evaluation spec.

## Install

```
npm install
```

## Environment

Set `EVAL_BEARER_TOKEN` to the access_token you received (without the word Bearer). Keep it secret.

## API

`createRemoteLogger(options)` returns logger instance.
Options:
- token: bearer token (default from env EVAL_BEARER_TOKEN)
- defaultStack: default 'backend'
- defaultPackage: default 'middleware'
- timeoutMs: request timeout
- fireAndForget: if true (default) do not await network

Methods:
- `Log(stack, level, package, message, meta?)`
- Level helpers: `debug/info/warn/error/fatal(pkg, message, meta?)`
- `expressMiddleware()` returns Express middleware for request logging

## Usage Example

```js
import { getLogger } from 'logging-middleware';
const logger = getLogger(); // requires EVAL_BEARER_TOKEN env
logger.info('service', 'service starting');
```

Express:
```js
import express from 'express';
import { createRemoteLogger } from 'logging-middleware';
const logger = createRemoteLogger({ token: process.env.EVAL_BEARER_TOKEN });
const app = express();
app.use(logger.expressMiddleware());
```

## Notes
- Valid field values enforced; invalid usage prints local stderr warning.
- Meta object is JSON stringified and truncated to 2000 chars.
- Replace this simple fetch logic with batching/retry for production.
