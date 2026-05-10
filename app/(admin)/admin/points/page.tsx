import type { Metadata } from "next"
import { MapPin, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react"

import { verifyCollectionPoint } from "@/actions/collection-points"
import { Button } from "@/components/ui/button"
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

const RTF = new Intl.RelativeTimeFormat("vi", { numeric: "auto" })
const REL_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
]

function formatRelative(iso: string | null): string {
  if (!iso) return ""
  const ts = new Date(iso).getTime()
  if (Number.isNaN(ts)) return ""
  const diff = ts - Date.now()
  const abs = Math.abs(diff)
  const unit = REL_UNITS.find((u) => abs >= u.ms) ?? REL_UNITS[REL_UNITS.length - 1]
  const value = Math.round(diff / unit.ms)
  return RTF.format(value, unit.unit)
}

async function fetchPendingPoints(): Promise<PendingPointRow[]> {
  const supabase = await createClient()

  // Two-step fetch: pending points first, then their contributors.
  // We avoid a foreign-key embed because supabase-js generic narrows
  // get hairy when joining `profiles` from `collection_points` and the
  // explicit two-step is easier to reason about for a list page.
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
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.name_vi}
    </span>
  )
}

export default async function AdminPointsPage() {
  const points = await fetchPendingPoints()

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Điểm thu gom chờ duyệt
          </h1>
          <p className="text-sm text-muted-foreground">
            Sắp xếp theo lượt ủng hộ, mới nhất trước.
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
          {points.length} điểm
        </span>
      </div>

      {points.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-emerald-300 bg-white px-6 py-16 text-center">
          <div
            aria-hidden
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
          >
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-base font-semibold text-emerald-900">
            Không có điểm nào chờ duyệt
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Mọi điểm thu gom đã được xác minh. Cảm ơn cộng đồng đóng góp!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[860px] table-fixed text-sm">
            <thead>
              <tr className="border-b border-border bg-amber-50/40 text-left">
                <th className="px-3 py-2 font-medium">Tên điểm</th>
                <th className="px-3 py-2 font-medium">Loại</th>
                <th className="px-3 py-2 font-medium">Vật liệu nhận</th>
                <th className="px-3 py-2 font-medium">Bình chọn</th>
                <th className="px-3 py-2 font-medium">Người đóng góp</th>
                <th className="px-3 py-2 font-medium">Tạo lúc</th>
                <th className="px-3 py-2" aria-label="Hành động" />
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.id} className="border-t border-border/70">
                  <td className="max-w-[200px] px-3 py-3 align-top">
                    <p className="font-medium leading-snug">{point.name}</p>
                    {point.address ? (
                      <p className="mt-0.5 inline-flex items-start gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="mt-0.5 h-3 w-3" aria-hidden />
                        <span>{point.address}</span>
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
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
                    <div className="flex items-center gap-3 text-xs text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" aria-hidden />
                        {point.upvotes}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3" aria-hidden />
                        {point.downvotes}
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
                    <form action={verifyAction}>
                      <input type="hidden" name="id" value={point.id} />
                      <Button type="submit" size="sm" className="h-8 px-3">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
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
