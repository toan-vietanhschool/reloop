import Link from "next/link"
import { notFound } from "next/navigation"

import { PhotoGrid } from "@/components/listings/PhotoGrid"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getIntentDescription, getIntentLabel, getMaterialMeta } from "@/lib/material"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

type ListingRow = Database["public"]["Tables"]["listings"]["Row"]
interface OwnerProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  city: string | null
  eco_points: number | null
}

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: rawListing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  // Cast through unknown — @supabase/ssr 0.5.2 narrows reads to `never`.
  const listing = (rawListing ?? null) as ListingRow | null

  if (error || !listing) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = user?.id === listing.owner_id

  if (
    !isOwner &&
    (listing.status === "removed" || listing.moderation_passed !== true)
  ) {
    notFound()
  }

  const { data: rawOwner } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, city, eco_points")
    .eq("id", listing.owner_id)
    .maybeSingle()
  const owner = (rawOwner ?? null) as OwnerProfile | null

  const material = getMaterialMeta(listing.material_code)
  const intentLabel = getIntentLabel(listing.intent)
  const intentDescription = getIntentDescription(listing.intent)

  const ownerName = owner?.display_name ?? "Người dùng ReLoop"
  const ownerInitials = getInitials(ownerName)

  // RLS hides owner emails — fall back to a static contact channel.
  // For MVP we open the user's mail client with a templated subject.
  const contactSubject = `[ReLoop] Quan tâm đến: ${listing.title}`
  const contactBody = `Chào ${ownerName},\n\nMình thấy bài đăng "${listing.title}" trên ReLoop và muốn liên hệ để trao đổi thêm.\n\nCảm ơn bạn!`
  const mailto = `mailto:?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(contactBody)}`

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/listings" className="hover:text-foreground">
          ← Tất cả listings
        </Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-[3fr_2fr]">
        <section>
          <PhotoGrid photos={listing.photos ?? []} alt={listing.title} />
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
              style={{ backgroundColor: material.color }}
            >
              {material.name_vi}
            </span>
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {intentLabel}
            </span>
            {listing.condition ? (
              <span
                aria-label={`Tình trạng ${listing.condition} sao`}
                className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs"
              >
                {"★".repeat(listing.condition)}
                <span className="text-muted-foreground">
                  {"★".repeat(5 - listing.condition)}
                </span>
              </span>
            ) : null}
            {!listing.moderation_passed && isOwner ? (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                Đang chờ kiểm duyệt
              </span>
            ) : null}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {listing.title}
          </h1>
          <p className="text-sm text-muted-foreground">{intentDescription}</p>

          {listing.city ? (
            <p className="text-sm text-muted-foreground">📍 {listing.city}</p>
          ) : null}

          {listing.description ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-lg border bg-card px-4 py-3 text-sm leading-relaxed">
              {listing.description}
            </div>
          ) : null}

          <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
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
              <div className="space-y-0.5">
                <CardTitle className="text-base">{ownerName}</CardTitle>
                {owner?.city ? (
                  <p className="text-xs text-muted-foreground">{owner.city}</p>
                ) : null}
              </div>
              {typeof owner?.eco_points === "number" ? (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  🌿 {owner.eco_points}
                </span>
              ) : null}
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <a
                href={mailto}
                className={buttonVariants({ className: "h-10" })}
              >
                Liên hệ
              </a>
              <Button
                type="button"
                variant="outline"
                className="h-10"
                disabled
                title="Tính năng báo cáo sẽ ra mắt sớm"
              >
                Báo cáo
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "RL"
  const parts = trimmed.split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "RL"
}
