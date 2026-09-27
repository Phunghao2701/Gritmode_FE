# Phase 01 — Database Prisma Setup & B-Tree High Selectivity Indexing

**Phase ID:** `phase-01-database-prisma-btree`  
**Priority:** P1 (Covers spec story: [P1] Prisma Schema & High-Selectivity B-Tree Indexing, FR-06, FR-07, FR-08, FR-09)

## Objective
Initialize Prisma ORM in `Gritmode_BE`, introspect existing PostgreSQL 16 database tables in Docker, create a thread-safe Prisma client singleton with bounded connection pooling, and apply B-Tree High Selectivity indexes (Composite `[category_id, created_at DESC]`, Unique `slug`, and Partial index on `is_active`).

## Scope & Tasks
1. **Prisma Dependencies**:
   - Install `prisma` CLI (devDependencies) and `@prisma/client` (dependencies) in `Gritmode_BE`.
2. **Schema Introspection & Alignment**:
   - Run `npx prisma db pull` against `POSTGRES_URL` to introspect all 23 database tables.
   - Refine `prisma/schema.prisma` with proper model mappings, relations, and types.
3. **B-Tree High Selectivity Indexing**:
   - Add B-Tree Composite Index on `Product`:
     `@@index([category_id, created_at(sort: Desc)], name: "idx_product_category_created")`
     `@@index([collection_id, created_at(sort: Desc)], name: "idx_product_collection_created")`
     `@@index([created_at(sort: Desc)], name: "idx_product_created_desc")`
   - Ensure unique B-Tree indexes on high-selectivity columns: `slug_product`, `sku_code`, `email`, `order_code`.
   - Prevent standalone B-Tree indexes on low-selectivity booleans (`is_active`); configure partial index where needed.
4. **Client Singleton & Connection Pooling**:
   - Implement `src/config/prisma.js` using `globalForPrisma` pattern to prevent connection exhaustion during concurrent SSR queries.
5. **Database Push & Index Verification**:
   - Apply indexes using `npx prisma db push` or raw migration SQL.
   - Run `EXPLAIN ANALYZE` on `SELECT * FROM product WHERE category_id = ... ORDER BY created_at DESC LIMIT 20` to verify B-Tree Index Scan.

## Files & Modules Affected
- `e:\Gritmode\Gritmode_BE\package.json`
- `e:\Gritmode\Gritmode_BE\prisma\schema.prisma` (New)
- `e:\Gritmode\Gritmode_BE\src\config\prisma.js` (New)
- `e:\Gritmode\Gritmode_BE\.env`

## Dependencies
- Requires Docker Postgres container (`gritmode-postgres` on port 5433) running.

## Tests & Acceptance Criteria
- `npx prisma validate` passes with 0 syntax errors.
- `node -e "import('./src/config/prisma.js').then(async ({ prisma }) => { await prisma.$queryRaw\`SELECT 1\`; console.log('PRISMA_OK'); process.exit(0); })"` logs `PRISMA_OK`.
- PostgreSQL query planner shows `Index Scan using idx_product_category_created` and execution time < 10ms.

## Risks & Notes
- Ensure `POSTGRES_URL` connection limit matches pool capacity (`connection_limit=20`).
- Introspection must preserve existing table names and foreign keys without dropping columns.
