import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Camera,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  ThumbsUp,
} from "lucide-react"

import { getCurrentProfile } from "@/actions/auth"
import { ActivityItem } from "@/components/profile/ActivityItem"
import { BadgeGrid } from "@/components/profile/BadgeGrid"
import { EcoPointsBadge } from "@/components/profile/EcoPointsBadge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Hồ sơ — ReLoop",
}

type EcoActionRow = Database["public"]["Tables"]["eco_actions"]["Row"]

const POINTS_PER_LEVEL = 100
const RECENT_ACTIONS_LIMIT = 5

interface KindStats {
  scan: number
  listing_create: number
  vote: number
}

function emptyStats(): KindStats {
  return { scan: 0, listing_create: 0, vote: 0 }
}

function getInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "🌱"
  return (trimmed[0] ?? "").toUpperCase()
}

export default async function ProfilePage() {
  const profile = await getCurrentProfile()
  if (!profile) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  const { data: recentActions } = await supabase
    .from("eco_actions")
    .select("id, kind, points_delta, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(RECENT_ACTIONS_LIMIT)

  const recent: Array<
    Pick<EcoActionRow, "id" | "kind" | "points_delta" | "created_at">
  > = ((recentActions ?? []) as Array<
    Pick<EcoActionRow, "id" | "kind" | "points_delta" | "created_at">
  >) ?? []

  // Aggregate counts by kind for the stat cards (cheap: max few hundred
  // rows per active user). For high-volume users we'd want a materialized
  // view, but in MVP a simple group-by select is fine.
  const { data: allKinds } = await supabase
    .from("eco_actions")
    .select("kind")
    .eq("user_id", profile.id)

  const stats: KindStats = ((allKinds ?? []) as Array<Pick<EcoActionRow, "kind">>)
    .reduce<KindStats>((acc, row) => {
      if (row.kind === "scan") acc.scan += 1
      else if (row.kind === "listing_create") acc.listing_create += 1
      else if (row.kind === "vote") acc.vote += 1
      return acc
    }, emptyStats())

  const previousLevelThreshold = (profile.level - 1) * POINTS_PER_LEVEL
  const pointsInLevel = Math.max(0, profile.eco_points - previousLevelThreshold)

  const initial = getInitial(profile.display_name)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 md:pt-10">
      {/* HERO PANEL --------------------------------------------------- */}
      <section
        aria-label="Thông tin cá nhân"
        className="relative isolate mb-10 overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-card shadow-soft-lg"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-90"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-emerald-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 size-72 rounded-full bg-sky-200/40 blur-3xl"
        />

        <div className="relative grid gap-6 px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[auto_1fr_auto] md:items-center">
          {/* Avatar with double ring */}
          <div className="relative mx-auto md:mx-0">
            <div
              aria-hidden
              className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 blur-md"
            />
            <span className="relative flex size-28 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-4xl font-extrabold text-emerald-800 shadow-soft-lg ring-4 ring-white sm:size-32">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt=""
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </span>
            <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow ring-2 ring-emerald-200">
              Lv {profile.level}
            </span>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Thành viên ReLoop
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {profile.display_name}
            </h1>
            {profile.bio ? (
              <p className="mx-auto max-w-prose text-sm text-foreground/80 md:mx-0">
                {profile.bio}
              </p>
            ) : (
              <p className="mx-auto max-w-prose text-sm italic text-muted-foreground md:mx-0">
                Chưa có giới thiệu — kể cho mọi người về hành trình eco của
                bạn nhé.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              {profile.city ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 backdrop-blur">
                  <MapPin className="size-3" aria-hidden />
                  {profile.city}
                </span>
              ) : null}
              {profile.school ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-200 backdrop-blur">
                  <GraduationCap className="size-3" aria-hidden />
                  {profile.school}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <Button asChild variant="outline" className="shadow-sm">
              <Link href="/profile/edit">
                <Pencil className="size-4" aria-hidden />
                Sửa hồ sơ
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ECO POINTS HERO + STATS GRID ------------------------------- */}
      <section className="mb-10 grid gap-5 md:grid-cols-[1.05fr_1fr]">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50/60 to-sky-50/60 px-6 py-8 shadow-soft-lg">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 top-4 size-48 rounded-full bg-emerald-200/50 blur-3xl"
          />
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Tiến độ Level {profile.level}
          </p>
          <div className="mt-4">
            <EcoPointsBadge
              points={profile.eco_points}
              level={profile.level}
              pointsInLevel={pointsInLevel}
              pointsPerLevel={POINTS_PER_LEVEL}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-1">
          <StatLinkCard
            label="Tổng scan"
            value={stats.scan}
            href="/scan"
            cta="Scan tiếp"
            accent="emerald"
            icon={<Camera className="size-4" aria-hidden />}
          />
          <StatLinkCard
            label="Tổng listing"
            value={stats.listing_create}
            href="/listings"
            cta="Quản lý"
            accent="amber"
            icon={<Plus className="size-4" aria-hidden />}
          />
          <StatLinkCard
            label="Tổng vote"
            value={stats.vote}
            href="/map"
            cta="Mở bản đồ"
            accent="sky"
            icon={<ThumbsUp className="size-4" aria-hidden />}
          />
        </div>
      </section>

      {/* BADGES ----------------------------------------------------- */}
      <div className="mb-10">
        <BadgeGrid userId={profile.id} />
      </div>

      {/* ACTIVITY TIMELINE ----------------------------------------- */}
      <section aria-label="Hoạt động gần đây" className="space-y-4">
        <header className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Nhật ký
            </p>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
              Hoạt động gần đây
            </h2>
          </div>
        </header>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/40 px-6 py-12 text-center">
            <span aria-hidden className="text-4xl float-slow">
              ✨
            </span>
            <h3 className="text-base font-semibold text-emerald-900">
              Chưa có hoạt động nào
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Hãy bắt đầu bằng cách quét một món đồ hoặc đăng tin tái sinh
              đầu tiên — bạn sẽ được +5 eco-points ngay lập tức.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/scan">Scan ngay</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/listings/new">Đăng listing</Link>
              </Button>
            </div>
          </div>
        ) : (
          <ul className="relative">
            {recent.map((action, i) => (
              <ActivityItem
                key={action.id}
                kind={action.kind}
                pointsDelta={action.points_delta}
                createdAt={action.created_at}
                showRail={i < recent.length - 1}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

interface StatLinkCardProps {
  label: string
  value: number
  href: string
  cta: string
  accent: "emerald" | "amber" | "sky"
  icon: React.ReactNode
}

const STAT_ACCENT: Record<
  StatLinkCardProps["accent"],
  { ring: string; bg: string; iconBg: string; iconText: string; cta: string }
> = {
  emerald: {
    ring: "ring-emerald-200",
    bg: "from-emerald-50 to-white",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    cta: "text-emerald-700 hover:text-emerald-900",
  },
  amber: {
    ring: "ring-amber-200",
    bg: "from-amber-50 to-white",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    cta: "text-amber-700 hover:text-amber-900",
  },
  sky: {
    ring: "ring-sky-200",
    bg: "from-sky-50 to-white",
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
    cta: "text-sky-700 hover:text-sky-900",
  },
}

function StatLinkCard({
  label,
  value,
  href,
  cta,
  accent,
  icon,
}: StatLinkCardProps) {
  const c = STAT_ACCENT[accent]
  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-between gap-3 rounded-2xl bg-gradient-to-br p-4 shadow-sm ring-1 transition-all hover:-translate-y-0.5 hover:shadow-soft-lg ${c.bg} ${c.ring}`}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`flex size-8 items-center justify-center rounded-lg ${c.iconBg} ${c.iconText}`}
        >
          {icon}
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
          {label}
        </p>
      </div>
      <p className="text-3xl font-extrabold tabular-nums tracking-tight">
        {value.toLocaleString("vi-VN")}
      </p>
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold transition-transform group-hover:translate-x-1 ${c.cta}`}
      >
        {cta} <span aria-hidden>→</span>
      </span>
    </Link>
  )
}
