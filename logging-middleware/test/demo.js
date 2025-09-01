import { createRemoteLogger } from '../src/index.js';

const token = process.env.EVAL_BEARER_TOKEN;
if (!token) {
  console.log('EVAL_BEARER_TOKEN not set. Use PowerShell:');
  console.log("$env:EVAL_BEARER_TOKEN='YOUR_ACCESS_TOKEN'; node test/demo.js");
  process.exit(0);
}

const logger = createRemoteLogger({ token, fireAndForget: false });

async function run() {
  console.log('Sending test log...');
  const resp = await logger.Log('backend','info','utils','demo log from test', { sample: true });
  console.log('Response', resp);
}
run();
