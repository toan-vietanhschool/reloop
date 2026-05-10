import type { Metadata } from "next"
import { ShieldAlert, UserX } from "lucide-react"

import { AdminTabs } from "@/components/admin/AdminTabs"
import { BanUserButton } from "@/components/admin/BanUserButton"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

export const metadata: Metadata = {
  title: "Người dùng vi phạm — ReLoop Admin",
}

export const dynamic = "force-dynamic"

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

interface FlaggedUser {
  profile: ProfileRow
  rejectedCount: number
}

const REJECTED_THRESHOLD = 3

async function fetchFlaggedUsers(): Promise<FlaggedUser[]> {
  const supabase = await createClient()

  // Step 1: count rejected listings per owner. We use a simple
  // aggregate in TS rather than a SQL `having` clause because the
  // PostgREST select API does not support HAVING directly. The data
  // volume during MVP demo is bounded (~30 listings) so this is cheap.
  // AUDIT: capped at 500 for safety; replace with SQL view in T3 cleanup
  const { data: rejectedRows, error: listingsError } = await supabase
    .from("listings")
    .select("owner_id")
    .eq("moderation_passed", false)
    .limit(500)

  if (listingsError || !rejectedRows) return []

  const counts = new Map<string, number>()
  for (const row of rejectedRows as Array<{ owner_id: string }>) {
    counts.set(row.owner_id, (counts.get(row.owner_id) ?? 0) + 1)
  }

  const flaggedIds = Array.from(counts.entries())
    .filter(([, count]) => count >= REJECTED_THRESHOLD)
    .map(([id]) => id)

  if (flaggedIds.length === 0) return []

  // Step 2: fetch profile details for the flagged ids in a single
  // round-trip. RLS already permits public read of profile fields.
  const { data: profileRows, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", flaggedIds)

  if (profilesError || !profileRows) return []

  const profiles = profileRows as ProfileRow[]
  return profiles
    .map((profile) => ({
      profile,
      rejectedCount: counts.get(profile.id) ?? 0,
    }))
    .sort((a, b) => b.rejectedCount - a.rejectedCount)
}

interface CountSummary {
  pendingListings: number
  pendingPoints: number
  flaggedUsers: number
}

async function fetchCounts(flaggedCount: number): Promise<CountSummary> {
  const supabase = await createClient()

  const [pendingListings, pendingPoints] = await Promise.all([
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("moderation_passed", false)
      .neq("status", "removed"),
    supabase
      .from("collection_points")
      .select("id", { count: "exact", head: true })
      .eq("verified", false),
  ])

  return {
    pendingListings: pendingListings.count ?? 0,
    pendingPoints: pendingPoints.count ?? 0,
    flaggedUsers: flaggedCount,
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const ts = new Date(iso).getTime()
  if (Number.isNaN(ts)) return "—"
  return new Date(ts).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export default async function AdminUsersPage() {
  const flagged = await fetchFlaggedUsers()
  const counts = await fetchCounts(flagged.length)

  const tabs = [
    {
      href: "/admin/moderation",
      label: "Bài đăng",
      count: counts.pendingListings,
    },
    {
      href: "/admin/points",
      label: "Điểm thu gom",
      count: counts.pendingPoints,
    },
    {
      href: "/admin/users",
      label: "Người dùng",
      count: counts.flaggedUsers,
    },
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <ShieldAlert className="h-5 w-5 text-rose-700" aria-hidden />
            Người dùng vi phạm
          </h1>
          <p className="text-sm text-muted-foreground">
            Người dùng có ≥ {REJECTED_THRESHOLD} bài bị AI từ chối. Cấm sẽ đánh
            dấu hồ sơ — Phase 2 sẽ chặn đăng nhập.
          </p>
        </div>
      </div>

      <AdminTabs tabs={tabs} activeHref="/admin/users" />

      {flagged.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-emerald-300 bg-white px-6 py-16 text-center">
          <div
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
          >
            <UserX className="h-7 w-7" />
          </div>
          <h2 className="text-base font-semibold text-emerald-900">
            Không có người dùng nào cần xử lý
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Mọi người đang đăng tin lành mạnh.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[760px] table-fixed text-sm">
            <thead>
              <tr className="border-b border-border bg-amber-50/40 text-left">
                <th className="px-3 py-2 font-medium">Tên</th>
                <th className="px-3 py-2 font-medium">Thành phố</th>
                <th className="px-3 py-2 font-medium">Bài bị từ chối</th>
                <th className="px-3 py-2 font-medium">Eco điểm</th>
                <th className="px-3 py-2 font-medium">Đăng ký</th>
                <th className="px-3 py-2 font-medium">Trạng thái</th>
                <th className="px-3 py-2" aria-label="Hành động" />
              </tr>
            </thead>
            <tbody>
              {flagged.map(({ profile, rejectedCount }) => {
                const isBanned = Boolean(profile.banned_at)
                return (
                  <tr key={profile.id} className="border-t border-border/70">
                    <td className="max-w-[220px] px-3 py-3 align-top">
                      <p className="font-medium leading-snug">
                        {profile.display_name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {profile.id}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-slate-700">
                      {profile.city ?? "—"}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                        {rejectedCount}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-slate-700">
                      {profile.eco_points}
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-muted-foreground">
                      {formatDate(profile.created_at)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      {isBanned ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-800">
                          Đã cấm
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                          Hoạt động
                        </span>
                      )}
                      {profile.banned_reason ? (
                        <p className="mt-1 max-w-[180px] truncate text-[11px] text-muted-foreground">
                          {profile.banned_reason}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <BanUserButton
                        userId={profile.id}
                        displayName={profile.display_name}
                        alreadyBanned={isBanned}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
