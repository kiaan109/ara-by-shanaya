# ARA by Shanaya - Full Stack Fashion E-commerce

Modern premium fashion storefront built with Next.js App Router, Tailwind, Framer Motion, Zustand, MongoDB, Excel import, and AI Try-On support.

## Tech stack
- Frontend: Next.js 16, Tailwind CSS 4, Framer Motion, Zustand
- Backend: Next.js Route Handlers (API), MongoDB + Mongoose
- Storage: Cloudinary (config included for uploads)
- AI: Replicate-based try-on API flow

## Features
- Landing cover page with carousel-style visuals and gold/ivory branding
- Home page with hero slider, featured outfits, categories
- Shop page with Zara-like grid and filters (price, category, size)
- Product detail with gallery, size picker, add to cart, wishlist, buy-by-email
- Cart + wishlist using persistent Zustand stores
- Email-based checkout via prefilled `mailto:` to `arabyshanya@gmail.com`
- Admin panel:
  - Excel upload (`.xlsx`) ingestion
  - Manual product add/edit via API
- AI try-on page:
  - Upload user image + outfit image
  - Generate output through Replicate
  - Before/after preview

## Project structure
`src/app`, `src/components`, `src/lib`, `src/models`, `src/utils`, `src/store`, `public`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env variables:
   ```bash
   cp .env.example .env.local
   ```
3. Fill `.env.local`:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_UPLOAD_PRESET`
   - `REPLICATE_API_TOKEN`
   - `REPLICATE_MODEL_VERSION`
4. Run dev server:
   ```bash
   npm run dev
   ```

## Excel upload format
Supported headers (case-insensitive variants accepted):
- `Outfit Name` / `Name`
- `Price`
- `Category`
- `Sizes` (e.g. `S,M,L`)
- `Image Links` or `Image 1`, `Image 2`, `Image 3`

Import endpoint:
- `POST /api/import-excel` with form-data key `file`

Import behavior:
- Auto-generates slug and SKU
- Upserts by slug to avoid duplicate breakage on future uploads

## API routes
- `GET /api/products` with optional query filters
- `POST /api/products` upsert product
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/import-excel`
- `POST /api/try-on`

## Deployment (Vercel)
1. Push to GitHub
2. Import repository in Vercel
3. Add all env variables from `.env.example`
4. Deploy

## Notes
- Without `MONGODB_URI`, storefront uses bundled mock products so the UI still runs.
- Admin writes and Excel imports require MongoDB to be configured.
- AI try-on requires Replicate env values.
