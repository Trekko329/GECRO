# GECRO Driver v0.14A — Cloudflare Pages + Geoapify staging

This package is a **staging prototype**. It replaces the direct Nominatim and public OSRM requests in v0.13 with same-origin Cloudflare Pages Functions that call Geoapify. The v0.13 phone workflow and existing local-storage keys are preserved.

**Do not use private customer delivery addresses until company permission and access controls are in place.** The preview website/API must not be open to the public: protecting a secret on the server does not stop others from consuming API credits through the API endpoints.

## Files

- `index.html` — existing GECRO mobile app, adapted to `/api/...`
- `functions/api/addresses/resolve.js` — address geocoding (up to five candidates, with the existing first-result verification flow)
- `functions/api/addresses/suggest.js` — address suggestion endpoint (available for v0.14B; no new suggestion UI yet)
- `functions/api/routes/matrix.js` — driving-time matrix
- `functions/api/routes/geometry.js` — ordered road route geometry
- `functions/api/health.js` — backend configuration status
- `_routes.json` — only `/api/*` invokes Pages Functions
- `.gitignore` — prevents accidentally uploading local API keys
- `tests/api.test.mjs` — mocked provider regression tests (`npm test`)

## Setup (GitHub + Cloudflare Pages)

1. **Keep the working `main` branch unchanged.** Make a new branch called `develop-v014a` in your GitHub `gecro-driver` repository.
2. Upload **all the files/folders from inside this ZIP** to the root of that branch, preserving the `functions/api/...` paths. Uploading only `index.html` will NOT work: the Cloudflare Functions files are required.
3. In Cloudflare Pages, open your existing `gecro-driver` project. Confirm Git integration is enabled and preview deployments are available for branches other than `main`.
4. Under **Settings → Variables and Secrets**, add `GEOAPIFY_API_KEY` as a **Secret** in the **Preview** environment. Paste the Geoapify project key there; never send it in chat or commit it to GitHub. Redeploy the preview after adding the secret.
5. Under Pages project settings use **Framework: None**, **Build command: blank**, **Build output directory: `.`** (repository root).
6. **Secure the preview before calling the APIs.** Set up Cloudflare Zero Trust Access or an equivalent policy that permits only your identity to access the preview *and* `/api/*`. Apply access protection to the preview hostname. Simply hiding the API key, Origin checks, and a private GitHub repo are NOT authentication. Cloudflare plan/capability limits may vary; check the current settings.
7. Once the preview deploys, open `https://<your-preview-host>/api/health` while signed in. You should see `"status":"configured"`. If it reports `missing_api_key`, set the secret in the correct environment and redeploy.
8. Test with **public business addresses only**. Check GPS, Paste & Add, review of new addresses, optimised route, map, completion/reopening, drag reordering, priority, Undo, refresh persistence and adding a stop during the route.
9. Do NOT merge into `main` until the full work-phone test suite succeeds. If a test fails, return to your unchanged v0.13 URL.

## Limitations of v0.14A

- Current production-scale capabilities are **not implemented**: server-enforced per-user quotas, authenticated driver identities, audit/monitoring, retention controls, SLA, automated live end-to-end tests, and full 20-stop route optimisation.
- The v0.13 route limit is still **15** outstanding stops; v0.14A intentionally avoids changing route optimisation while migrating providers.
- Existing confirmed coordinates and geocoding caches remain in browser storage and may have been obtained through the previous providers. Editing an address invalidates that address's approval.
- Address candidates from `/api/addresses/suggest` can be retrieved, but the multi-choice typo-correction interface is slated for **v0.14B**. v0.14A still presents the leading geocode match for human review.
- Routing estimates don't include live traffic, unload times or delivery deadlines. The 13–15-stop optimiser remains heuristic.
- The Geoapify free tier has limited credits and does not guarantee fleet-scale availability. A Geoapify API key is needed for live server calls.
- This build does not include a dedicated access-control configuration: configure Cloudflare Access before making the preview available.

## Tests

```bash
npm test
```

All tests mock Geoapify responses. They do not spend API credits or demonstrate live routing accuracy. See the official Cloudflare Pages Functions and Geoapify Route Matrix/Routing documentation before operating beyond a test pilot.
