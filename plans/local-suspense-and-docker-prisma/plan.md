# Plan: Local Suspense Loading, Seamless Navigation & Docker Prisma Integration

Mode: --hard  
Risk: normal — Touches Docker dev environment (compose & Dockerfile) and Next.js instant loading & page navigation components.

## Overview
This plan implements the architectural refinements brainstormed with the user:
1. **Frontend**: Streamlines page transition to `/products` with an authentic streetwear local skeleton (static title/filters + pulsing product cards), and eliminates double URL redirects from the homepage.
2. **Backend**: Wires Prisma into the Docker development environment by mounting `./prisma` volume and building Alpine Linux-compatible Prisma Client query engines.

## Phase Index
- [x] [phase-01-clean-navigation-local-loading.md](./phase-01-clean-navigation-local-loading.md) — Clean URL navigation & Local Skeleton UI (zero layout shift)
- [x] [phase-02-docker-prisma-integration.md](./phase-02-docker-prisma-integration.md) — Dockerized Prisma volume mount & client engine generation
- [x] [phase-03-e2e-verification.md](./phase-03-e2e-verification.md) — End-to-end smoke verification & regression audit

## Risks & Mitigations
1. **Docker Container Build Overhead**: Rebuilding backend container might take ~1-2 minutes depending on network and cache.
   - *Mitigation*: Leverage Docker build layer caching (`package*.json` before `prisma generate`).
2. **Layout Shift during Skeleton Replacement**: If skeleton dimensions differ from real product cards, a noticeable jump occurs.
   - *Mitigation*: Mirror the exact grid classes (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6`) and card aspect ratio (`aspect-[3/4]`) between `loading.jsx` and `ProductCard.jsx`.

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-27 20:03
**Phase in progress:** None (All 3 phases completed)
**Status:** Completed all 3 phases! Clean Navigation without URL flicker, Local Skeleton UI (zero layout shift), and Dockerized Prisma Integration are fully implemented, verified, and passing 100%.

### Decisions made this session
- Updated Hero banner navigation to `/products` without appending `?sort=newest`.
- Prevented redundant router.replace on mount in ProductListPage.jsx.
- Refined products/loading.jsx: Title and category tabs are static; only product card grid pulses with shimmer.
- Mounted `./prisma:/app/prisma` in `docker-compose.yml` under `backend` service.
- Updated `Dockerfile.dev` with `RUN npx prisma generate` and installed `openssl`.
- Tested Prisma inside container: `npx prisma validate` succeeded and `prisma.product.count()` returned 10.
- All 6 containers running and healthy. Production build succeeded in 1.1s.

### Next immediate action
Final review gate and report delivery to user.
