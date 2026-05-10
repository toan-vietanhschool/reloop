import { MapPin, Plus, ScanLine, Sparkles, ThumbsUp } from "lucide-react"

import { formatRelative } from "@/lib/format-relative"
import { ECO_ACTION_LABELS_VI, type EcoActionKind } from "@/lib/points"

interface ActivityItemProps {
  kind: string
  pointsDelta: number
  createdAt: string | null
}

const KIND_ICONS: Record<EcoActionKind, typeof ScanLine> = {
  scan: ScanLine,
  listing_create: Plus,
  point_pin: MapPin,
  vote: ThumbsUp,
  exchange_complete: Sparkles,
}

/**
 * Activity feed uses an em-dash placeholder when the timestamp is
 * missing/invalid, whereas the shared `formatRelative` returns "" so
 * it can be inlined into longer admin copy. We coerce here to keep the
 * profile UI from collapsing the row height when a row has no date.
 */
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
}: ActivityItemProps) {
  const known = isKnownKind(kind)
  const label = known ? ECO_ACTION_LABELS_VI[kind] : kind
  const Icon = known ? KIND_ICONS[kind] : Sparkles
  const positive = pointsDelta >= 0

  return (
    <li className="flex items-center gap-3 rounded-md border border-border/60 bg-card px-3 py-2">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {formatActivityTime(createdAt)}
        </p>
      </div>
      <span
        className={
          "shrink-0 text-sm font-semibold tabular-nums " +
          (positive ? "text-emerald-700" : "text-destructive")
        }
      >
        {positive ? "+" : ""}
        {pointsDelta}
      </span>
    </li>
  )
}
