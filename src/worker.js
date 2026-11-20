import {onRequestGet as health} from './api/health.js';
import {onRequestPost as resolve} from './api/addresses/resolve.js';
import {onRequestPost as suggest} from './api/addresses/suggest.js';
import {onRequestPost as matrix} from './api/routes/matrix.js';
import {onRequestPost as geometry} from './api/routes/geometry.js';
import {reply} from './api/_shared.js';

// Keep static GECRO assets separate from the four protected-key Geoapify endpoints.
const endpoints = new Map([
  ['GET /api/health', health],
  ['POST /api/addresses/resolve', resolve],
  ['POST /api/addresses/suggest', suggest],
  ['POST /api/routes/matrix', matrix],
  ['POST /api/routes/geometry', geometry],
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      const route = `${request.method} ${url.pathname}`;
      const handler = endpoints.get(route);
      if (!handler) {
        const known = [...endpoints.keys()].some(v => v.endsWith(` ${url.pathname}`));
        return reply({error: known ? 'Method not allowed' : 'API endpoint not found'}, known ? 405 : 404);
      }
      try { return await handler({request, env, ctx}); }
      catch (_) { return reply({error:'Internal routing service error'},500); }
    }
    return env.ASSETS.fetch(request);
  },
};
