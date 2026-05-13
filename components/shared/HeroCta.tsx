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
      ? "h-12 rounded-full bg-lime px-7 text-base font-semibold text-navy shadow-brand transition hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
      : "h-12 rounded-full border border-white/40 bg-transparent px-7 text-base font-semibold text-white transition hover:bg-white/10 hover:border-white/60"

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
