import type { Metadata } from "next"
import Link from "next/link"

import { ListingCard } from "@/components/listings/ListingCard"
import { buttonVariants } from "@/components/ui/button"
import { MATERIAL_OPTIONS, INTENT_OPTIONS } from "@/lib/material"
import type { ListingIntent, MaterialCode } from "@/lib/material"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

type ListingRow = Database["public"]["Tables"]["listings"]["Row"]

export const revalidate = 120

export const metadata: Metadata = {
  title: "Listings tái sinh — ReLoop",
}

interface OwnerSummary {
  id: string
  display_name: string | null
  avatar_url: string | null
  eco_points: number | null
}

interface ListingsPageProps {
  searchParams: Promise<{
    material?: string
    intent?: string
    city?: string
  }>
}

const MATERIAL_CODES: ReadonlySet<string> = new Set(
  MATERIAL_OPTIONS.map((m) => m.code),
)
const INTENT_VALUES: ReadonlySet<string> = new Set(
  INTENT_OPTIONS.map((i) => i.value),
)

function parseMaterial(value: string | undefined): MaterialCode | null {
  if (!value) return null
  return MATERIAL_CODES.has(value) ? (value as MaterialCode) : null
}

function parseIntent(value: string | undefined): ListingIntent | null {
  if (!value) return null
  return INTENT_VALUES.has(value) ? (value as ListingIntent) : null
}

function buildFilterHref(params: {
  material?: string
  intent?: string
  city?: string
}): string {
  const search = new URLSearchParams()
  if (params.material) search.set("material", params.material)
  if (params.intent) search.set("intent", params.intent)
  if (params.city) search.set("city", params.city)
  const qs = search.toString()
  return qs ? `/listings?${qs}` : "/listings"
}

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const sp = await searchParams
  const activeMaterial = parseMaterial(sp.material)
  const activeIntent = parseIntent(sp.intent)
  const activeCity = sp.city?.trim() || null

  const supabase = await createClient()
  // The @supabase/ssr 0.5.2 generic narrows .select() returns to `never`
  // even with the Database generic supplied — cast through unknown to
  // recover the real row type. RLS still enforces filtering server-side.
  let query = supabase
    .from("listings")
    .select("*")
    .eq("moderation_passed", true)
    .neq("status", "removed")
    .order("created_at", { ascending: false })
    .limit(24)

  if (activeMaterial) query = query.eq("material_code", activeMaterial)
  if (activeIntent) query = query.eq("intent", activeIntent)
  if (activeCity) query = query.ilike("city", `%${activeCity}%`)

  const { data: rawListings, error } = await query
  const listings = (rawListings ?? null) as ListingRow[] | null

  let ownerMap: Record<string, OwnerSummary> = {}
  if (listings && listings.length > 0) {
    const ownerIds = Array.from(new Set(listings.map((l) => l.owner_id)))
    const { data: rawProfiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, eco_points")
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

  const hasFilters = Boolean(activeMaterial || activeIntent || activeCity)

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:py-10">
      {/* Page header */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Marketplace tái sinh
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Listings tái sinh
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground md:text-base">
            Cho — Đổi — Bán phế liệu trong cộng đồng ReLoop. Mỗi món tái sinh
            là một bước thêm cho hành tinh.
          </p>
        </div>
        <Link
          href="/listings/new"
          className={buttonVariants({
            size: "lg",
            className:
              "h-12 bg-emerald-600 px-6 text-base font-semibold text-white shadow-md hover:bg-emerald-700",
          })}
        >
          + Đăng tin mới
        </Link>
      </header>

      {/* Sticky filter bar — server-side filtering via search params, no JS needed. */}
      <div className="sticky top-16 z-20 -mx-4 mb-8 border-y border-border/60 bg-background/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="space-y-2.5">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Vật liệu
            </p>
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
              <FilterChip
                href={buildFilterHref({
                  intent: activeIntent ?? undefined,
                  city: activeCity ?? undefined,
                })}
                active={!activeMaterial}
              >
                Tất cả
              </FilterChip>
              {MATERIAL_OPTIONS.map((m) => (
                <FilterChip
                  key={m.code}
                  href={buildFilterHref({
                    material: m.code,
                    intent: activeIntent ?? undefined,
                    city: activeCity ?? undefined,
                  })}
                  active={activeMaterial === m.code}
                  color={m.color}
                >
                  {m.name_vi}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Ý định
              </p>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  href={buildFilterHref({
                    material: activeMaterial ?? undefined,
                    city: activeCity ?? undefined,
                  })}
                  active={!activeIntent}
                >
                  Tất cả
                </FilterChip>
                {INTENT_OPTIONS.map((i) => (
                  <FilterChip
                    key={i.value}
                    href={buildFilterHref({
                      material: activeMaterial ?? undefined,
                      intent: i.value,
                      city: activeCity ?? undefined,
                    })}
                    active={activeIntent === i.value}
                  >
                    {i.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <form
              action="/listings"
              method="get"
              className="ml-auto flex items-end gap-2"
            >
              {activeMaterial ? (
                <input
                  type="hidden"
                  name="material"
                  value={activeMaterial}
                />
              ) : null}
              {activeIntent ? (
                <input type="hidden" name="intent" value={activeIntent} />
              ) : null}
              <div>
                <label
                  htmlFor="city-filter"
                  className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Thành phố
                </label>
                <input
                  id="city-filter"
                  name="city"
                  defaultValue={activeCity ?? ""}
                  placeholder="VD: TP.HCM"
                  className="h-9 w-44 rounded-full border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="h-9 rounded-full bg-foreground px-4 text-xs font-semibold text-background shadow-sm transition-opacity hover:opacity-90"
              >
                Lọc
              </button>
              {hasFilters ? (
                <Link
                  href="/listings"
                  className="h-9 rounded-full border border-input bg-background px-4 text-xs font-semibold leading-9 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                >
                  Xóa lọc
                </Link>
              ) : null}
            </form>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Không tải được danh sách: {error.message}
        </div>
      ) : null}

      {!error && (!listings || listings.length === 0) ? (
        <EmptyState filtered={hasFilters} />
      ) : null}

      {listings && listings.length > 0 ? (
        <>
          <p className="mb-4 text-xs text-muted-foreground">
            {listings.length} bài đăng
            {hasFilters ? " phù hợp với bộ lọc" : ""}
          </p>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <li key={listing.id}>
                <ListingCard
                  listing={listing}
                  owner={ownerMap[listing.owner_id] ?? null}
                />
              </li>
            ))}
          </ul>
          {/* Pagination: deferred — current page caps at 24 and we lean on
              filters to narrow the set. Next refactor wave will add cursor paging. */}
        </>
      ) : null}
    </main>
  )
}

interface FilterChipProps {
  href: string
  active: boolean
  color?: string
  children: React.ReactNode
}

function FilterChip({ href, active, color, children }: FilterChipProps) {
  // Active chips lift, animate, and (when material) borrow the material's
  // brand colour as a left dot for instant visual recognition.
  return (
    <Link
      href={href}
      className={[
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
        active
          ? "border-foreground bg-foreground text-background shadow-md"
          : "border-input bg-background text-foreground hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-800",
      ].join(" ")}
    >
      {color ? (
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
      {children}
    </Link>
  )
}

interface EmptyStateProps {
  filtered: boolean
}

function EmptyState({ filtered }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/60 px-6 py-20 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, oklch(70% 0.18 160 / 0.12), transparent 50%), radial-gradient(circle at 80% 70%, oklch(70% 0.18 220 / 0.12), transparent 50%)",
        }}
      />
      <span aria-hidden className="text-6xl drop-shadow-sm">
        🌱
      </span>
      <h2 className="relative mt-5 text-xl font-semibold tracking-tight">
        {filtered
          ? "Không có bài đăng nào phù hợp"
          : "Chưa có bài đăng nào"}
      </h2>
      <p className="relative mt-2 max-w-md text-sm text-muted-foreground">
        {filtered
          ? "Thử bỏ bớt bộ lọc, hoặc đăng tin đầu tiên cho danh mục này — nhận eco-points cho mỗi món tái sinh."
          : "Hãy là người đầu tiên đăng món đồ tái chế của bạn — nhận eco-points cho mỗi món tái sinh."}
      </p>
      <div className="relative mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/listings/new"
          className={buttonVariants({
            size: "lg",
            className:
              "h-11 bg-emerald-600 px-6 text-white shadow-md hover:bg-emerald-700",
          })}
        >
          {filtered ? "Đăng tin mới" : "Đăng tin đầu tiên"}
        </Link>
        {filtered ? (
          <Link
            href="/listings"
            className={buttonVariants({
              size: "lg",
              variant: "outline",
              className: "h-11 px-6",
            })}
          >
            Xóa bộ lọc
          </Link>
        ) : null}
      </div>
    </div>
  )
}
