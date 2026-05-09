"use client"

import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Hammer,
  Lightbulb,
  MapPin,
  Recycle,
  Save,
  Share2,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getMaterialMeta } from "@/lib/material"
import { cn } from "@/lib/utils"
import type { VisionResult } from "@/lib/openai/vision"

interface ResultCardProps {
  result: VisionResult
  imageUrl: string
  cached?: boolean
  onShare?: () => void
  onSaveHistory?: () => void
}

const COLLECTION_TYPE_LABEL: Record<string, string> = {
  scrap_dealer: "Vựa phế liệu",
  recycle_bin: "Thùng tái chế",
  ngo_dropoff: "Điểm thu gom NGO",
  ewaste: "Thu gom điện tử",
  other: "Khác",
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Dễ",
  medium: "Vừa",
  hard: "Khó",
}

const DIFFICULTY_CLASS: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
}

function formatYears(min: number, max: number | null): string {
  if (max && max > min) {
    if (min < 1 && max < 1) return "Vài tháng"
    return `${min} – ${max} năm`
  }
  if (min < 1) return "Vài tháng"
  return `~${min} năm`
}

function impactEmoji(score: number): string {
  if (score <= 2) return "🌱"
  if (score <= 4) return "🌿"
  if (score <= 6) return "⚠️"
  if (score <= 8) return "🚨"
  return "🔥"
}

function impactColor(score: number): string {
  if (score <= 3) return "bg-green-500"
  if (score <= 6) return "bg-amber-500"
  if (score <= 8) return "bg-orange-500"
  return "bg-red-500"
}

function ancestorPun(years: number): string | null {
  if (years <= 80) return null
  const generations = Math.floor(years / 25)
  if (generations < 4) return null
  return `Sống lâu hơn ông cố bạn ${generations} đời 😱`
}

function decompositionPercent(min: number, max: number | null): number {
  // Log-ish scale: 1000 years ≈ full bar.
  const value = max ?? min
  const clamped = Math.max(0, Math.min(1000, value))
  return Math.round((Math.log10(clamped + 1) / Math.log10(1001)) * 100)
}

export function ResultCard({
  result,
  imageUrl,
  cached,
  onShare,
  onSaveHistory,
}: ResultCardProps) {
  const material = getMaterialMeta(result.material_code)
  const pun = ancestorPun(result.decomposition_years_min)
  const decompPct = decompositionPercent(
    result.decomposition_years_min,
    result.decomposition_years_max,
  )

  return (
    <Card className="mt-6 overflow-hidden">
      <CardContent className="space-y-6 p-6">
        {/* Header: image + name + confidence */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative size-40 shrink-0 self-center overflow-hidden rounded-2xl border bg-muted sm:size-48 sm:self-start">
            {/* Preview can be a Blob URL or remote Supabase URL — use plain <img> to avoid next/image domain config. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={result.detected_item}
              className="size-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {result.detected_item}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Độ tin cậy: {Math.round(result.confidence * 100)}%
                {cached && " · từ cache"}
              </p>
            </div>

            {/* Material badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: material.color }}
              >
                {material.name_vi}
              </span>
              {result.recyclable ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  <CheckCircle2 className="size-3.5" />
                  Tái chế được
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                  <XCircle className="size-3.5" />
                  Khó tái chế
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Warning banner */}
        {result.warning && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="size-5 shrink-0" />
            <p className="leading-relaxed">{result.warning}</p>
          </div>
        )}

        {/* Decomposition + impact */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-4" />
              Thời gian phân hủy
            </div>
            <p className="text-2xl font-bold">
              {formatYears(
                result.decomposition_years_min,
                result.decomposition_years_max,
              )}
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 transition-all"
                style={{ width: `${decompPct}%` }}
              />
            </div>
            {pun && (
              <p className="mt-2 text-xs italic text-muted-foreground">
                {pun}
              </p>
            )}
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              Tác động môi trường
            </div>
            <p className="text-2xl font-bold">
              {result.environmental_impact_score} / 10{" "}
              <span aria-hidden>
                {impactEmoji(result.environmental_impact_score)}
              </span>
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  impactColor(result.environmental_impact_score),
                )}
                style={{
                  width: `${result.environmental_impact_score * 10}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Recycle suggestions */}
        {result.recycle_suggestions.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <Recycle className="size-5 text-green-600" />
              Cách tái chế / xử lý
            </h3>
            <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
              {result.recycle_suggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-2 rounded-md bg-muted/40 p-3"
                >
                  <span
                    aria-hidden
                    className="text-green-600"
                  >
                    →
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* DIY ideas */}
        {result.diy_ideas.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <Lightbulb className="size-5 text-amber-500" />
              Ý tưởng DIY
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {result.diy_ideas.map((idea, i) => (
                <div
                  key={i}
                  className="space-y-2 rounded-lg border bg-card p-3 transition-shadow hover:shadow-md"
                >
                  <Hammer className="size-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">{idea.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {idea.description}
                  </p>
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                      DIFFICULTY_CLASS[idea.difficulty] ??
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {DIFFICULTY_LABEL[idea.difficulty] ?? idea.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby collection points */}
        {result.nearby_collection_point_types.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <MapPin className="size-5 text-blue-600" />
              Mang đến đâu
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.nearby_collection_point_types.map((type) => (
                <Link
                  key={type}
                  href={`/map?type=${encodeURIComponent(type)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <MapPin className="size-3.5" />
                  {COLLECTION_TYPE_LABEL[type] ?? type}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action footer */}
        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:flex-wrap">
          <Button
            asChild
            size="sm"
            variant="default"
            className="flex-1"
          >
            <Link
              href={`/listings/new?material_code=${encodeURIComponent(
                result.material_code,
              )}&from=scan`}
            >
              Đăng listing với vật liệu này
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onSaveHistory}
            className="flex-1"
          >
            <Save className="mr-2 size-4" />
            Lưu vào lịch sử
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onShare}
            className="flex-1"
          >
            <Share2 className="mr-2 size-4" />
            Chia sẻ
          </Button>
        </div>

        <p className="text-center text-[11px] italic text-muted-foreground">
          Đây là dữ liệu tham khảo. Số liệu chuẩn từ Bộ TN&MT, OECD.
        </p>
      </CardContent>
    </Card>
  )
}
