// middleware.js (Place this file in the ROOT of your project, NOT inside pages/)

// --- Use the simple default export from NextAuth ---
// This automatically protects matched routes based on session token presence.
export { default } from "next-auth/middleware"


// --- Configuration for the Middleware ---
export const config = {
  // The `matcher` option specifies which routes the middleware should run on.
  // List the exact paths or patterns for pages you want to protect.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images (your public images folder)
     * - favicon.ico (favicon file)
     * - / (the public homepage)
     * - /auth/ (potential custom auth pages, if you add them)
     * - /knowledge-base (example public page from your header)
     * Add any other public paths or patterns here.
     */

    // --- List specific pages/patterns to protect ---
    // Add paths from your file:
    '/knowledge/AI-Strategy-2025-Policies-Landscape',
    '/knowledge/AI-Strategy-2025-Policies-Sectoral-Impacts',
    '/knowledge/AI-Strategy-2025-Policies-Key-Challenges',
    '/knowledge/AI-Strategy-2025-Policies-Opportunities',
    '/knowledge/AI-Strategy-2025-Policies-Funding',
    '/knowledge/AI-Strategy-2025-Policies-Competitive-Analysis',
    '/knowledge/AI-Strategy-2025-Policies-Recommendations',
    '/knowledge/AI-Strategy-2025-Policies-References',

    // Add other paths you might want to protect:
    // '/dashboard/:path*',
    // '/profile',
    // '/settings/:path*',
    // '/admin/:path*',

    // --- IMPORTANT ---
    // Any path NOT listed here will be public by default (not run through this middleware).
  ],
};

// --- No custom logic needed for this simple approach ---
// The default export handles checking the token and redirecting to the
// sign-in page (configured in NextAuth options or default) if unauthorized.

