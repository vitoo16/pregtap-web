# PregTap frontend, technical SEO and security audit — 2026-10-11

Audit scope: `vitoo16/pregtap-web` default branch at `43d8ff2150825f546a6f94e86ef62470bc6d84f6`, changes on `feat/pregtap-seo-gsap-static-pricing`. Based on code inspection, GitHub/Vercel status and public search results. **Not a complete penetration test or a live Lighthouse report.** Public domain could not be fetched from the assistant's browsing runtime, and backend infrastructure is reportedly offline.

## P0 / release gates

| Area | Finding | Change or next action |
| --- | --- | --- |
| Discoverability | No robots/sitemap and no explicit preferred production canonical on source branch. Homepage used a full-page Suspense fallback around a client component that called `useSearchParams`. | **Changed:** Static Next.js server-rendered marketing page, canonical, OG + JSON-LD, sitemap and robots metadata. Verify page source after deployment. |
| Branded query | Searches performed for "PregTap" and `site:pregtap.owerhappiness.id.vn` did not surface the target domain in sampled results. This is **not proof** that Google has or has not indexed a specific URL. | **External:** Verify Google Search Console property for the exact domain, submit sitemap, inspect `/`, request indexing, watch impressions and indexing errors. |
| Pricing | Marketing fetched `/api/subscriptions/plans`, so offline backend meant missing price cards. | **Changed:** Public pricing is static from Terms of Use: VND 39,000 / 199,000 / 399,000. Checkout disabled and clearly marked. These values do not grant entitlements or establish payment amounts. |
| Auth token exposure | `src/lib/token-store.ts` stores access and refresh tokens in localStorage **and** JavaScript-readable cookies, including 30-day refresh tokens. | **Unresolved high risk:** server-owned HttpOnly, Secure, SameSite session/BFF with CSRF protections, refresh rotation, expiration/revocation. Requires backend coordination and regression tests. |
| API authorization | `src/lib/admin-access.ts` decodes a JWT client-side for display permission; `/api/admin/users` forwards bearer tokens upstream. It does not verify role in the Next route. | **Unverified:** Confirm upstream backend verifies token signature, role and resource ownership for every admin and private API operation. Client-only role checks never secure endpoints. |
| Billing policy | Existing Terms of Use describe Apple auto-renew subscriptions; previous landing purchase flow used a PayOS checkout request. | **Unresolved:** Product/legal owner must reconcile billing policies, cancellation, refunds and current checkout behavior before taking payments. Do not silently rewrite agreements. |

## P1 / implemented in this PR

- **SEO:** `metadataBase`, homepage metadata, indexable H1, Open Graph, software + organization JSON-LD, host-specific redirect from `pregtap-web.vercel.app`, canonical for legal pages, API/app/profile/payment `X-Robots-Tag` headers.
- **UX/credibility:** removed three unsupported doctor profiles and non-functional landing links. No unverified expert partnerships should appear on a health website.
- **Animation:** follows official GreenSock `gsap-react`, `gsap-core`, `gsap-scrolltrigger`, and `gsap-performance` skills. Scoped selectors, context cleanup, transform/opacity tweens, prefers-reduced-motion, minimal repetitive effects.
- **Performance:** converts the large fully hydrated landing to server-rendered presentation, dynamic-loads auth modal only on demand, avoids failed backend calls for pricing and user status, and uses Next/Image in the main visual.
- **App home:** shared `useCardReveal` hook replaces redundant motion variants in stat and navigation cards; `WeekCircle` removes a duplicated full SVG tree.
- **Security headers:** `nosniff`, restrictive referrer, framing denied, restricted permissions, minimal frame/object/base CSP (does **not** claim to solve XSS).

## P1 / remaining QA

- Run `npm ci && npm run lint && npx tsc --noEmit && npm run build` on a clean environment, test on Chromium/WebKit/Firefox and mobile.
- Lighthouse for public homepage mobile & desktop on production: **targets** LCP <= 2.5s, CLS <= 0.1, INP <= 200ms at the 75th percentile. These are targets, **not achieved measurements**.
- Inspect first-load request waterfall, JavaScript transferred, image priority/sizing, server timing, Next.js font loading, reduced-motion compliance, keyboard/focus, color contrast, modal focus trapping.
- Test app authentication routes, password changes, uploads/OCR file validation and size caps, per-resource authorization, rate limits, error data leakage, CORS, and CSRF behavior when backend returns.
- Strict CSP with nonces or hashes requires an independent rollout; current Next.js scripts and legacy third-party integrations must be tested before enabling `script-src`.
- Confirm published privacy-policy statements (encryption at rest, two-factor administration, retention, personal-data deletion) match deployed implementation.
- Most authenticated app modules still use Framer Motion; migrating every component must preserve feature behavior and should be tested with a working backend.
- Confirm email address `support@pregtap.com` is operational; it is published in existing legal pages but has not been independently verified.

## SEO acceptance

1. DNS and TLS resolve `https://pregtap.owerhappiness.id.vn/`.
2. Unauthenticated GET `/` returns 200 with visible product name and price cards in **initial HTML**.
3. `/robots.txt` and `/sitemap.xml` return 200, valid text/XML and the canonical origin only.
4. Head contains title, meta description, canonical and OG tags; JSON-LD validates without made-up reviews/rating/medical endorsements.
5. Duplicate old Vercel domain redirects permanently to canonical; no redirect loops.
6. Google Search Console URL Inspection confirms indexability. Actual ranking is measured over time, not guaranteed.
