import type { Metadata } from "next"
import type { ReactNode } from "react"

// page.tsx is a client component, so it can't export `metadata` directly.
// This server-component layout sets the page title for /auth/login.
export const metadata: Metadata = {
  title: "Đăng nhập — ReLoop",
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
