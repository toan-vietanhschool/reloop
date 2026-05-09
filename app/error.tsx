"use client"

import Link from "next/link"
import { useEffect } from "react"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Route-segment error boundary. Catches render-time errors thrown beneath
 * any segment that doesn't ship its own error.tsx. The outer html/body shell
 * from app/layout.tsx is still mounted, so we render plain JSX here.
 */
export default function RouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    // Surface the error to the dev console + future error tracker (Sentry, etc.)
    console.error("[reloop:route-error]", error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertTriangle className="h-8 w-8" aria-hidden />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Có lỗi xảy ra 😔
        </h1>
        <p className="text-pretty text-base leading-relaxed text-muted-foreground">
          ReLoop đang vấp phải một sự cố nhỏ. Bạn thử tải lại — hoặc về trang chủ
          để tiếp tục hành trình tái chế.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-muted-foreground/70">
            Mã lỗi: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" aria-hidden />
          Thử lại
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" aria-hidden />
            Về trang chủ
          </Link>
        </Button>
      </div>
    </main>
  )
}
