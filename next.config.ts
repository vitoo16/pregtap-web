
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Keep existing Next.js inline scripts and external API connections functional.
  // A strict script-src nonce-based CSP needs its own browser acceptance tests.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'pregtap-web.vercel.app' }],
        destination: 'https://pregtap.owerhappiness.id.vn/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      ...['/api/:path*', '/app/:path*', '/app', '/profile/:path*', '/profile', '/payment/:path*', '/payment'].map(
        (source) => ({ source, headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] })
      ),
    ];
  },
};

export default nextConfig;
