# Brainstorm Report: Local Suspense Loading, URL Flicker Resolution & Docker Prisma Setup

**Date:** 2026-09-27  
**Topic:** Smooth Local Skeleton Navigation, Eliminating URL Redirection Flicker, and Containerized Prisma Integration

---

## 1. Challenge & Problem Statement
1. **Page-level Skeleton Flicker**: `products/loading.jsx` currently replaces the whole screen (Header, Filter pills, Grid) on every transition to `/products`. This creates a visible jarring layout shift even for 50ms fast loads.
2. **Intermediate URL Flicker**: Clicking the Hero banner navigates to `/products?sort=newest`, but `ProductListPage` considers `'newest'` as default, strips it, and issues `router.replace('/products')`. The browser address bar visually flashes twice (`/` → `/products?sort=newest` → `/products`), making it look like there is an intermediate page in between.
3. **Prisma in Docker Container**: While the PostgreSQL Docker container (`gritmode-postgres`) already has the B-Tree indexes applied, the backend container (`gritmode-be`) lacks the `./prisma` volume mount and alpine-compatible Prisma Client generation (`npx prisma generate`).

---

## 2. Ideas Explored & User Direction
- **Loading UX**: User explicitly chose **Direction 2 (Local Suspense Boundary & Refined Skeleton)**:
  - Keep Title, Breadcrumb, and Category Pills static in `products/loading.jsx` matching the actual layout.
  - Confine visual skeleton pulsing exclusively to the Product Cards Grid.
- **URL Cleanliness**: Confirmed unifying navigation target to `/products` without appending redundant default query parameters (`?sort=newest`).
- **Prisma in Docker**: Confirmed adding Prisma volume and generation scripts into Docker compose and Dockerfile.

---

## 3. Architecture Specification

### A. Frontend Loading & Navigation
1. **Refine `products/loading.jsx`**:
   - Render clean, dark-mode/light-mode matched title ("TẤT CẢ SẢN PHẨM" + Breadcrumbs).
   - Render static streetwear filter pills.
   - Render pulsing grid of 8 product cards with aspect ratio 3/4.
2. **Fix Hero Banner Navigation**:
   - Update `LandingPage.jsx:66` from `router.push('/products?sort=newest')` to `router.push('/products')`.
3. **Prevent Unnecessary `router.replace` on Mount**:
   - Ensure `ProductListPage.jsx` does not trigger URL replacement if the query parameters already match defaults.

### B. Backend Docker Prisma Integration
1. **Volume Mount**:
   - Add `./prisma:/app/prisma` in `docker-compose.yml` under `services.backend.volumes`.
2. **Container Build & Engine Generation**:
   - Add `RUN npx prisma generate` in `Dockerfile.dev` after `COPY . .`.
   - Add `"postinstall": "prisma generate"` in `Gritmode_BE/package.json` to guarantee engine availability across host and container environments.

---

## 4. Risks & Mitigations
- **Docker Cache Invalidation**: Modifying `Dockerfile.dev` requires `docker compose build backend` to bake the generated Prisma engine into the image.
  - *Mitigation*: Run `docker compose up -d --build backend` to recreate the container cleanly.
- **Client Cache Synchronization**: Switching URL from `/products?sort=newest` to `/products` aligns with TanStack Query's prefetch key `['products', { ... }]`, ensuring immediate cache hits without extra network requests.
