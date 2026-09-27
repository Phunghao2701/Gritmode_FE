# Spec: Micro-Frontend Multi-Zones, Island Architecture & Prisma B-Tree Optimization

**Date:** 2026-09-27  
**Status:** Ready

## Problem Statement
The current Gritmode frontend uses a monolithic `'use client'` architecture where `MainLayout` (1,152 lines) and primary pages hydrate as single massive client trees, leading to notable hydration delays, UI freeze during route transitions (e.g. Home ↔ `/products`), and shared bundle bloat between customer-facing storefront and admin backoffice. Additionally, backend queries for product filtering and SSR prefetching lack systematic B-Tree selectivity indexing and type-safe ORM schema management, causing avoidable TTFB latencies.

## User Stories
- **[P1] Instant Route Transitions**: As a customer navigating between Home and `/products`, I want the page to transition instantaneously with an immediate visual skeleton (`loading.jsx`) and streaming data, so that I experience zero click delay.
  - *Accepted when*: Navigating between `/` and `/products` shows immediate feedback (< 100ms) with zero interaction freeze, and LCP/INP metrics remain in the "Good" range.
- **[P1] Island Architecture & Zero-Delay Interactions**: As a customer, I want interactive elements (search trigger, cart pill, filter tabs, hero swiper) to respond immediately on click without waiting for heavy modals or admin scripts to hydrate.
  - *Accepted when*: `MainLayout` and static headers/footers render as React Server Components (0kb client JS); `SearchModal` and `CartDrawer` are dynamically loaded only upon user click via `next/dynamic({ ssr: false })`.
- **[P1] Micro-Frontend Multi-Zones Foundation**: As an engineering team, we want `storefront` and `admin` separated into distinct Next.js zones with independent bundles and deploy boundaries, so admin dependencies never leak into the customer storefront.
  - *Accepted when*: Public routes (`/`, `/products`, `/collections`) and Admin routes (`/admin/*`) run under independent Next.js application zones coordinated via Next.js Multi-Zones rewrites or reverse proxy.
- **[P1] Prisma Schema & High-Selectivity B-Tree Indexing**: As a backend developer, I want all core database models managed via `schema.prisma` with B-Tree indexes strictly assigned to high-selectivity columns and composite sort queries, so that product queries complete in < 10ms.
  - *Accepted when*: `schema.prisma` is established, B-Tree composite indexes `[category_id, created_at(sort: Desc)]` and unique indexes on `slug` exist, and `EXPLAIN ANALYZE` confirms Index Scan instead of Sequential Scan.
- **[P2] Shared Auth & Cart Session via Cookies**: As an authenticated user or admin, my authentication state and cart tokens should persist seamlessly across zones via HTTP-only cookies.
  - *Accepted when*: Logging in on storefront preserves auth state when visiting admin (if authorized), and guest cart cookies remain valid across zone transitions.
- **[P3] Full Turborepo Monorepo Migration**: Moving non-Next shared UI components to a dedicated `@gritmode/ui` package (out of initial scope, to be implemented after core zones split).

## Functional Requirements
- **FR-01**: Refactor root public layout (`src/shared/layouts/MainLayout.jsx`) to a Server Component, extracting interactive elements into isolated `'use client'` islands (`CartButtonIsland`, `SearchTriggerIsland`, `MobileNavIsland`).
- **FR-02**: Implement `loading.jsx` for `/products` and `/products/[id]` providing instant skeleton UI during server data streaming.
- **FR-03**: Convert sequential prefetching in `ProductsPage` (`products/page.jsx`) from sequential `await` to `Promise.all` parallel prefetching.
- **FR-04**: Dynamically import `CartDrawer` and `SearchModal` using `next/dynamic` with `{ ssr: false }`, deferring script execution until opened.
- **FR-05**: Configure Next.js Multi-Zones routing: establish Storefront as primary zone (`/`) and Admin as secondary zone (`/admin`), with path-based rewrites.
- **FR-06**: Initialize Prisma in `Gritmode_BE`: introspect or define models in `prisma/schema.prisma` representing all active tables (`product`, `category`, `collection`, `user`, `order`, etc.).
- **FR-07**: Configure Prisma client singleton (`globalForPrisma`) with bounded connection pooling to prevent connection exhaustion during SSR concurrency.
- **FR-08**: Define B-Tree indexes in `schema.prisma` targeting high-selectivity fields (`slug`, `email`, `sku`) and composite indexes (`category_id + created_at DESC`, `collection_id + created_at DESC`).
- **FR-09**: Exclude standalone B-Tree indexes on low-selectivity columns (`is_active`, `gender`), replacing them with partial indexes (`WHERE is_active = true`) where query planner benefit is demonstrated.

## Non-Functional Requirements
- **NFR-01 (Interaction to Next Paint - INP)**: INP on storefront interactions (clicking menu, opening drawers, changing filters) must be < 150ms on mobile and desktop.
- **NFR-02 (Time to First Byte - TTFB)**: Backend product API response times for indexed queries (`category`, `slug`, `sort`) must be < 20ms at p95 under local Docker Postgres.
- **NFR-03 (Client Bundle Reduction)**: Initial client JavaScript bundle transferred for the homepage must decrease by at least 35% after removing monolithic client layout and lazy-loading drawers.
- **NFR-04 (Zero Downtime / Non-breaking Migration)**: Prisma schema migration must run cleanly against existing Docker Postgres without data loss or sequence collisions.

## Success Criteria
- [ ] `MainLayout.jsx` is transformed into an RSC shell, removing `'use client'` from the outer container.
- [ ] `SearchModal` and `CartDrawer` are verified to load chunks only when triggered by user interaction.
- [ ] Instant transition verified: clicking `/products` renders `loading.jsx` skeleton in < 50ms without route freeze.
- [ ] Next.js Multi-Zones configuration routes `/admin` requests cleanly to the admin zone with isolated JS assets.
- [ ] `schema.prisma` compiles cleanly (`npx prisma validate`), and `npx prisma db pull` / migrations align with existing 23 Postgres tables.
- [ ] PostgreSQL `EXPLAIN ANALYZE` on `GET /api/v1/products?category_id=...&sort=newest` demonstrates B-Tree Index Scan with query execution time < 10ms.
- [ ] No regression on cart, authentication, checkout, or MinIO product image display.

## Out of Scope
- Full rewrite of Admin dashboard UI components (admin pages maintain their current UI, only zone routing and isolation are handled).
- Elasticsearch / Meilisearch integration (text search continues on PostgreSQL B-Tree / Trigam for current scale).

## Assumptions
- PostgreSQL 16 container running in Docker (`gritmode-postgres`) remains the single source of truth for both zones.
- Authentication tokens continue to be transmitted via standard Authorization headers and HTTP-only cookies compatible with Next.js Multi-Zones rewrites.
