import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/actions/auth"
import { ActivityItem } from "@/components/profile/ActivityItem"
import { BadgeGrid } from "@/components/profile/BadgeGrid"
import { EcoPointsBadge } from "@/components/profile/EcoPointsBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

  const nextLevelThreshold = profile.level * POINTS_PER_LEVEL
  const previousLevelThreshold = (profile.level - 1) * POINTS_PER_LEVEL
  const pointsToNext = Math.max(0, nextLevelThreshold - profile.eco_points)
  const progressPct = Math.min(
    100,
    Math.max(
      0,
      ((profile.eco_points - previousLevelThreshold) /
        (nextLevelThreshold - previousLevelThreshold)) *
        100,
    ),
  )

  const initial = getInitial(profile.display_name)

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12">
      <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-3xl font-bold text-emerald-800 ring-2 ring-emerald-200"
            aria-hidden
          >
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {profile.display_name}
            </h1>
            {profile.bio ? (
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                {profile.bio}
              </p>
            ) : null}
            {profile.city ? (
              <p className="mt-1 text-xs text-muted-foreground">
                📍 {profile.city}
              </p>
            ) : null}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/profile/edit">Sửa hồ sơ</Link>
        </Button>
      </header>

      <Card className="mb-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="flex flex-col gap-4 p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Eco points
          </p>
          <EcoPointsBadge
            points={profile.eco_points}
            level={profile.level}
          />
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-[width] duration-700"
                style={{ width: `${progressPct}%` }}
                aria-hidden
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Còn {pointsToNext.toLocaleString("vi-VN")} / {POINTS_PER_LEVEL}{" "}
              point để lên Level {profile.level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      <section
        aria-label="Thống kê"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard label="Tổng scan" value={stats.scan} />
        <StatCard label="Tổng listing" value={stats.listing_create} />
        <StatCard label="Tổng vote" value={stats.vote} />
      </section>

      <div className="mb-8">
        <BadgeGrid userId={profile.id} />
      </div>

      <section aria-label="Hoạt động gần đây">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Hoạt động gần đây
        </h2>
        {recent.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
            Chưa có hoạt động nào — hãy bắt đầu bằng cách quét một món đồ hoặc
            đăng tin tái sinh đầu tiên!
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((action) => (
              <ActivityItem
                key={action.id}
                kind={action.kind}
                pointsDelta={action.points_delta}
                createdAt={action.created_at}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

interface StatCardProps {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-3xl font-bold tabular-nums">
          {value.toLocaleString("vi-VN")}
        </p>
      </CardContent>
    </Card>
  )
}
