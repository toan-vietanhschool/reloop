import Link from "next/link"

import { ListingCard } from "@/components/listings/ListingCard"
import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

type ListingRow = Database["public"]["Tables"]["listings"]["Row"]

export const dynamic = "force-dynamic"

interface OwnerSummary {
  id: string
  display_name: string | null
  avatar_url: string | null
}

export default async function ListingsPage() {
  const supabase = await createClient()
  // The @supabase/ssr 0.5.2 generic narrows .select() returns to `never`
  // even with the Database generic supplied — cast through unknown to
  // recover the real row type. RLS still enforces filtering server-side.
  const { data: rawListings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("moderation_passed", true)
    .neq("status", "removed")
    .order("created_at", { ascending: false })
    .limit(20)
  const listings = (rawListings ?? null) as ListingRow[] | null

  let ownerMap: Record<string, OwnerSummary> = {}
  if (listings && listings.length > 0) {
    const ownerIds = Array.from(new Set(listings.map((l) => l.owner_id)))
    const { data: rawProfiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", ownerIds)
    const profiles = (rawProfiles ?? []) as OwnerSummary[]
    ownerMap = profiles.reduce<Record<string, OwnerSummary>>(
      (acc, profile) => {
        acc[profile.id] = profile
        return acc
      },
      {},
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Listings tái sinh
          </h1>
          <p className="mt-2 text-muted-foreground">
            Khám phá đồ tái chế trong khu vực — cho, đổi, bán phế liệu, hoặc cần tìm.
          </p>
        </div>
        <Link
          href="/listings/new"
          className={buttonVariants({ size: "lg", className: "h-11 px-5" })}
        >
          + Đăng tin mới
        </Link>
      </header>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Không tải được danh sách: {error.message}
        </div>
      ) : null}

      {!error && (!listings || listings.length === 0) ? (
        <EmptyState />
      ) : null}

      {listings && listings.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <li key={listing.id}>
              <ListingCard
                listing={listing}
                owner={ownerMap[listing.owner_id] ?? null}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center">
      <span aria-hidden className="text-5xl">
        🌱
      </span>
      <h2 className="mt-4 text-lg font-semibold">Chưa có bài đăng nào</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Hãy là người đầu tiên đăng món đồ tái chế của bạn — nhận eco-points cho mỗi
        món tái sinh.
      </p>
      <Link
        href="/listings/new"
        className={buttonVariants({ size: "lg", className: "mt-6 h-11 px-6" })}
      >
        Đăng tin đầu tiên
      </Link>
    </div>
  )
}
