"use client"

import Link from "next/link"
import type { ReactNode } from "react"

import { track } from "@/lib/analytics"
import { Button } from "@/components/ui/button"

interface HeroCtaProps {
  href: string
  cta: "scan" | "map"
  children: ReactNode
  variant?: "primary" | "outline"
}

/**
 * Client-side CTA wrapper for the landing hero. Fires `cta_clicked`
 * before navigation. Kept as a thin component so `HeroSection` itself
 * can stay a Server Component for streaming + SEO.
 */
export function HeroCta({
  href,
  cta,
  children,
  variant = "primary",
}: HeroCtaProps) {
  const className =
    variant === "primary"
      ? "h-12 rounded-full bg-white px-7 text-base font-semibold text-brand-green-deep shadow-lg shadow-black/15 transition hover:bg-white/95 hover:shadow-xl"
      : "h-12 rounded-full border-white/60 bg-white/0 px-7 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15 hover:text-white"

  return (
    <Button
      asChild
      size="lg"
      variant={variant === "primary" ? "default" : "outline"}
      className={className}
    >
      <Link
        href={href}
        onClick={() => {
          track("cta_clicked", { cta, location: "hero", href })
        }}
      >
        {children}
      </Link>
    </Button>
  )
}
