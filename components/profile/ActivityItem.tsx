import { MapPin, Plus, ScanLine, Sparkles, ThumbsUp } from "lucide-react"

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

const RTF = new Intl.RelativeTimeFormat("vi", { numeric: "auto" })

interface RelativeUnit {
  unit: Intl.RelativeTimeFormatUnit
  ms: number
}

const RELATIVE_UNITS: RelativeUnit[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "second", ms: 1000 },
]

function formatRelative(createdAt: string | null): string {
  if (!createdAt) return "—"
  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return "—"

  const diffMs = created - Date.now()
  const absDiff = Math.abs(diffMs)

  for (const { unit, ms } of RELATIVE_UNITS) {
    if (absDiff >= ms || unit === "second") {
      const value = Math.round(diffMs / ms)
      return RTF.format(value, unit)
    }
  }
  return RTF.format(0, "second")
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
          {formatRelative(createdAt)}
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
