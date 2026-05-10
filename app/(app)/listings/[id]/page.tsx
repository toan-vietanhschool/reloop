import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getMaterialFallbackImage } from "@/components/listings/ListingCard"
import { ListingViewTracker } from "@/components/listings/ListingViewTracker"
import { PhotoGrid } from "@/components/listings/PhotoGrid"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  getIntentDescription,
  getIntentLabel,
  getMaterialMeta,
} from "@/lib/material"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

type ListingRow = Database["public"]["Tables"]["listings"]["Row"]
interface OwnerProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  city: string | null
  eco_points: number | null
  level: number | null
}

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("listings")
    .select("title")
    .eq("id", id)
    .maybeSingle<{ title: string }>()
  // Fallback when the listing is missing or RLS hides it from anon —
  // the page itself will then 404 / strip private content. We never
  // want to leak the unfound-id back into the title bar.
  const title = data?.title?.trim()
  return {
    title: title ? `${title} — ReLoop` : "Listing — ReLoop",
  }
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
    .select("id, display_name, avatar_url, city, eco_points, level")
    .eq("id", listing.owner_id)
    .maybeSingle()
  const owner = (rawOwner ?? null) as OwnerProfile | null

  const material = getMaterialMeta(listing.material_code)
  const intentLabel = getIntentLabel(listing.intent)
  const intentDescription = getIntentDescription(listing.intent)
  const fallbackImage = getMaterialFallbackImage(listing.material_code)

  const ownerName = owner?.display_name ?? "Người dùng ReLoop"
  const ownerInitials = getInitials(ownerName)

  // RLS hides owner emails — fall back to a static contact channel.
  // For MVP we open the user's mail client with a templated subject.
  const contactSubject = `[ReLoop] Quan tâm đến: ${listing.title}`
  const contactBody = `Chào ${ownerName},\n\nMình thấy bài đăng "${listing.title}" trên ReLoop và muốn liên hệ để trao đổi thêm.\n\nCảm ơn bạn!`
  const mailto = `mailto:?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(contactBody)}`

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <ListingViewTracker
        listingId={listing.id}
        materialCode={listing.material_code}
        intent={listing.intent}
      />

      {/* Breadcrumb — keeps users oriented and improves SEO crawl signals. */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link href="/listings" className="hover:text-foreground">
          Listings
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/listings?material=${listing.material_code}`}
          className="hover:text-foreground"
        >
          {material.name_vi}
        </Link>
        <span aria-hidden>/</span>
        <span className="line-clamp-1 max-w-[16rem] text-foreground">
          {listing.title}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <section className="space-y-6">
          <PhotoGrid
            photos={listing.photos ?? []}
            alt={listing.title}
            fallbackSrc={fallbackImage}
            fallbackColor={material.color}
            fallbackLabel={material.name_vi}
          />

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm ring-1 ring-white/20"
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
                  <span className="text-amber-500">
                    {"★".repeat(listing.condition)}
                  </span>
                  <span className="text-muted-foreground/40">
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

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {listing.title}
            </h1>
            <p className="text-sm font-medium text-emerald-700">
              {intentDescription}
            </p>

            {listing.city ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span aria-hidden>📍</span>
                {listing.city}
              </p>
            ) : null}

            {listing.description ? (
              <article className="max-w-prose whitespace-pre-wrap rounded-2xl border border-border/60 bg-card px-5 py-4 text-[15px] leading-relaxed text-foreground/90 shadow-sm">
                {listing.description}
              </article>
            ) : (
              <p className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
                Người đăng chưa thêm mô tả chi tiết. Hãy liên hệ trực tiếp để
                hỏi thêm thông tin.
              </p>
            )}
          </div>

          {/* Related listings placeholder — wire up in next refactor wave. */}
          <section
            aria-label="Listings liên quan"
            className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-5 py-6 text-sm text-muted-foreground"
          >
            <p className="font-medium text-foreground">
              Listings cùng vật liệu sắp có
            </p>
            <p className="mt-1 text-xs">
              Tính năng gợi ý món tương tự sẽ ra mắt trong bản kế tiếp.
            </p>
          </section>
        </section>

        {/* Sticky sidebar — owner card + actions */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50/60 via-white to-white shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-base font-bold text-emerald-800 ring-2 ring-emerald-200/50">
                  {owner?.avatar_url ? (
                    <Image
                      src={owner.avatar_url}
                      alt=""
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    ownerInitials
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-foreground">
                    {ownerName}
                  </p>
                  {owner?.city ? (
                    <p className="text-xs text-muted-foreground">
                      📍 {owner.city}
                    </p>
                  ) : null}
                </div>
              </div>

              {(typeof owner?.eco_points === "number" ||
                typeof owner?.level === "number") && (
                <div className="flex items-center gap-2">
                  {typeof owner?.level === "number" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200/60">
                      Lv {owner.level}
                    </span>
                  ) : null}
                  {typeof owner?.eco_points === "number" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200/60">
                      <span aria-hidden>🌿</span>
                      {owner.eco_points.toLocaleString("vi-VN")} pts
                    </span>
                  ) : null}
                </div>
              )}

              <a
                href={mailto}
                className={buttonVariants({
                  className:
                    "h-11 w-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700",
                })}
              >
                ✉️ Liên hệ qua email
              </a>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  disabled
                  title="Tính năng đánh dấu quan tâm sẽ ra mắt sớm"
                >
                  ★ Quan tâm
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  disabled
                  title="Tính năng báo cáo sẽ ra mắt sớm"
                >
                  Báo cáo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="space-y-3 p-5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mẹo an toàn
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>• Hẹn gặp ở nơi công cộng vào ban ngày.</li>
                <li>• Kiểm tra món đồ kỹ trước khi nhận.</li>
                <li>• Không chuyển khoản cọc trước khi gặp mặt.</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
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
