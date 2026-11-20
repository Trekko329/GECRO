import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

const env = {
  GEOAPIFY_API_KEY: 'MOCK_KEY',
  ASSETS: {fetch: async request => new Response('<!doctype html><title>GECRO</title>', {headers:{'content-type':'text/html'}})},
};
test('serves home page from static asset binding', async () => {
  const r=await worker.fetch(new Request('https://example.workers.dev/'),env,{});
  assert.equal(r.status,200);
  assert.match(await r.text(),/GECRO/);
});
test('health reports key configured', async () => {
  const r=await worker.fetch(new Request('https://example.workers.dev/api/health'),env,{});
  assert.equal(r.status,200);
  assert.equal((await r.json()).status,'configured');
});
test('API route method and unknown route are rejected', async () => {
  let r=await worker.fetch(new Request('https://example.workers.dev/api/routes/matrix'),env,{});
  assert.equal(r.status,405);
  r=await worker.fetch(new Request('https://example.workers.dev/api/unknown'),env,{});
  assert.equal(r.status,404);
});
test('API route dispatch validates invalid points without reaching provider', async () => {
  const request=new Request('https://example.workers.dev/api/routes/matrix', {
    method:'POST',headers:{'content-type':'application/json','origin':'https://example.workers.dev'},
    body: JSON.stringify({points:[{lat:-38.1,lon:144.3}]})
  });
  const r=await worker.fetch(request,env,{});
  assert.equal(r.status,400);
});
