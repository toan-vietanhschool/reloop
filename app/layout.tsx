import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/shared/CookieBanner";
import { PostHogProvider } from "@/components/shared/PostHogProvider";
import { WebVitalsReporter } from "@/components/shared/WebVitalsReporter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Title template lets each page set its own title via `metadata.title`
  // while keeping the unbranded marketing default for routes that don't
  // override (e.g. landing). Pages set just their own short title:
  //   export const metadata = { title: "Dashboard — ReLoop" }
  // and the template (`%s`) renders it verbatim. Use `default` for any
  // route that opts out of overriding.
  title: {
    template: "%s",
    default: "ReLoop — Shazam cho rác",
  },
  description:
    "Chụp 1 ảnh, biết tất cả: vật liệu, thời gian phân hủy, nơi tái chế gần nhất. AI Vision Scan cho rác Việt Nam.",
  applicationName: "ReLoop",
  keywords: [
    "ReLoop",
    "tái chế",
    "AI scan rác",
    "Eco Score",
    "Shazam cho rác",
    "TDTU",
    "phân loại rác",
  ],
  openGraph: {
    title: "ReLoop — Shazam cho rác",
    description:
      "Chụp 1 ảnh, biết tất cả: vật liệu, thời gian phân hủy, nơi tái chế gần nhất.",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* WCAG 2.4.1 Bypass Blocks: skip-link reveals on focus only. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Bỏ qua điều hướng, đến nội dung chính
        </a>
        <WebVitalsReporter />
        <PostHogProvider>
          {children}
          <Toaster richColors position="top-center" />
          <CookieBanner />
        </PostHogProvider>
      </body>
    </html>
  );
}
