import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface PillarCardProps {
  icon: LucideIcon
  title: string
  description: string
  accent?: "green" | "blue" | "amber"
  /** Public path under /public/images/pillars/. */
  imageSrc?: string
  /** Optional href turning the card into a discoverable link. */
  href?: string
  /** Bento variant — `feature` spans 2 columns and renders larger on md+. */
  variant?: "feature" | "default"
}

const accentClasses: Record<NonNullable<PillarCardProps["accent"]>, string> = {
  green: "bg-brand-green/15 text-brand-green-deep ring-brand-green/30",
  blue: "bg-brand-blue/15 text-brand-blue-deep ring-brand-blue/30",
  amber: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
}

const accentBadge: Record<NonNullable<PillarCardProps["accent"]>, string> = {
  green: "text-brand-green-deep",
  blue: "text-brand-blue-deep",
  amber: "text-amber-700",
}

/**
 * Editorial pillar card. Image background fades in on hover (image opacity
 * +15%), card lifts (-translate-y-0.5) and gains shadow. The `feature`
 * variant is taller and spans 2 columns on md+ for the bento layout.
 */
export function PillarCard({
  icon: Icon,
  title,
  description,
  accent = "green",
  imageSrc,
  href,
  variant = "default",
}: PillarCardProps) {
  const isFeature = variant === "feature"
  const Wrapper = href ? Link : "article"
  const wrapperProps = href ? { href } : {}

  return (
    <Wrapper
      {...(wrapperProps as { href: string })}
      className={cn(
        "group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-3xl border border-foreground/8 bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-soft-lg",
        isFeature
          ? "min-h-[22rem] md:col-span-2 md:min-h-[26rem]"
          : "min-h-[18rem] md:min-h-[20rem]",
      )}
    >
      {/* Background image with low-opacity overlay */}
      {imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes={
              isFeature
                ? "(min-width: 768px) 66vw, 100vw"
                : "(min-width: 768px) 33vw, 100vw"
            }
            className="-z-10 object-cover opacity-25 transition duration-500 group-hover:opacity-40"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-t from-card via-card/85 to-card/40"
          />
        </>
      ) : null}

      <div className="flex flex-col gap-5 p-6 md:p-8">
        <span
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition group-hover:scale-105",
            accentClasses[accent],
          )}
          aria-hidden
        >
          <Icon className="h-6 w-6" strokeWidth={2} />
        </span>

        <div className="flex flex-col gap-2">
          <h3
            className={cn(
              "font-display font-semibold tracking-tight text-foreground",
              isFeature ? "text-2xl md:text-3xl" : "text-xl md:text-2xl",
            )}
          >
            {title}
          </h3>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {href ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-semibold transition group-hover:gap-2",
              accentBadge[accent],
            )}
          >
            Tìm hiểu
            <ArrowUpRight
              className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        ) : null}
      </div>
    </Wrapper>
  )
}
