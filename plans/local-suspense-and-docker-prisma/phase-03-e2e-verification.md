# Phase 03 — End-to-End Verification & Regression Audit

**Phase ID:** `phase-03-e2e-verification`  
**Priority:** P1 (Covers spec stories: User Story 1, User Story 2, User Story 3)

## Objective
Verify end-to-end functionality across Frontend and Backend: ensure instant navigation with zero URL flashing, verify smooth local skeleton rendering, validate Cart Drawer interactions, and confirm healthy Docker container execution.

## Scope & Implementation Tasks
1. **Frontend Navigation Smoke Test**:
   - Test clicking Hero banner: verify instant transition to `/products` with no double-jump in URL.
   - Verify `/products` skeleton: title and filter pills remain stable while only product cards pulse.
   - Test Cart Drawer: verify clicking cart icon opens smoothly and closing it transitions out cleanly without hydration warnings.
2. **Next.js Production Build Validation**:
   - Run `npm run build` in `Gritmode_FE` to verify 0 errors across all 31 routes.
3. **Docker Container Health Check**:
   - Run `docker compose ps` in `Gritmode_BE` to ensure all 6 containers are healthy.
   - Run `docker compose exec backend node -e "import('./src/config/prisma.js').then(() => console.log('Prisma OK in container'))"` to verify Prisma in Docker.

## Files & Modules Affected
- `e:\Gritmode\Gritmode_FE\scripts\`
- `e:\Gritmode\Gritmode_BE\`

## Dependencies
- Requires Phase 01 and Phase 02 completed.

## Tests & Acceptance Criteria
- `npm run build` succeeds in < 3s with 0 errors.
- 0 hydration warnings or URL flickers in browser console.
- Docker containers all in `healthy` or `running` state.

## Risks & Notes
- Document all verified results and present final summary to user.
