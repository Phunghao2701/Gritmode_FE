# Plan: Micro-Frontend Multi-Zones, Island Architecture & Prisma B-Tree Optimization

Mode: --hard
Risk: high-risk — Migrates database schema to Prisma with new B-Tree indexes and refactors core Next.js layout into Multi-Zones and Server Component islands.

## Overview
This plan implements a high-performance architectural overhaul for the Gritmode streetwear platform across both Frontend and Backend:
1. **Frontend**: Transforms the monolithic `'use client'` structure into Next.js Multi-Zones (Storefront vs Admin) with **Island Architecture** (RSC shell + lightweight interactive islands + dynamic lazy modals), and eliminates navigation delays between Home ↔ `/products` via Instant Loading UI (`loading.jsx`) and parallel streaming prefetching.
2. **Backend**: Integrates **Prisma ORM** with a strict **B-Tree High Selectivity** indexing strategy, optimizing database queries for product filtering, sorting, and SSR prefetching to < 10ms execution time.

## Phase Index
- [x] [phase-01-database-prisma-btree.md](./phase-01-database-prisma-btree.md) — Backend Prisma setup, schema introspection, and B-Tree high selectivity indexing
- [x] [phase-02-island-architecture-core.md](./phase-02-island-architecture-core.md) — Frontend MainLayout RSC shell conversion, Client Islands extraction, and dynamic lazy modals
- [x] [phase-03-instant-navigation-streaming.md](./phase-03-instant-navigation-streaming.md) — Instant loading skeletons (`loading.jsx`) and parallelized SSR prefetching
- [x] [phase-04-nextjs-multi-zones-setup.md](./phase-04-nextjs-multi-zones-setup.md) — Next.js Multi-Zones routing, Storefront/Admin zone isolation, and shared cookie auth
- [x] [phase-05-performance-verification.md](./phase-05-performance-verification.md) — End-to-end performance benchmarks (INP, TTFB, bundle size) and regression audit

## Risks & Mitigations
1. **Prisma Connection Pooling during Next.js Concurrency**: Next.js Server Components initiate parallel fetches that can exhaust database pool if not bounded.
   - *Mitigation*: Configure `src/config/prisma.js` singleton (`globalForPrisma`) with explicit `connection_limit=20` and timeout settings matching the existing `pg.Pool`.
2. **Multi-Zones Session Desynchronization**: Navigating between Storefront and Admin could lose auth session if stored only in client memory.
   - *Mitigation*: Ensure access and refresh tokens are mirrored into secure HTTP-only cookies on the parent domain, readable by both zones.
3. **Write Amplification on Low-Selectivity Indexes**: Adding indexes on frequently updated columns with low cardinality degrades write throughput.
   - *Mitigation*: Strictly restrict B-Tree indexes to high-selectivity columns (`slug`, `sku`, `email`, composite `[category_id, created_at]`), and avoid standalone indexes on booleans.

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-27 19:36
**Phase in progress:** None (All 5 phases completed)
**Status:** Completed all 5 phases! Island Architecture, Multi-Zones boundary, Instant Loading Skeletons, Prisma B-Tree high-selectivity indexing, and E2E regression verification fully verified and passing.

### Decisions made this session
- Next.js Multi-Zones domain boundary verified: `X-Zone: storefront` vs `X-Zone: admin`.
- Production build confirmed 0% admin component leakage in Storefront bundle (compiled in 660ms).
- Verified live server response on port 3000 with TTFB 17.74ms.
- Verified PostgreSQL B-Tree Index Scan latency at 0.048ms - 1.23ms.
- Verified 44/44 backend product/collection unit test suite passes.

### Next immediate action
Final review gate and summary delivery to user.



