import type { Metadata } from "next"
import { MapPin, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react"

import { verifyCollectionPoint } from "@/actions/collection-points"
import { AdminTabs } from "@/components/admin/AdminTabs"
import { Button } from "@/components/ui/button"
import { formatRelative } from "@/lib/format-relative"
import { getMaterialMeta } from "@/lib/material"
import { pointTypeLabelVi } from "@/lib/map-utils"
import { createClient } from "@/lib/supabase/server"
import type {
  CollectionPoint,
  MaterialCode,
} from "@/lib/map-utils"

export const metadata: Metadata = {
  title: "Điểm thu gom — ReLoop Admin",
}

interface PendingPointRow extends CollectionPoint {
  contributor_name: string | null
}

async function fetchPendingPoints(): Promise<PendingPointRow[]> {
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from("collection_points")
    .select("*")
    .eq("verified", false)
    .order("upvotes", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50)

  if (error || !rows) return []

  const points = rows as CollectionPoint[]
  const contributorIds = Array.from(
    new Set(
      points
        .map((p) => p.contributed_by)
        .filter((id): id is string => typeof id === "string"),
    ),
  )

  const nameMap = new Map<string, string>()
  if (contributorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", contributorIds)

    const profileRows = (profiles ?? []) as Array<{
      id: string
      display_name: string
    }>
    for (const p of profileRows) {
      nameMap.set(p.id, p.display_name)
    }
  }

  return points.map((p) => ({
    ...p,
    contributor_name: p.contributed_by
      ? (nameMap.get(p.contributed_by) ?? null)
      : null,
  }))
}

interface CountSummary {
  pendingListings: number
  pendingPoints: number
  flaggedUsers: number
}

async function fetchCounts(pendingPoints: number): Promise<CountSummary> {
  const supabase = await createClient()

  const [pendingListings, flaggedUsers] = await Promise.all([
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("moderation_passed", false)
      .neq("status", "removed"),
    supabase
      .from("listings")
      .select("owner_id")
      .eq("moderation_passed", false),
  ])

  const flaggedSet = new Map<string, number>()
  if (Array.isArray(flaggedUsers.data)) {
    for (const row of flaggedUsers.data as Array<{ owner_id: string }>) {
      flaggedSet.set(row.owner_id, (flaggedSet.get(row.owner_id) ?? 0) + 1)
    }
  }
  const flaggedCount = Array.from(flaggedSet.values()).filter(
    (count) => count >= 3,
  ).length

  return {
    pendingListings: pendingListings.count ?? 0,
    pendingPoints,
    flaggedUsers: flaggedCount,
  }
}

async function verifyAction(formData: FormData) {
  "use server"
  const id = formData.get("id")
  if (typeof id !== "string" || id.length === 0) return
  await verifyCollectionPoint(id)
}

function MaterialChip({ code }: { code: MaterialCode }) {
  const meta = getMaterialMeta(code)
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm ring-1 ring-white/30"
      style={{ backgroundColor: meta.color }}
    >
      {meta.name_vi}
    </span>
  )
}

export default async function AdminPointsPage() {
  const points = await fetchPendingPoints()
  const counts = await fetchCounts(points.length)

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
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
            <ShieldCheck className="size-3" aria-hidden />
            Cộng đồng
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            Điểm thu gom chờ duyệt
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Sắp xếp theo lượt ủng hộ, mới nhất trước. Verify để pin chuyển
            sang xanh trên bản đồ công cộng.
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 ring-1 ring-amber-200">
          {points.length} điểm
        </span>
      </div>

      <AdminTabs tabs={tabs} activeHref="/admin/points" />

      {points.length === 0 ? (
        <EmptyState
          title="Không có điểm nào chờ duyệt"
          description="Mọi điểm thu gom đã được xác minh. Cảm ơn cộng đồng đóng góp!"
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[860px] table-fixed text-sm">
            <thead>
              <tr className="border-b border-amber-200 bg-gradient-to-r from-amber-50/80 to-amber-100/40 text-left">
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Tên điểm
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Loại
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Vật liệu nhận
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Bình chọn
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Người đóng góp
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                  Tạo lúc
                </th>
                <th className="px-3 py-2.5" aria-label="Hành động" />
              </tr>
            </thead>
            <tbody>
              {points.map((point, i) => (
                <tr
                  key={point.id}
                  className={`border-t border-border/70 transition-colors hover:bg-amber-50/60 ${
                    i % 2 === 1 ? "bg-amber-50/30" : "bg-white"
                  }`}
                >
                  <td className="max-w-[200px] px-3 py-3 align-top">
                    <p className="font-semibold leading-snug">{point.name}</p>
                    {point.address ? (
                      <p className="mt-1 inline-flex items-start gap-1 text-[11px] text-muted-foreground">
                        <MapPin
                          className="mt-0.5 size-3 text-emerald-600"
                          aria-hidden
                        />
                        <span>{point.address}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {pointTypeLabelVi(point.type)}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {point.accepts.length === 0 ? (
                        <span className="text-[11px] italic text-muted-foreground">
                          (chưa khai báo)
                        </span>
                      ) : (
                        point.accepts.map((code) => (
                          <MaterialChip key={code} code={code} />
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                        <ThumbsUp className="size-3" aria-hidden />
                        <span className="tabular-nums">{point.upvotes}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
                        <ThumbsDown className="size-3" aria-hidden />
                        <span className="tabular-nums">{point.downvotes}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top text-xs text-muted-foreground">
                    {point.contributor_name ?? "—"}
                  </td>
                  <td className="px-3 py-3 align-top text-xs text-muted-foreground">
                    {formatRelative(point.created_at)}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <form action={verifyAction} className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        className="h-8 gap-1 bg-emerald-600 px-3 hover:bg-emerald-700"
                      >
                        <ShieldCheck className="size-3.5" aria-hidden />
                        Verify
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

interface EmptyStateProps {
  title: string
  description: string
}

function EmptyState({ title, description }: EmptyStateProps) {
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
          <ShieldCheck className="size-7" />
        </span>
      </div>
      <div className="relative space-y-1">
        <h2 className="text-lg font-bold text-emerald-900">{title}</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
