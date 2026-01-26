# Navigation dropdown smoke test instructions

Run the following commands:

```
pnpm install
pnpm exec playwright install --with-deps
pnpm run build
pnpm run dev &
ISA_BASE_URL=http://localhost:5173 pnpm run test:nav
```

Notes:
- Adjust `ISA_BASE_URL` if the dev server is on a different port.
- Stop the dev server when finished.
