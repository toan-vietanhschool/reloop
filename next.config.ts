import type { NextConfig } from "next"
import bundleAnalyzer from "@next/bundle-analyzer"
import { withSentryConfig } from "@sentry/nextjs"
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

initOpenNextCloudflareForDev()

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" })

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vzpwsdmlofsizhkwcpra.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

/**
 * Sentry build-time wrapping.
 *
 * - Uploads source maps to Sentry on every Vercel deploy so stack traces are
 *   readable in the dashboard.
 * - Hides source maps from public web access (uploaded to Sentry, not served).
 * - org/project are placeholder slugs — replace with the real Sentry org and
 *   project slugs once the Sentry project is created. See docs/SENTRY-SETUP.md.
 *
 * SENTRY_AUTH_TOKEN must be configured in the Vercel project env (and locally
 * in .env.local for build-time tests). Without it, source map upload is a
 * no-op but the runtime SDK still works.
 */
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: "reloop-tdtu",
  project: "reloop-mvp",
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: false, deleteSourcemapsAfterUpload: true },
  disableLogger: true,
  automaticVercelMonitors: false,
})
