"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { Recycle, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)

  async function handleGoogleLogin() {
    setIsOAuthLoading(true)
    try {
      const supabase = createClient()
      const origin = window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error("Không thể đăng nhập Google", {
          description: error.message,
        })
        setIsOAuthLoading(false)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định"
      toast.error("Đăng nhập Google thất bại", { description: message })
      setIsOAuthLoading(false)
    }
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email) return

    setIsSendingMagicLink(true)
    try {
      const supabase = createClient()
      const origin = window.location.origin
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error("Không gửi được email", { description: error.message })
      } else {
        toast.success("Email đã gửi, kiểm tra hộp thư", {
          description: `Chúng tôi đã gửi đường dẫn đăng nhập tới ${email}`,
        })
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định"
      toast.error("Gửi email thất bại", { description: message })
    } finally {
      setIsSendingMagicLink(false)
    }
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-eco-bg-soft px-4 py-12">
      {/* Layered atmospheric mesh */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-mesh opacity-90"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(circle_at_top,oklch(70%_0.18_160_/_0.18)_0px,transparent_60%)]"
      />
      {/* Subtle dot pattern */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.04] [background-image:radial-gradient(oklch(0.145_0_0)_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="flex w-full max-w-md flex-col items-center gap-6">
        {/* Brand mark above card */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-foreground"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green/15 text-brand-green-deep ring-1 ring-brand-green/30 shadow-brand transition group-hover:scale-105">
            <Recycle className="h-6 w-6" aria-hidden />
          </span>
          ReLoop
        </Link>

        <Card className="w-full border-foreground/8 shadow-soft-lg">
          <CardHeader className="text-center">
            <span className="mx-auto mb-1 inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green-deep">
              <Sparkles className="h-3 w-3" aria-hidden />
              TDTU Vibe Coding 2026
            </span>
            <CardTitle className="font-display text-2xl font-bold tracking-tight">
              Đăng nhập ReLoop
            </CardTitle>
            <CardDescription className="text-pretty text-base">
              Quay vòng đồ cũ, nhận eco-points cho mỗi món tái sinh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full gap-3 border-foreground/15 text-base font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md"
              onClick={handleGoogleLogin}
              disabled={isOAuthLoading || isSendingMagicLink}
            >
              <GoogleIcon />
              {isOAuthLoading ? "Đang chuyển hướng..." : "Tiếp tục với Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-card px-3 text-muted-foreground">
                  hoặc dùng email
                </span>
              </div>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email của bạn
                </label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="ban@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSendingMagicLink || isOAuthLoading}
                  className="h-12 text-base"
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full bg-brand-green-deep text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-green-deep hover:shadow-brand"
                disabled={isSendingMagicLink || isOAuthLoading || !email}
              >
                {isSendingMagicLink ? "Đang gửi..." : "Gửi magic link"}
              </Button>
            </form>

            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Link
                href="/terms"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                điều khoản
              </Link>{" "}
              và{" "}
              <Link
                href="/privacy"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                quyền riêng tư
              </Link>{" "}
              của ReLoop.
            </p>
          </CardContent>
        </Card>

        <Link
          href="/"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Quay về trang chủ
        </Link>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}
