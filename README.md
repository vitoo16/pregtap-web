
# PregTap Web

Next.js 16 / React 19 site and application for PregTap.

## Local development

```bash
npm ci
npm run lint
npm run build
npm run dev
```

> Some authenticated features and checkout depend on a backend that is currently offline. The landing page is server-rendered and the published Premium price cards are static.

## SEO / canonical domain

The **canonical production domain** is `https://pregtap.owerhappiness.id.vn/`.

- `/` has PregTap-specific titles, descriptions, OG metadata and JSON-LD.
- Next.js exposes `/robots.txt` and `/sitemap.xml`; the sitemap includes only public pages.
- Personal app, profile, payment and API URLs are not meant for indexing.
- `pregtap-web.vercel.app` is redirected to the production hostname if requests still arrive at that host.
- The public marketing content must remain available even when the backend is down.

**After deploying**: confirm the custom domain resolves, HTTPS is valid, homepage returns 200, inspect the generated HTML (title, description, canonical, H1 and JSON-LD), and inspect robots/sitemap. Verify the domain in [Google Search Console](https://search.google.com/search-console), submit the sitemap, inspect the homepage URL and request indexing. Search engine rankings and indexing are not guaranteed by code changes.

## Motion

Landing motion follows the official GreenSock `gsap-react`, `gsap-scrolltrigger` and `gsap-performance` skills from [greensock/gsap-skills](https://github.com/greensock/gsap-skills). It uses a scoped `useGSAP`, ScrollTrigger entrance effects, and `prefers-reduced-motion`. The app UI still uses Framer Motion; migration outside the landing should be separately reviewed.

## Prices and checkout

Source of displayed subscription prices: the existing Terms of Use (`/terms-of-use`). Edit `src/lib/public-pricing.ts` if the published prices change. Prices shown publicly are **not authoritative for payment**, and the landing checkout is intentionally disabled while the backend is offline.

**Security follow-up:** the legacy authentication flow stores access and refresh tokens in `localStorage` and JavaScript-readable cookies. Migrating to server-managed HttpOnly sessions requires a coordinated API/backend change and should not be attempted solely with front-end headers.
