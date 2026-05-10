import Image from "next/image"

import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "@/components/shared/LeaderboardPodium"

interface LeaderboardTableProps {
  /** Entries with rank starting at startRank (typically 4). */
  rows: ReadonlyArray<LeaderboardEntry>
  /** Rank of the first row in `rows`. Defaults to 4. */
  startRank?: number
  /** Maps schools.code → name_vi for the School column. */
  schoolNames: Readonly<Record<string, string>>
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?"
}

/**
 * Hash a string to a stable index → used to assign each school code a colored
 * chip variant deterministically. No randomness so SSR matches client.
 */
function schoolChipVariant(code: string): number {
  let hash = 0
  for (let i = 0; i < code.length; i += 1) {
    hash = (hash * 31 + code.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % SCHOOL_CHIP_VARIANTS.length
}

const SCHOOL_CHIP_VARIANTS = [
  "border-emerald-200 bg-emerald-50 text-emerald-700",
  "border-sky-200 bg-sky-50 text-sky-700",
  "border-violet-200 bg-violet-50 text-violet-700",
  "border-amber-200 bg-amber-50 text-amber-700",
  "border-rose-200 bg-rose-50 text-rose-700",
  "border-teal-200 bg-teal-50 text-teal-700",
] as const

export function LeaderboardTable({
  rows,
  startRank = 4,
  schoolNames,
}: LeaderboardTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
        Chưa có thêm thí sinh nào ngoài top 3 — quay lại sớm khi cuộc đua nóng
        hơn.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-foreground/10 bg-card shadow-soft-lg">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th scope="col" className="px-5 py-3.5 font-semibold">
              Hạng
            </th>
            <th scope="col" className="px-5 py-3.5 font-semibold">
              Thí sinh
            </th>
            <th scope="col" className="px-5 py-3.5 font-semibold">
              Trường
            </th>
            <th scope="col" className="px-5 py-3.5 text-right font-semibold">
              Eco points
            </th>
            <th scope="col" className="px-5 py-3.5 text-right font-semibold">
              Cấp
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/5">
          {rows.map((row, idx) => {
            const rank = startRank + idx
            const schoolName = row.school ? schoolNames[row.school] : null
            const chipClass = row.school
              ? SCHOOL_CHIP_VARIANTS[schoolChipVariant(row.school)]
              : "border-foreground/15 bg-muted/30 text-muted-foreground"
            return (
              <tr
                key={row.id}
                className={cn(
                  "transition-colors",
                  idx % 2 === 0 ? "bg-card" : "bg-muted/20",
                  "hover:bg-brand-green/5",
                )}
              >
                <td className="px-5 py-3.5 font-mono text-sm font-semibold text-foreground/80">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 text-xs">
                    {rank}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 ring-2 ring-white">
                      {row.avatar_url ? (
                        <Image
                          src={row.avatar_url}
                          alt=""
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(row.display_name)
                      )}
                    </span>
                    <span className="line-clamp-1 font-medium text-foreground">
                      {row.display_name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {schoolName ? (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                        chipClass,
                      )}
                    >
                      {schoolName}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground opacity-50">
                      —
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-1 text-base font-bold tabular-nums text-brand-green-deep">
                    <span aria-hidden>🌱</span>
                    <span>{row.eco_points.toLocaleString("vi-VN")}</span>
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Lv {row.level}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
