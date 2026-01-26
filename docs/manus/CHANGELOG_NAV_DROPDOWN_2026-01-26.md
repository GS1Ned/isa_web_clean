# Navigation dropdown stabilization (2026-01-26)

## Problem description
- Desktop dropdowns closed when moving the pointer from the top-level trigger into the submenu.
- Mobile was unaffected because touch does not rely on hover persistence.

## Root cause
- Hover handling used mouseenter/mouseleave while the submenu was positioned with a vertical gap.
- The pointer left the hover region during the gap, closing the menu before a submenu click.

## Exact changes made
- Replaced mouse enter/leave with pointer enter/leave on a wrapper containing trigger + menu.
- Added a short close delay (120ms) to avoid flicker on fast pointer movement.
- Removed the hover gap by positioning the dropdown at `top-full`.
- Added click-outside close via document-level `pointerdown` (capture phase).
- Closed dropdown on submenu click.
- Added aria-haspopup/aria-expanded and keyboard open (Enter/Space/ArrowDown).
- Added a Playwright smoke test for hover persistence and submenu click navigation.

## Files changed
- `client/src/components/NavigationMenu.tsx`
- `scripts/test-nav-dropdown.mjs`
- `package.json`
- `DEPLOYMENT.md`
- `docs/manus/CHANGELOG_NAV_DROPDOWN_2026-01-26.md`
- `docs/manus/TEST_INSTRUCTIONS_NAV_DROPDOWN.md`

## How Manus should verify
- Manual: Hover “Explore” on desktop, move into submenu, click “ESG Hub”; menu stays open until click.
- Automated: Run the smoke test in `docs/manus/TEST_INSTRUCTIONS_NAV_DROPDOWN.md`.
