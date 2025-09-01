// Minimal smoke tests using native fetch (Node >=18)
import assert from 'assert';
import { spawn } from 'child_process';

const server = spawn('node', ['src/server.js'], { stdio: 'inherit', cwd: process.cwd() });

function wait(ms){return new Promise(r=>setTimeout(r,ms));}

(async () => {
  await wait(500);
  const createRes = await fetch('http://localhost:3000/shorturls', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.org', validity: 1 })
  });
  assert.equal(createRes.status, 201, 'Create should return 201');
  const created = await createRes.json();
  console.log('Created', created);
  const code = created.shortLink.split('/').pop();
  const statsRes = await fetch(`http://localhost:3000/shorturls/${code}`);
  assert.equal(statsRes.status, 200, 'Stats should return 200');
  const stats = await statsRes.json();
  console.log('Stats', stats);
  assert.equal(stats.shortcode, code);
  server.kill();
  console.log('All tests passed');
  process.exit(0);
})().catch(err => { console.error(err); server.kill(); process.exit(1); });
