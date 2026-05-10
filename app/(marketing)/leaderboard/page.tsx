import type { Metadata } from "next"
import { Trophy } from "lucide-react"

import { Footer } from "@/components/shared/Footer"
import { LeaderboardPodium } from "@/components/shared/LeaderboardPodium"
import type { LeaderboardEntry } from "@/components/shared/LeaderboardPodium"
import { LeaderboardTable } from "@/components/shared/LeaderboardTable"
import { SchoolFilter } from "@/components/shared/SchoolFilter"
import type { SchoolOption } from "@/components/shared/SchoolFilter"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Bảng xếp hạng — ReLoop",
}

interface SearchParamsShape {
  school?: string | string[]
}

interface LeaderboardPageProps {
  searchParams: Promise<SearchParamsShape>
}

const TOP_LIMIT = 20

function normalizeSchoolParam(
  raw: string | string[] | undefined,
): string | null {
  if (!raw) return null
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null
  const trimmed = value.trim()
  // Bound length to avoid an obviously bogus query reaching Postgres.
  if (trimmed.length === 0 || trimmed.length > 64) return null
  return trimmed
}

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const params = await searchParams
  const schoolParam = normalizeSchoolParam(params.school)

  const supabase = await createClient()

  // Fetch schools list first so we can both render the filter dropdown and
  // build a code -> name_vi map for the podium / table subtitle. Also acts
  // as an allowlist for `schoolParam`: unknown codes fall back to "all".
  const { data: rawSchools } = await supabase
    .from("schools")
    .select("code, name_vi, city")
    .order("name_vi", { ascending: true })

  const schools = (rawSchools ?? []) as SchoolOption[]
  const schoolCodes = new Set(schools.map((s) => s.code))
  const activeSchool =
    schoolParam && schoolCodes.has(schoolParam) ? schoolParam : null

  const schoolNames: Record<string, string> = schools.reduce<
    Record<string, string>
  >((acc, s) => {
    acc[s.code] = s.name_vi
    return acc
  }, {})

  // Build the leaderboard query — top 20 by eco_points desc, tiebreak on
  // earliest signup. RLS on profiles already permits public select of these
  // columns (display_name, avatar_url, eco_points, level, school all public).
  let query = supabase
    .from("profiles")
    .select("id, display_name, avatar_url, eco_points, level, school")
    .order("eco_points", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(TOP_LIMIT)

  if (activeSchool) {
    query = query.eq("school", activeSchool)
  }

  const { data: rawRows, error } = await query
  const rows = (rawRows ?? []) as LeaderboardEntry[]

  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)

  const activeSchoolName = activeSchool ? schoolNames[activeSchool] : null

  return (
    <>
      {/* Hero band — gradient mesh + trophy icon overlap */}
      <header className="relative isolate overflow-hidden border-b border-foreground/5 bg-eco-bg-soft">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-mesh opacity-70"
        />
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-12 md:px-6 md:py-16">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-green/15 text-brand-green-deep ring-1 ring-brand-green/30">
              <Trophy className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green-deep">
              Bảng xếp hạng
            </span>
          </div>
          <h1 className="font-display text-balance text-3xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Top 20 ReLoopers{" "}
            {activeSchoolName ? (
              <span className="text-brand-green-deep">
                · {activeSchoolName}
              </span>
            ) : (
              <span className="text-brand-green-deep">toàn quốc</span>
            )}
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Mỗi lần scan, đăng listing, hoàn tất trao đổi đều cộng eco-points.
            Đua cùng bạn cùng trường — top 20 cập nhật mỗi 60 giây.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8 flex flex-col items-start gap-4 rounded-2xl border border-foreground/10 bg-card px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between md:px-5">
          <SchoolFilter schools={schools} current={activeSchool} />
          <p className="text-xs text-muted-foreground md:text-sm">
            Cập nhật{" "}
            <span className="font-medium text-foreground">
              {new Date().toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
              })}
            </span>{" "}
            · ISR 60s
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Không tải được bảng xếp hạng: {error.message}
          </div>
        ) : null}

        {!error && rows.length === 0 ? (
          <EmptyState schoolName={activeSchoolName} />
        ) : null}

        {rows.length > 0 ? (
          <>
            <LeaderboardPodium top3={top3} schoolNames={schoolNames} />

            <div className="mt-12">
              <h2 className="mb-4 font-display text-xl font-semibold tracking-tight md:text-2xl">
                Hạng 4 – {Math.min(TOP_LIMIT, 3 + rest.length)}
              </h2>
              <LeaderboardTable
                rows={rest}
                startRank={4}
                schoolNames={schoolNames}
              />
            </div>
          </>
        ) : null}
      </main>
      <Footer />
    </>
  )
}

interface EmptyStateProps {
  schoolName: string | null
}

function EmptyState({ schoolName }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
      <span aria-hidden className="text-5xl">
        🌱
      </span>
      <h2 className="mt-4 text-lg font-semibold">
        {schoolName
          ? `Trường ${schoolName} chưa có thí sinh`
          : "Chưa có thí sinh nào"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Hãy là người đầu tiên scan đồ và đăng listing — eco-points đầu tiên
        đang chờ bạn.
      </p>
    </div>
  )
}
