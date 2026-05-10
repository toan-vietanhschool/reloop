import type { Metadata } from "next"
import Link from "next/link"
import { Camera, Map as MapIcon, ScanLine, ShoppingBag, Trophy } from "lucide-react"

import { SchoolPrompt } from "@/components/onboarding/SchoolPrompt"
import { getCurrentProfile } from "@/actions/auth"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

export const metadata: Metadata = {
  title: "Dashboard — ReLoop",
}

interface SchoolOption {
  code: string
  name_vi: string
  city: string
}

const POINTS_PER_LEVEL = 100
const RECENT_ACTIONS_LIMIT = 4

type EcoActionRow = Database["public"]["Tables"]["eco_actions"]["Row"]
type EcoActionKind = EcoActionRow["kind"]

interface KindCounts {
  scan: number
  listing_create: number
  vote: number
}

const KIND_LABEL: Record<EcoActionKind, string> = {
  scan: "Scan vật liệu",
  listing_create: "Đăng listing",
  vote: "Vote điểm thu gom",
}

function getKindLabel(kind: EcoActionKind): string {
  return KIND_LABEL[kind] ?? "Hoạt động"
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (diffSec < 60) return "vừa xong"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`
  const days = Math.floor(diffSec / 86400)
  return days === 1 ? "hôm qua" : `${days} ngày trước`
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  const displayName = profile?.display_name ?? "bạn"

  // Only fetch the schools list when we actually need to prompt — avoids an
  // unnecessary round-trip for users who already picked a school.
  const needsSchoolPrompt = profile !== null && profile.school === null
  let schools: SchoolOption[] = []
  if (needsSchoolPrompt) {
    const supabase = await createClient()
    const { data: rawSchools } = await supabase
      .from("schools")
      .select("code, name_vi, city")
      .order("name_vi", { ascending: true })
    schools = (rawSchools ?? []) as SchoolOption[]
  }

  // Fetch recent activity + counts. Skip the round-trip when we have no profile
  // (anonymous users already get redirected by the layout, but be defensive).
  let recentActions: Array<
    Pick<EcoActionRow, "id" | "kind" | "points_delta" | "created_at">
  > = []
  let counts: KindCounts = { scan: 0, listing_create: 0, vote: 0 }
  if (profile) {
    const supabase = await createClient()
    const [{ data: rawRecent }, { data: rawAll }] = await Promise.all([
      supabase
        .from("eco_actions")
        .select("id, kind, points_delta, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(RECENT_ACTIONS_LIMIT),
      supabase.from("eco_actions").select("kind").eq("user_id", profile.id),
    ])
    recentActions = ((rawRecent ?? []) as Array<
      Pick<EcoActionRow, "id" | "kind" | "points_delta" | "created_at">
    >) ?? []
    counts = ((rawAll ?? []) as Array<Pick<EcoActionRow, "kind">>).reduce<KindCounts>(
      (acc, row) => {
        if (row.kind === "scan") acc.scan += 1
        else if (row.kind === "listing_create") acc.listing_create += 1
        else if (row.kind === "vote") acc.vote += 1
        return acc
      },
      { scan: 0, listing_create: 0, vote: 0 },
    )
  }

  const ecoPoints = profile?.eco_points ?? 0
  const level = profile?.level ?? 1
  const previousThreshold = (level - 1) * POINTS_PER_LEVEL
  const nextThreshold = level * POINTS_PER_LEVEL
  const progressPct = Math.min(
    100,
    Math.max(
      0,
      ((ecoPoints - previousThreshold) /
        (nextThreshold - previousThreshold)) *
        100,
    ),
  )
  const pointsToNext = Math.max(0, nextThreshold - ecoPoints)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      {needsSchoolPrompt && schools.length > 0 ? (
        <SchoolPrompt schools={schools} />
      ) : null}

      {/* Greeting hero — branded panel with inline eco-points stat. */}
      <section
        aria-label="Chào mừng"
        className="relative mb-8 overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-6 py-7 shadow-sm md:px-9 md:py-9"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, oklch(70% 0.18 160 / 0.18), transparent 55%), radial-gradient(circle at 85% 75%, oklch(70% 0.18 220 / 0.18), transparent 55%)",
          }}
        />
        <div className="relative grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Hôm nay
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
              Chào mừng, {displayName}{" "}
              <span aria-hidden className="inline-block">
                🌱
              </span>
            </h1>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground md:text-base">
              Bắt đầu hành trình eco hôm nay nhé! Mỗi vòng quay là một bước thêm
              cho hành tinh.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Eco points
              </p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                Lv {level}
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
              {ecoPoints.toLocaleString("vi-VN")}
              <span className="ml-1 text-xs font-medium text-muted-foreground">
                pts
              </span>
            </p>
            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100/70"
              role="progressbar"
              aria-valuenow={Math.round(progressPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-[width] duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Còn {pointsToNext.toLocaleString("vi-VN")} pts để lên Lv{" "}
              {level + 1}
            </p>
          </div>
        </div>
      </section>

      {/* Action grid — bento composition: 1 hero (2-col span) + 2 medium + 1 accent. */}
      <section
        aria-label="Lối tắt"
        className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-[auto_auto]"
      >
        {/* Hero scan card — spans 2 cols + 2 rows on desktop. */}
        <Link
          href="/scan"
          className="group relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 md:col-span-2 md:row-span-2 md:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl"
          />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
                AI vision
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Quét vật liệu trong 5 giây
              </h2>
              <p className="mt-2 max-w-md text-sm text-white/85 md:text-[15px]">
                Chụp một tấm — AI nhận diện vật liệu và gợi ý vòng đời tiếp theo
                cho món đồ của bạn.
              </p>
            </div>
            <div className="flex items-end justify-between gap-4">
              <span className="inline-flex items-center gap-2 text-base font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-1 md:text-lg">
                Mở Scan
                <span aria-hidden>→</span>
              </span>
              <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur md:inline-flex">
                <ScanLine className="h-3.5 w-3.5" aria-hidden />
                +5 pts mỗi scan
              </span>
            </div>
            <ScanLine
              aria-hidden
              className="pointer-events-none absolute bottom-4 right-4 hidden h-32 w-32 text-white/15 md:block"
            />
          </div>
        </Link>

        {/* Listings card */}
        <Link
          href="/listings"
          className="group relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
        >
          <div className="flex h-full flex-col justify-between gap-4">
            <div>
              <ShoppingBag
                className="h-8 w-8 text-amber-700 transition-transform duration-300 group-hover:scale-110"
                aria-hidden
              />
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                Listings
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Cho — Đổi — Bán phế liệu trong khu vực.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition-transform duration-300 group-hover:translate-x-0.5">
              Khám phá <span aria-hidden>→</span>
            </span>
          </div>
        </Link>

        {/* Map card */}
        <Link
          href="/map"
          className="group relative overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          <div className="flex h-full flex-col justify-between gap-4">
            <div>
              <MapIcon
                className="h-8 w-8 text-sky-700 transition-transform duration-300 group-hover:scale-110"
                aria-hidden
              />
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                Bản đồ
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tìm điểm thu gom, sửa chữa, swap gần bạn.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-800 transition-transform duration-300 group-hover:translate-x-0.5">
              Xem bản đồ <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      </section>

      {/* Quick-stats strip — chip-style cards with brand accents. */}
      <section
        aria-label="Hoạt động của bạn"
        className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        <StatChip
          label="Scan"
          value={counts.scan}
          accent="emerald"
          icon={<Camera className="h-4 w-4" aria-hidden />}
        />
        <StatChip
          label="Listing"
          value={counts.listing_create}
          accent="amber"
          icon={<ShoppingBag className="h-4 w-4" aria-hidden />}
        />
        <StatChip
          label="Vote"
          value={counts.vote}
          accent="sky"
          icon={<MapIcon className="h-4 w-4" aria-hidden />}
        />
        <Link
          href="/leaderboard"
          className="group relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-2 text-violet-800">
            <Trophy className="h-4 w-4" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-wide">
              Bảng xếp hạng
            </p>
          </div>
          <p className="mt-1 text-base font-semibold tracking-tight">
            Xem hạng <span aria-hidden>→</span>
          </p>
        </Link>
      </section>

      {/* Recent activity */}
      <section aria-label="Hoạt động gần đây">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Hoạt động gần đây
          </h2>
          <Link
            href="/profile"
            className="text-xs font-medium text-emerald-700 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>
        {recentActions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-6 py-10 text-center">
            <span aria-hidden className="text-3xl">
              ✨
            </span>
            <p className="mt-3 text-sm font-medium">
              Chưa có hoạt động — bắt đầu nào!
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Quét một món đồ hoặc đăng tin tái sinh đầu tiên để mở khóa eco-points.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                href="/scan"
                className="inline-flex h-9 items-center rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Scan ngay
              </Link>
              <Link
                href="/listings/new"
                className="inline-flex h-9 items-center rounded-full border border-emerald-200 bg-white px-4 text-xs font-semibold text-emerald-800 shadow-sm hover:bg-emerald-50"
              >
                Đăng tin
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            {recentActions.map((action) => (
              <li
                key={action.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm"
                  >
                    {action.kind === "scan"
                      ? "📷"
                      : action.kind === "listing_create"
                        ? "🛍️"
                        : "👍"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {getKindLabel(action.kind)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {action.created_at ? formatRelative(action.created_at) : ""}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  +{action.points_delta}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

interface StatChipProps {
  label: string
  value: number
  accent: "emerald" | "amber" | "sky"
  icon: React.ReactNode
}

const ACCENT_CLASSES: Record<
  StatChipProps["accent"],
  { ring: string; iconText: string; gradient: string }
> = {
  emerald: {
    ring: "border-emerald-200",
    iconText: "text-emerald-700",
    gradient: "from-emerald-50 to-white",
  },
  amber: {
    ring: "border-amber-200",
    iconText: "text-amber-700",
    gradient: "from-amber-50 to-white",
  },
  sky: {
    ring: "border-sky-200",
    iconText: "text-sky-700",
    gradient: "from-sky-50 to-white",
  },
}

function StatChip({ label, value, accent, icon }: StatChipProps) {
  const c = ACCENT_CLASSES[accent]
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br px-4 py-3 shadow-sm ${c.ring} ${c.gradient}`}
    >
      <div className={`flex items-center gap-2 ${c.iconText}`}>
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums">
        {value.toLocaleString("vi-VN")}
      </p>
    </div>
  )
}
