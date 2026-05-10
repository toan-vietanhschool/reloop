import { MapPin, Plus, ScanLine, Sparkles, ThumbsUp } from "lucide-react"

import { formatRelative } from "@/lib/format-relative"
import { ECO_ACTION_LABELS_VI, type EcoActionKind } from "@/lib/points"
import { cn } from "@/lib/utils"

interface ActivityItemProps {
  kind: string
  pointsDelta: number
  createdAt: string | null
  /** Render the timeline rail line (false for the last item). */
  showRail?: boolean
}

const KIND_ICONS: Record<EcoActionKind, typeof ScanLine> = {
  scan: ScanLine,
  listing_create: Plus,
  point_pin: MapPin,
  vote: ThumbsUp,
  exchange_complete: Sparkles,
}

/**
 * Color palette per action kind — matches the dashboard accent system
 * (emerald = primary scan, amber = listings, sky = map). Locked here
 * so the timeline reads at a glance.
 */
const KIND_ACCENT: Record<EcoActionKind, string> = {
  scan: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  listing_create: "bg-amber-100 text-amber-700 ring-amber-200",
  point_pin: "bg-violet-100 text-violet-700 ring-violet-200",
  vote: "bg-sky-100 text-sky-700 ring-sky-200",
  exchange_complete: "bg-rose-100 text-rose-700 ring-rose-200",
}

function formatActivityTime(createdAt: string | null): string {
  return formatRelative(createdAt) || "—"
}

function isKnownKind(kind: string): kind is EcoActionKind {
  return kind in ECO_ACTION_LABELS_VI
}

export function ActivityItem({
  kind,
  pointsDelta,
  createdAt,
  showRail = true,
}: ActivityItemProps) {
  const known = isKnownKind(kind)
  const label = known ? ECO_ACTION_LABELS_VI[kind] : kind
  const Icon = known ? KIND_ICONS[kind] : Sparkles
  const accent = known
    ? KIND_ACCENT[kind]
    : "bg-muted text-muted-foreground ring-border"
  const positive = pointsDelta >= 0

  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      {/* Vertical rail */}
      {showRail && (
        <span
          aria-hidden
          className="absolute left-[1.125rem] top-9 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-border/80 to-border/20"
        />
      )}

      <span
        aria-hidden
        className={cn(
          "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-2 shadow-sm",
          accent,
        )}
      >
        <Icon className="size-4" />
      </span>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-border/40 bg-card px-3 py-2 shadow-sm transition-colors hover:border-border/70">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {label}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {formatActivityTime(createdAt)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
            positive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700",
          )}
        >
          {positive ? "+" : ""}
          {pointsDelta}
        </span>
      </div>
    </li>
  )
}
