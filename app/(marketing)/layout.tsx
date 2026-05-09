import type { ReactNode } from "react"

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      {children}
    </div>
  )
}
