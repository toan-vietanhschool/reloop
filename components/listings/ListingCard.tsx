import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { getIntentLabel, getMaterialMeta } from "@/lib/material"
import type { Database } from "@/types/database.types"

type ListingRow = Database["public"]["Tables"]["listings"]["Row"]

interface OwnerSummary {
  display_name: string | null
  avatar_url: string | null
}

interface ListingCardProps {
  listing: ListingRow
  owner?: OwnerSummary | null
}

export function ListingCard({ listing, owner }: ListingCardProps) {
  const material = getMaterialMeta(listing.material_code)
  const photo = listing.photos?.[0] ?? null
  const intentLabel = getIntentLabel(listing.intent)
  const ownerName = owner?.display_name ?? "Người dùng ReLoop"
  const ownerInitials = getInitials(ownerName)

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full items-center justify-center text-4xl"
            >
              ♻️
            </div>
          )}
          <span
            aria-label={`Vật liệu ${material.name_vi}`}
            className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white shadow-sm"
            style={{ backgroundColor: material.color }}
          >
            {material.name_vi}
          </span>
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
            {intentLabel}
          </span>
        </div>

        <CardContent className="space-y-2 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            {listing.title}
          </h3>
          {listing.city ? (
            <p className="text-xs text-muted-foreground">📍 {listing.city}</p>
          ) : null}

          <div className="flex items-center gap-2 pt-1">
            <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
              {owner?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={owner.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                ownerInitials
              )}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {ownerName}
            </span>
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
