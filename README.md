# STIKLY — Stick Your Personality

Sticker D2C storefront + admin dashboard. React (Vite) · Tailwind CSS · Lucide · Supabase (Postgres, Auth, Storage).
Visual language follows the "Vinyl Editorial" design system from your Stitch export (violet / coral / citrus, hard shadows, Syne + Plus Jakarta Sans + Space Grotesk).

> **Status:** all 69 source files parse and the full module/import graph bundles cleanly (checked with esbuild), but the app has **not been run in a browser yet** — the build environment had no network for `npm install`. Do the checklist in "First run" before you trust it.

## Quick start (demo mode, no accounts needed)

```bash
npm install
npm run dev
```

With no `.env`, the site runs on sample data + `localStorage`: browsing, search, filters, cart, wishlist, quick view, product pages, custom studio, checkout (demo), order tracking, newsletter, contact and review submission all work.
Open `/admin` locally by copying `.env.example` to `.env` and setting `VITE_DEMO_ADMIN=true` (demo only; never in production).

## Full mode (Supabase)

1. Create a Supabase project.
2. SQL editor → run `supabase/schema.sql`, then `supabase/seed.sql` (regenerate any time with `npm run seed:sql`).
3. Copy `.env.example` → `.env`, fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project settings → API; the anon key is safe in the browser **because RLS is on**. Never put the service-role key in this app).
4. Register an account in the site, then make it admin in the SQL editor:
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'you@example.com');
   ```
5. Supabase Auth → decide whether email confirmation is required.

**Needs credentials:** accounts/login, saved wishlists, real orders and order history, product/category management with image upload, review moderation, custom-artwork storage, newsletter/contact storage.

## How it is secured

- Admin access is `profiles.is_admin`, enforced by Postgres RLS via `public.is_admin()`. The `/admin` route guard is only UX. Users cannot edit `is_admin` (column-level grant).
- Orders are created only by the `place_order` RPC, which **recomputes prices, stock and shipping on the server**. The browser's cart prices are never trusted.
- Reviews are always stored as `pending`; `verified` is set by a trigger (true only if that signed-in user ordered the product). Admins approve/hide/delete.
- Custom artwork uploads go to a private bucket readable only by admins.

## Payments — read before going live

- Without keys, checkout is clearly labelled **DEMO** and takes no payment; online payment is disabled, cash-on-delivery stays selectable.
- Set `VITE_RAZORPAY_KEY_ID` to a **test** key (`rzp_test_…`) to enable the Razorpay window. Orders paid this way are stored as `awaiting_verification`, because proper integration also needs a server step (create the Razorpay order with the amount from the DB, verify the payment signature) — e.g. a Supabase Edge Function. Build that before accepting live money.

## Placeholders you must replace

- Sample ratings, sold counts and the six sample reviews in `src/data/seed.js` / `content.js` (the seed reviews are **not** marked verified on purpose).
- Policy text, FAQ answers, shipping rules (`src/lib/config.js`, keep `place_order` in `schema.sql` in sync: ₹49 flat, free from ₹499) and custom pricing tiers (mirrored in SQL).
- `hello@stikly.in` and the social links in `Footer.jsx`.
- Product claims like "waterproof" and "scratch-resistant" — keep only what your real material supports.
- The Stitch mockups spell the brand "STIKKY"; this build uses **STIKLY** throughout.

## First-run checklist

1. `npm run dev`, open the console — no errors expected.
2. Add a product to the cart from the home page, quick view and product page; change quantities; refresh (cart persists).
3. Shop: search "cat", filter by category, set a price range, sort, "Load more", and search for nonsense to see the empty state.
4. Custom studio: upload an image, change type/quantity, add to cart, check the price tiers.
5. Checkout with invalid then valid data; confirm the order page; track it with the number + email.
6. Admin: add/edit/delete a product, change an order status, approve a review.
7. Resize to phone width and test the hamburger menu.
8. `npm run build` and `npm run preview`.

## Structure

```
src/components   shared UI, layout, sections/, admin/
src/pages        routes (+ admin/)
src/context      auth, cart, wishlist, catalog, toast
src/services     Supabase + localStorage-demo data access
src/lib          config, pricing, formatting, supabase client
src/hooks        useLocalStorage, useDebounce, useSeo, useAsync
src/data         sample catalogue and site copy
supabase/        schema.sql, seed.sql
public/images    optimized artwork from your Stitch export
```

Deploying as a single-page app needs a rewrite of all paths to `index.html` (Vercel/Netlify/Cloudflare Pages each have a one-line setting).
