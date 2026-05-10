import Image from "next/image"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { getIntentLabel, getMaterialMeta } from "@/lib/material"
import type { Database } from "@/types/database.types"
import type { MaterialCode } from "@/lib/material"

type ListingRow = Database["public"]["Tables"]["listings"]["Row"]

interface OwnerSummary {
  display_name: string | null
  avatar_url: string | null
  eco_points?: number | null
}

interface ListingCardProps {
  listing: ListingRow
  owner?: OwnerSummary | null
}

/**
 * Maps a MaterialCode to its bundled fallback image. The 16 assets are
 * shipped in /public/images/materials and named after the lowercase enum
 * value (PET → pet.jpg, OTHER_PLASTIC → other-plastic.jpg, etc.). When a
 * listing has no user-uploaded photo we render this instead of the old
 * ♻️ emoji so the card never looks empty.
 */
export function getMaterialFallbackImage(code: MaterialCode): string {
  const slug = code.toLowerCase().replace(/_/g, "-")
  return `/images/materials/${slug}.jpg`
}

export function ListingCard({ listing, owner }: ListingCardProps) {
  const material = getMaterialMeta(listing.material_code)
  const photo = listing.photos?.[0] ?? null
  const fallback = getMaterialFallbackImage(listing.material_code)
  const intentLabel = getIntentLabel(listing.intent)
  const ownerName = owner?.display_name ?? "Người dùng ReLoop"
  const ownerInitials = getInitials(ownerName)
  const imageSrc = photo ?? fallback
  const isFallback = !photo

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden border-border/70 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-emerald-200 group-hover:shadow-[0_16px_40px_-12px_oklch(70%_0.18_160_/_0.25)]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-sky-50">
          <Image
            src={imageSrc}
            alt={isFallback ? `Vật liệu ${material.name_vi}` : listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
          {/* Subtle dark veil on hover for chip legibility — pointer-events-none so
              the link still receives focus/click without interruption. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90"
          />

          <span
            aria-label={`Vật liệu ${material.name_vi}`}
            className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md ring-1 ring-white/20"
            style={{ backgroundColor: material.color }}
          >
            {material.name_vi}
          </span>
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-md backdrop-blur">
            {intentLabel}
          </span>

          {listing.city ? (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              <span aria-hidden>📍</span>
              {listing.city}
            </span>
          ) : null}
        </div>

        <CardContent className="space-y-3 p-4">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {listing.title}
          </h3>

          <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200/50">
                {owner?.avatar_url ? (
                  <Image
                    src={owner.avatar_url}
                    alt=""
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  ownerInitials
                )}
              </span>
              <span className="truncate text-xs font-medium text-muted-foreground">
                {ownerName}
              </span>
            </div>
            {typeof owner?.eco_points === "number" ? (
              <span
                aria-label={`${owner.eco_points} eco-points`}
                className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
              >
                <span aria-hidden>🌿</span>
                {owner.eco_points.toLocaleString("vi-VN")}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "RL"
  const parts = trimmed.split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "RL"
}
