# Deployment

## Local build steps
1) Install dependencies: `pnpm install`
2) Build client + server: `pnpm run build`

## Dropdown smoke test
1) Start dev server: `pnpm run dev`
2) Run: `pnpm run test:nav`
   - Optional: `ISA_BASE_URL=http://localhost:5173 pnpm run test:nav`

## External deployment note
- Deployment is handled outside this repo (e.g., Manus UI rebuild/deploy).
- This repository produces code and build artifacts only; triggering deploys happens externally.
