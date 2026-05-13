import type { NextConfig } from "next"
import bundleAnalyzer from "@next/bundle-analyzer"
import { withSentryConfig } from "@sentry/nextjs"

if (!process.env.STANDALONE_BUILD) {
  import("@opennextjs/cloudflare").then(m => m.initOpenNextCloudflareForDev()).catch(() => {})
}

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" })

const nextConfig: NextConfig = {
  ...(process.env.STANDALONE_BUILD ? { output: "standalone" } : {}),
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
