import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"

import { AdminTabs } from "@/components/admin/AdminTabs"
import {
  ModerationTable,
  type ModerationRow,
} from "@/components/admin/ModerationTable"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

export const metadata: Metadata = {
  title: "Kiểm duyệt — ReLoop Admin",
}

export const dynamic = "force-dynamic"

type ListingRow = Database["public"]["Tables"]["listings"]["Row"]

const MODERATION_TAB_HREF = "/admin/moderation"

async function fetchPendingListings(): Promise<ModerationRow[]> {
  const supabase = await createClient()

  // Two-step fetch: pending listings, then their owner display_names.
  // Avoids the foreign-key embed pattern, mirroring admin/points page.
  const { data: rows, error } = await supabase
    .from("listings")
    .select("*")
    .eq("moderation_passed", false)
    .neq("status", "removed")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error || !rows) return []

  const listings = rows as ListingRow[]
  const ownerIds = Array.from(new Set(listings.map((l) => l.owner_id)))

  const nameMap = new Map<string, string>()
  if (ownerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ownerIds)

    const profileRows = (profiles ?? []) as Array<{
      id: string
      display_name: string
    }>
    for (const p of profileRows) {
      nameMap.set(p.id, p.display_name)
    }
  }

  return listings.map((l) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    photo: l.photos?.[0] ?? null,
    ownerId: l.owner_id,
    ownerName: nameMap.get(l.owner_id) ?? null,
    reason: l.moderation_reason,
    createdAt: l.created_at,
  }))
}

interface CountSummary {
  pendingListings: number
  pendingPoints: number
  flaggedUsers: number
}

async function fetchCounts(): Promise<CountSummary> {
  const supabase = await createClient()

  const [pendingListings, pendingPoints, flaggedUsers] = await Promise.all([
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("moderation_passed", false)
      .neq("status", "removed"),
    supabase
      .from("collection_points")
      .select("id", { count: "exact", head: true })
      .eq("verified", false),
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
    pendingPoints: pendingPoints.count ?? 0,
    flaggedUsers: flaggedCount,
  }
}

export default async function AdminModerationPage() {
  const [rows, counts] = await Promise.all([
    fetchPendingListings(),
    fetchCounts(),
  ])

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
      <PageHeading
        eyebrow="Kiểm duyệt"
        title="Bài đăng chờ duyệt"
        description="Duyệt nội dung bị AI flag, xác minh điểm thu gom, theo dõi người dùng vi phạm."
        meta={
          <Link
            href="/admin/points"
            className="hidden items-center gap-1 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-50 sm:inline-flex"
          >
            Sang điểm thu gom
            <ArrowRight className="size-3" aria-hidden />
          </Link>
        }
      />

      <AdminTabs tabs={tabs} activeHref={MODERATION_TAB_HREF} />

      <ModerationTable rows={rows} />
    </main>
  )
}

interface PageHeadingProps {
  eyebrow: string
  title: string
  description: string
  meta?: React.ReactNode
}

function PageHeading({ eyebrow, title, description, meta }: PageHeadingProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
          <ShieldCheck className="size-3" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {meta}
    </div>
  )
}
