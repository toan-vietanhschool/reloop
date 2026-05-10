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

  const { data: profileRows, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", flaggedIds)
    .limit(500)

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
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-700">
            <ShieldAlert className="size-3" aria-hidden />
            An toàn cộng đồng
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            Người dùng vi phạm
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Người dùng có ≥ {REJECTED_THRESHOLD} bài bị AI từ chối. Cấm sẽ
            đánh dấu hồ sơ — Phase 2 sẽ chặn đăng nhập.
          </p>
        </div>
      </div>

      <AdminTabs tabs={tabs} activeHref="/admin/users" />

      {flagged.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[760px] table-fixed text-sm">
            <thead>
              <tr className="border-b border-amber-200 bg-gradient-to-r from-amber-50/80 to-amber-100/40 text-left">
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Tên
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Thành phố
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Bài bị từ chối
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Eco điểm
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Đăng ký
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Trạng thái
                </th>
                <th className="px-3 py-2.5" aria-label="Hành động" />
              </tr>
            </thead>
            <tbody>
              {flagged.map(({ profile, rejectedCount }, i) => {
                const isBanned = Boolean(profile.banned_at)
                return (
                  <tr
                    key={profile.id}
                    className={`border-t border-border/70 transition-colors hover:bg-amber-50/60 ${
                      i % 2 === 1 ? "bg-amber-50/30" : "bg-white"
                    }`}
                  >
                    <td className="max-w-[220px] px-3 py-3 align-top">
                      <p className="font-semibold leading-snug">
                        {profile.display_name}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                        {profile.id}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-slate-700">
                      {profile.city ?? "—"}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 ring-1 ring-rose-200">
                        <span className="tabular-nums">{rejectedCount}</span>
                        bài
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top text-xs font-semibold tabular-nums text-foreground/80">
                      {profile.eco_points}
                    </td>
                    <td className="px-3 py-3 align-top text-xs text-muted-foreground">
                      {formatDate(profile.created_at)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      {isBanned ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 ring-1 ring-rose-200">
                          Đã cấm
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
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
                      <div className="flex justify-end">
                        <BanUserButton
                          userId={profile.id}
                          displayName={profile.display_name}
                          alreadyBanned={isBanned}
                        />
                      </div>
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

function EmptyState() {
  return (
    <div className="relative isolate flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-6 py-16 text-center shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-emerald-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-12 size-56 rounded-full bg-sky-200/40 blur-3xl"
      />
      <div className="relative">
        <span
          aria-hidden
          className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm ring-2 ring-emerald-200"
        >
          <UserX className="size-7" />
        </span>
      </div>
      <div className="relative space-y-1">
        <h2 className="text-lg font-bold text-emerald-900">
          Không có người dùng nào cần xử lý
        </h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Mọi người đang đăng tin lành mạnh — cộng đồng ReLoop healthy 💚
        </p>
      </div>
    </div>
  )
}
