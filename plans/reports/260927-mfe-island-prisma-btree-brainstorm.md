# Brainstorm: Micro-Frontend Multi-Zones, Island Architecture & Prisma B-Tree Selectivity Optimization

**Date:** 2026-09-27

## Ideas Explored
1. **Full Monolithic App Router with Client Wrappers (Current state)**: Layout and pages wrapped in monolithic `'use client'`, causing massive client bundle hydration, UI freeze, and high TBT.
2. **Modular Route Groups with In-Repo Islands**: Splitting components into RSC and small Client Islands within the same Next.js app without Micro-Frontend separation. Good for hydration, but doesn't solve team boundary/code isolation between Admin and Storefront.
3. **Module Federation / Webpack Micro-apps**: Fine-grained component sharing across independent apps; dismissed due to React 19 / Next.js App Router runtime instability and high configuration complexity.
4. **Next.js Multi-Zones (Selected)**: Splitting `storefront` and `admin` into independent Next.js zones under unified routing with rewrites, using Island Architecture inside each zone.
5. **Raw SQL with Manual B-Tree Indexes**: Adding composite B-Tree indexes directly via SQL scripts in existing `pg` driver; fast, but lacks schema type-safety and automated migrations.
6. **Prisma ORM with B-Tree High Selectivity Strategy (Selected)**: Defining `schema.prisma`, migrating models from Postgres, and applying B-Tree indexes strictly on high selectivity columns and composite keys (`(category_id, created_at DESC)`).

## User's Direction
- **Frontend Architecture**: Adopt **Next.js Multi-Zones** to split Storefront and Admin domains, allowing isolated bundle boundaries and independent team ownership. Inside each micro-app, implement **Island Architecture** (Server Shell + Client Islands + dynamic import for modals/drawers) to eliminate hydration blocking and transition delays between Home ↔ `/products`.
- **Database & Backend**: Migrate database schema to **Prisma** (`schema.prisma`), establishing explicit B-Tree indexing tailored for high selectivity attributes (`slug`, `sku`, `email`, composite `[category_id, created_at]`), and avoid wasteful indexing on low-selectivity attributes.

## Open Questions
1. **Multi-Zones Workspace Layout**: Will the Multi-Zones be organized as a Turborepo monorepo (`apps/storefront`, `apps/admin`) or two standalone apps routed via rewrites / reverse proxy?
2. **Session & Cart Persistence across Zones**: How will tokens and guest cart sessions be synchronized when navigating between Storefront and Admin (HTTP-only secure cookie standard)?
3. **Prisma Schema Introspection vs Clean Definition**: Should `prisma db pull` be used to introspect the existing 23 tables in Docker Postgres, or write a clean `schema.prisma` mapping the domain models?

## Risks
1. **Prisma Connection Pooling in Next.js SSR**: Next.js Server Components create multiple parallel execution contexts; without singleton client pattern and connection pool limits (`connection_limit`), PostgreSQL connections may get exhausted under concurrent loads.
2. **Cross-Zone Asset and Navigation State**: In Multi-Zones, hard navigation between zones (`storefront` → `admin`) involves a full page reload rather than soft client-side navigation.
3. **Write Amplification from Over-Indexing**: Excessive B-Tree indexes on write-heavy tables (`inventory`, `admin_audit_log`, `cart_item`) could slow down mutations. Indexing must strictly respect selectivity thresholds.
