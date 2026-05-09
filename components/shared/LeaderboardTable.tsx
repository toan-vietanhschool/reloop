import Image from "next/image"

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

export function LeaderboardTable({
  rows,
  startRank = 4,
  schoolNames,
}: LeaderboardTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
        Chưa có thêm thí sinh nào ngoài top 3 — quay lại sớm khi cuộc đua nóng hơn.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-foreground/10 bg-card shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Hạng
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Thí sinh
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Trường
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Eco points
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Cấp
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/5">
          {rows.map((row, idx) => {
            const rank = startRank + idx
            const schoolName = row.school ? schoolNames[row.school] : null
            return (
              <tr
                key={row.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-mono font-semibold text-foreground/80">
                  {rank}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
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
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {schoolName ?? <span className="opacity-50">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 text-base font-bold text-emerald-700">
                    <span aria-hidden>🌱</span>
                    <span>{row.eco_points.toLocaleString("vi-VN")}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
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
