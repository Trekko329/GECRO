# GECRO Driver v0.14A — Cloudflare Workers + Geoapify (staging)

This package adapts the existing GECRO v0.14A Cloudflare Pages Functions build to **Cloudflare Workers with Static Assets**. It preserves the existing v0.13-compatible client-side workflow and storage keys.

## Directory layout

```text
public/index.html               GECRO mobile website (static asset)
src/worker.js                   Worker router for API requests and assets
src/api/_shared.js             Validation and Geoapify request helpers
src/api/health.js              GET /api/health
src/api/addresses/resolve.js   POST /api/addresses/resolve
src/api/addresses/suggest.js   POST /api/addresses/suggest
src/api/routes/matrix.js       POST /api/routes/matrix
src/api/routes/geometry.js     POST /api/routes/geometry
wrangler.jsonc                 Worker deployment configuration
package.json                  Test and deployment commands
tests/                        Mocked API and Worker routing tests
```

**Do not upload `functions/` or `_routes.json` from the Pages version.** Workers does not use Pages Functions file-system routing here. hELO. 

## Important: protect existing GECRO

The `wrangler.jsonc` **name** is `gecro-v014a-test`, deliberately distinct from the existing production Worker. Deploy this as a **separate Worker** and leave the current live GECRO Worker on its existing production branch. Do not change the production branch of the existing Worker to `develop-v014a`.

1. On GitHub, select `develop-v014a` in `Trekko329/GECRO`.
2. Replace the root files with this ZIP's contents. GitHub's web uploader will not delete old files, so **delete the previous root `index.html`, `_routes.json`, and `functions/` directory** from the development branch. The only `index.html` should be `public/index.html`.
3. Commit the changes to `develop-v014a`; do not merge to `main`.
4. In Cloudflare **Workers & Pages**, create a **new Worker** named **`gecro-v014a-test`**, connect it to `Trekko329/GECRO`, and select production branch **`develop-v014a`** for this *test Worker only*.
5. Use Git root directory `/`, build command `npm install` (or leave blank if build system installs dependencies), and deploy command `npx wrangler deploy`. Make sure the project's name matches `wrangler.jsonc`.
6. In the **test Worker** Settings → Variables and Secrets, add a **Secret** named `GEOAPIFY_API_KEY`, set to the key from Geoapify. This secret must be configured on the Worker runtime; a build-time environment variable is not a substitute. Redeploy afterward if needed.
7. Confirm the test Worker's actual `workers.dev` URL in its Cloudflare dashboard. Visit `/api/health`. The response should include `"status":"configured"` and `"version":"0.14A"`.
8. Open the root test URL on your phone. Try *public business* test addresses, check GPS, route optimisation, map geometry, saved stops and recovery. Avoid private customer addresses until approved by your workplace.

If Cloudflare's Git onboarding UI does not offer the required branch selection, do **not** redirect the existing Worker. Instead deploy from a local clone with `npm install && npx wrangler deploy` using the credentials from your own Cloudflare account, then connect Git automation later. The Wrangler file controls the test Worker name. Wassup. 

## Local validation

```bash
npm install
npm test
npm run dev
```

Local live API calls require a `.dev.vars` file in the project root containing `GEOAPIFY_API_KEY=...`, which must stay untracked; do not share the file. **Never put the key in `public/index.html` or GitHub.**

## Endpoint contract

- `GET /api/health` → `{service, version, status, provider}`. A configured status checks that a secret exists, *not* that Geoapify is reachable.
- `POST /api/addresses/resolve` → `{address:string}` → `{candidates:[{lat,lon,label,...}]}`
- `POST /api/addresses/suggest` → `{address:string}` → `{candidates:[...]}` (the endpoint exists, but the full smart suggestion UI is planned for v0.14B).
- `POST /api/routes/matrix` → `{points:[{lat,lon},...]}` → `{durations:number[][]}` (null for unreachable legs)
- `POST /api/routes/geometry` → `{points:[{lat,lon},...]}` → `{geometry:GeoJSONGeometry}`

## Notes and limitations

- The test Worker has request validation, bounded waypoint counts and a same-origin check on browser requests, but **no driver authentication or server-enforced daily quota**. CORS and origin checks alone do not stop all unauthorised requests. Add Cloudflare Access/rate limiting before wider deployment.
- The Geoapify free plan has daily credit limitations; provider failures keep the last confirmed route displayed where supported.
- User data is currently saved in browser local storage. Do not use real customer addresses without approval.
- The frontend still targets a maximum of 15 stops. A broader 20-stop requirement needs separate performance/API testing.
- Frontend external Leaflet/OpenStreetMap assets still depend on network access; this is not an offline navigation app.
- The package was validated with Node mocked tests. No live Geoapify key or Cloudflare deployment was available during generation.

## Rollback

Leave the original production Worker and `main` branch unchanged. If the test deployment fails, revert commits only on `develop-v014a` or roll back the test Worker deployment. Do not switch the current working Worker to this branch until all regression tests pass.
