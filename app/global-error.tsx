"use client"

import { useEffect } from "react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root-level error boundary. Renders when app/layout.tsx itself throws.
 * Must include its own <html>/<body> because the surrounding layout is gone.
 * Keep markup minimal — no design tokens or fonts are guaranteed to load.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[reloop:global-error]", error)
  }, [error])

  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor: "#fafaf7",
          color: "#111",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <main
          style={{
            maxWidth: "32rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, margin: 0 }}>
            ReLoop đang gặp sự cố nghiêm trọng 😔
          </h1>
          <p style={{ color: "#555", lineHeight: 1.6, margin: 0 }}>
            Hệ thống không thể khởi tạo trang. Bạn thử tải lại trong vài giây —
            đội ngũ ReLoop đã được thông báo và đang khắc phục.
          </p>
          {error.digest ? (
            <p style={{ fontSize: "0.75rem", color: "#888", margin: 0 }}>
              Mã lỗi: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              alignSelf: "center",
              cursor: "pointer",
              borderRadius: "999px",
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              padding: "0.65rem 1.5rem",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            Thử lại
          </button>
        </main>
      </body>
    </html>
  )
}
