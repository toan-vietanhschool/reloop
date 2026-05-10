"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Hammer,
  Lightbulb,
  MapPin,
  Recycle,
  Save,
  Sparkles,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getMaterialMeta } from "@/lib/material"
import {
  buildAncestorPun,
  formatDecompositionRange,
  impactEmoji,
} from "@/lib/scan-display"
import { cn } from "@/lib/utils"
import type { VisionResult } from "@/lib/openai/vision"

import { ShareDialog } from "./ShareDialog"

interface ResultCardProps {
  result: VisionResult
  imageUrl: string
  cached?: boolean
  /**
   * Optional legacy hook — invoked when the share dialog opens. Kept
   * so existing callers (`ScanClient.handleShare`) can still trigger
   * analytics or fallback toasts. The actual PNG/share logic lives in
   * `<ShareDialog>` (T2-08).
   */
  onShare?: () => void
  onSaveHistory?: () => void
  /**
   * Optional badge unlock chip surfaced on the share card. Wired by
   * the parent (T2-03 BadgeUnlockDialog supplies the data via
   * Realtime).
   */
  unlockedBadge?: { code: string; name_vi: string; icon?: string | null } | null
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
  easy: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-100 text-amber-700 ring-amber-200",
  hard: "bg-rose-100 text-rose-700 ring-rose-200",
}

/**
 * Material code → asset slug. Mirrors the JPEGs A1 dropped in
 * `public/images/materials/`. Lower-cased + dash-separated to match
 * the on-disk filenames.
 */
function materialImageSrc(code: string): string {
  const slug = code.toLowerCase().replace(/_/g, "-")
  return `/images/materials/${slug}.jpg`
}

function impactColor(score: number): string {
  if (score <= 3) return "#10B981"
  if (score <= 6) return "#F59E0B"
  if (score <= 8) return "#F97316"
  return "#EF4444"
}

function decompositionPercent(min: number, max: number | null): number {
  // Log-ish scale: 1000 years ≈ full bar.
  const value = max ?? min
  const clamped = Math.max(0, Math.min(1000, value))
  return Math.round((Math.log10(clamped + 1) / Math.log10(1001)) * 100)
}

const YEAR_MARKERS = [1, 10, 100, 500, 1000]

export function ResultCard({
  result,
  imageUrl,
  cached,
  onShare,
  onSaveHistory,
  unlockedBadge,
}: ResultCardProps) {
  const material = getMaterialMeta(result.material_code)
  const pun = buildAncestorPun(result.decomposition_years_min)
  const decompPct = decompositionPercent(
    result.decomposition_years_min,
    result.decomposition_years_max,
  )
  const [shareOpen, setShareOpen] = useState(false)

  function openShareDialog() {
    onShare?.()
    setShareOpen(true)
  }

  return (
    <section
      aria-label="Kết quả phân tích"
      className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft-lg"
    >
      {/* ---------- HERO: image left, headline + chips right ---------- */}
      <div className="grid gap-0 sm:grid-cols-[1fr_1.05fr]">
        <div className="relative isolate aspect-square overflow-hidden sm:aspect-auto sm:min-h-[20rem]">
          {/* Material image as backdrop wash so the user's own photo
              floats on top of the brand color, anchoring identity. */}
          <Image
            src={materialImageSrc(result.material_code)}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 640px) 360px, 100vw"
            className="object-cover blur-sm scale-110"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(135deg, ${material.color}cc 0%, ${material.color}66 100%)`,
            }}
          />
          {/* User's photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={result.detected_item}
            className="absolute inset-0 m-auto h-[78%] w-[78%] rounded-2xl object-cover shadow-2xl ring-4 ring-white/80"
          />
          {cached && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-800 shadow-sm">
              <Sparkles className="size-3" aria-hidden />
              Cache
            </span>
          )}
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <div className="space-y-1.5">
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm"
              style={{ backgroundColor: material.color }}
            >
              {material.name_vi}
            </span>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {result.detected_item}
            </h2>
            <p className="text-xs text-muted-foreground">
              Độ tin cậy AI:{" "}
              <span className="font-semibold text-foreground">
                {Math.round(result.confidence * 100)}%
              </span>
              {cached ? " · từ cache" : null}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {result.recyclable ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Tái chế được
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 ring-1 ring-rose-200">
                <XCircle className="size-3.5" aria-hidden />
                Khó tái chế
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/80">
              <span aria-hidden>{impactEmoji(result.environmental_impact_score)}</span>
              Tác động {result.environmental_impact_score}/10
            </span>
          </div>
        </div>
      </div>

      {/* Warning banner — full-width red bleed when AI raised concerns */}
      {result.warning && (
        <div className="border-y border-rose-200 bg-rose-50/80 px-6 py-3 sm:px-8">
          <div className="flex items-start gap-3 text-sm text-rose-900">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden />
            <p className="leading-relaxed">{result.warning}</p>
          </div>
        </div>
      )}

      {/* ---------- METRICS: decomposition gauge + impact ring ---------- */}
      <div className="grid grid-cols-1 gap-px bg-border/50 sm:grid-cols-2">
        <div className="space-y-3 bg-card p-6 sm:p-7">
          <div className="flex items-center gap-2 text-emerald-700">
            <Clock className="size-4" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Thời gian phân hủy
            </p>
          </div>
          <p className="text-3xl font-extrabold tracking-tight">
            {formatDecompositionRange(
              result.decomposition_years_min,
              result.decomposition_years_max,
            )}
          </p>
          <DecompositionGauge percent={decompPct} />
          {pun && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs italic leading-relaxed text-amber-900">
              {pun}
            </p>
          )}
        </div>

        <div className="space-y-3 bg-card p-6 sm:p-7">
          <div className="flex items-center gap-2 text-emerald-700">
            <Sparkles className="size-4" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Eco Score môi trường
            </p>
          </div>
          <ImpactRing
            score={result.environmental_impact_score}
            color={impactColor(result.environmental_impact_score)}
          />
        </div>
      </div>

      {/* ---------- RECYCLE SUGGESTIONS ---------- */}
      {result.recycle_suggestions.length > 0 && (
        <div className="border-t border-border/60 px-6 py-7 sm:px-8">
          <SectionHeading
            icon={<Recycle className="size-5 text-emerald-600" aria-hidden />}
            eyebrow="Hành động"
            title="Cách tái chế / xử lý"
          />
          <ol className="mt-4 space-y-2">
            {result.recycle_suggestions.map((suggestion, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/30 p-3 text-sm leading-relaxed text-foreground/90"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-sm">
                  {i + 1}
                </span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ---------- DIY IDEAS ---------- */}
      {result.diy_ideas.length > 0 && (
        <div className="border-t border-border/60 bg-amber-50/30 px-6 py-7 sm:px-8">
          <SectionHeading
            icon={<Lightbulb className="size-5 text-amber-500" aria-hidden />}
            eyebrow="Sáng tạo"
            title="Ý tưởng DIY thử ngay"
          />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {result.diy_ideas.map((idea, i) => (
              <article
                key={i}
                className="group flex flex-col gap-3 rounded-2xl border border-amber-200/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 transition-transform group-hover:scale-105">
                    <Hammer className="size-4" aria-hidden />
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                      DIFFICULTY_CLASS[idea.difficulty] ??
                        "bg-muted text-muted-foreground ring-border",
                    )}
                  >
                    {DIFFICULTY_LABEL[idea.difficulty] ?? idea.difficulty}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-tight">
                  {idea.title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {idea.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ---------- NEARBY COLLECTION ---------- */}
      {result.nearby_collection_point_types.length > 0 && (
        <div className="border-t border-border/60 px-6 py-7 sm:px-8">
          <SectionHeading
            icon={<MapPin className="size-5 text-sky-600" aria-hidden />}
            eyebrow="Bản đồ"
            title="Mang đến đâu gần bạn"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {result.nearby_collection_point_types.map((type) => (
              <Link
                key={type}
                href={`/map?type=${encodeURIComponent(type)}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-sm font-medium text-sky-800 transition-all hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-100 hover:shadow-sm"
              >
                <MapPin className="size-3.5" aria-hidden />
                {COLLECTION_TYPE_LABEL[type] ?? type}
                <span
                  aria-hidden
                  className="ml-0.5 transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ---------- ACTION BAR ---------- */}
      <div className="border-t border-border/60 bg-muted/20 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            size="lg"
            variant="default"
            onClick={openShareDialog}
            className="h-11 flex-1 bg-gradient-to-r from-emerald-600 to-sky-500 font-semibold shadow-brand hover:brightness-105"
          >
            <Camera className="mr-1.5 size-4" aria-hidden />
            Chia sẻ kết quả
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 flex-1"
          >
            <Link
              href={`/listings/new?material_code=${encodeURIComponent(
                result.material_code,
              )}&from=scan`}
            >
              Đăng listing
            </Link>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={onSaveHistory}
            className="h-11 flex-1"
          >
            <Save className="mr-1.5 size-4" aria-hidden />
            Lưu lịch sử
          </Button>
        </div>
        <p className="mt-3 text-center text-[11px] italic text-muted-foreground">
          Đây là dữ liệu tham khảo. Số liệu chuẩn từ Bộ TN&MT, OECD.
        </p>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        result={result}
        imageUrl={imageUrl}
        unlockedBadge={unlockedBadge ?? null}
      />
    </section>
  )
}

interface SectionHeadingProps {
  icon: React.ReactNode
  eyebrow: string
  title: string
}

function SectionHeading({ icon, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
        <h3 className="mt-0.5 flex items-center gap-2 text-lg font-bold tracking-tight">
          {icon}
          {title}
        </h3>
      </div>
    </div>
  )
}

interface DecompositionGaugeProps {
  percent: number
}

/**
 * Horizontal log-scale gauge with year markers labelled below. Width is
 * eased via a custom property so the bar fills from left as the result
 * mounts. Static SVG-free implementation keeps SSR-friendly.
 */
function DecompositionGauge({ percent }: DecompositionGaugeProps) {
  return (
    <div className="space-y-2">
      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-emerald-100"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 via-orange-500 to-rose-600 transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
        {YEAR_MARKERS.map((year) => (
          <span key={year}>{year}{year === 1000 ? "+" : ""}n</span>
        ))}
      </div>
    </div>
  )
}

interface ImpactRingProps {
  score: number
  color: string
}

/**
 * Circular impact gauge — score 0–10. SVG ring centred so it survives
 * any container width. Stroke colour shifts with the score.
 */
function ImpactRing({ score, color }: ImpactRingProps) {
  const size = 132
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 10) * circumference

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(94% 0.02 160)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tabular-nums leading-none">
            {score}
            <span className="text-base font-semibold opacity-60">/10</span>
          </span>
          <span aria-hidden className="mt-1 text-xl">
            {impactEmoji(score)}
          </span>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <p className="font-semibold tracking-tight">
          {score <= 3
            ? "Tác động thấp"
            : score <= 6
              ? "Tác động vừa"
              : "Tác động cao"}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {score <= 3
            ? "Tái chế dễ, phân loại đúng là xong."
            : score <= 6
              ? "Cần xử lý đúng kênh để tránh ô nhiễm."
              : "Ưu tiên tái sử dụng — đừng bỏ chung rác sinh hoạt."}
        </p>
      </div>
    </div>
  )
}
