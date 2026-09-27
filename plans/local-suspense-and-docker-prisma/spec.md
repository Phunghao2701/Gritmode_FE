# Specification: Local Suspense Loading, Seamless Navigation & Docker Prisma Integration

## 1. Overview
Enhance page transition UX for the `/products` route by refining the instant loading skeleton to isolate changes to the product grid, eliminating URL parameter flashing, and properly wiring Prisma into the backend Docker development environment.

---

## 2. User Stories & Acceptance Criteria

### User Story 1 (P1 — Local Suspense & Skeleton Refinement)
**As a** customer browsing streetwear,  
**I want** navigating between Home and `/products` to feel seamless and stable,  
**So that** the page header, title, and filter pills stay pinned while only the product cards pulse with a loading skeleton.
- **AC 1.1**: Navigating to `/products` displays an instant skeleton that precisely matches the real layout's padding, breadcrumbs, title, and filter pills.
- **AC 1.2**: Zero layout shift (CLS = 0) occurs when the SSR product cards replace the skeleton.

### User Story 2 (P1 — Zero URL Navigation Flashing)
**As a** user clicking the Hero banner on the homepage,  
**I want** to navigate directly to `/products` without the address bar flickering or jumping,  
**So that** the browser history stays clean and navigation feels instantaneous.
- **AC 2.1**: Clicking the Hero banner navigates directly to `/products` (no `?sort=newest` query param appended).
- **AC 2.2**: `ProductListPage` mount does not invoke `router.replace` unless the user explicitly toggles a filter or pagination.

### User Story 3 (P2 — Dockerized Prisma Engine)
**As a** developer running `docker compose up -d`,  
**I want** Prisma schema and client engine to be fully available inside the `gritmode-be` container,  
**So that** backend services can execute Prisma queries inside Docker without missing-client or missing-engine errors.
- **AC 3.1**: `docker-compose.yml` mounts `./prisma:/app/prisma` in the backend service.
- **AC 3.2**: `Dockerfile.dev` runs `npx prisma generate` generating the Alpine Linux-compatible query engine.
- **AC 3.3**: Backend container starts up healthy with Prisma Client ready.

---

## 3. Measurable Success Metrics
- **Interaction to Next Paint (INP)**: < 50ms upon clicking navigation links.
- **Address Bar Transitions**: Exactly 1 transition event per click (0 intermediate redirects or `replaceState` calls).
- **Container Health**: `docker compose ps` shows `gritmode-be` in `running` state with 0 Prisma engine errors.
