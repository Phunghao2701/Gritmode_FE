# Phase 02 — Dockerized Prisma Integration & Engine Generation

**Phase ID:** `phase-02-docker-prisma-integration`  
**Priority:** P2 (Covers spec story: User Story 3)

## Objective
Wire Prisma schema and Alpine Linux query engine into the `gritmode-be` Docker container, mounting `./prisma` volume and ensuring seamless containerized database access.

## Scope & Implementation Tasks
1. **Mount Prisma Schema in `docker-compose.yml`**:
   - In `e:\Gritmode\Gritmode_BE\docker-compose.yml`:
     - Add `- ./prisma:/app/prisma` under `services.backend.volumes`.
     - Ensure host edits to `prisma/schema.prisma` are immediately visible inside `/app/prisma`.
2. **Configure Dockerfile for Prisma Client Generation**:
   - In `e:\Gritmode\Gritmode_BE\Dockerfile.dev`:
     - Copy `prisma` directory prior to client generation or add `RUN npx prisma generate` after `COPY . .`.
   - In `e:\Gritmode\Gritmode_BE\package.json`:
     - Add `"postinstall": "prisma generate"` to ensure automatic engine generation across host and container environments.
3. **Rebuild & Verify Backend Container**:
   - Run `docker compose build backend` (or `docker compose up -d --build backend`).
   - Execute verification command inside container: `docker compose exec backend npx prisma validate`.
   - Confirm backend starts up healthy with zero engine errors.

## Files & Modules Affected
- `e:\Gritmode\Gritmode_BE\docker-compose.yml`
- `e:\Gritmode\Gritmode_BE\Dockerfile.dev`
- `e:\Gritmode\Gritmode_BE\package.json`

## Dependencies
- Requires Docker daemon running (already healthy with postgres, redis, minio).

## Tests & Acceptance Criteria
- `docker-compose.yml` has `./prisma:/app/prisma` in `services.backend.volumes`.
- `docker compose exec backend npx prisma validate` returns "The schema at prisma/schema.prisma is valid".
- Backend container `gritmode-be` is in `running` state (`docker compose ps`).

## Risks & Notes
- Ensure `DATABASE_URL` or `POSTGRES_URL` environment variables are properly picked up by Prisma inside the container.
