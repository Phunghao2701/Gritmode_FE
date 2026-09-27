# Phase 04 — Next.js Multi-Zones Setup & Domain Boundary

**Phase ID:** `phase-04-nextjs-multi-zones-setup`  
**Priority:** P1 (Covers spec story: [P1] Micro-Frontend Multi-Zones Foundation, [P2] Shared Auth & Cart Session, FR-05)

## Objective
Establish Next.js Multi-Zones architecture separating the customer-facing `storefront` application and the backoffice `admin` application, routing `/admin` requests via path-based rewrites while maintaining shared authentication and cart session via HTTP-only cookies.

## Scope & Tasks
1. **Multi-Zones Architecture & Routing**:
   - Configure `next.config.mjs` in the main zone to forward all `/admin` and `/admin/:path*` requests to the Admin zone (or port/basePath).
   - Ensure asset prefixes and static chunk paths do not collide between zones (e.g. `_next` assets routed correctly).
2. **Bundle Isolation**:
   - Verify that heavy admin libraries (data tables, rich text editors, admin charts) are isolated to the Admin zone and 100% excluded from the Storefront customer bundle.
3. **Session & Cookie Standardization**:
   - Ensure JWT access/refresh tokens and session state are accessible across zone boundaries via standard SameSite/HTTP-only cookies on the shared domain.
   - Verify that logging in on Storefront allows seamless authorized entry into `/admin` without forcing re-login.

## Files & Modules Affected
- `e:\Gritmode\Gritmode_FE\next.config.mjs`
- `e:\Gritmode\Gritmode_FE\src\features\auth\services\token.service.js`
- `e:\Gritmode\Gritmode_FE\src\app\admin\`

## Dependencies
- Builds on Phase 02 (Clean layout separation).

## Tests & Acceptance Criteria
- Navigating to `/admin` routes correctly to the admin dashboard.
- Storefront bundle inspection confirms zero admin dependencies in `/` and `/products` pages.
- Logged-in admin user transitioning from Storefront to `/admin` retains authenticated session.
- Non-admin user accessing `/admin` is cleanly redirected to login/forbidden page.

## Risks & Notes
- In local development, ensure proxy/rewrites correctly forward WebSocket/HMR (Hot Module Replacement) connections.
