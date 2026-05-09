"use client"

import { forwardRef } from "react"

import { getMaterialMeta } from "@/lib/material"
import type { VisionResult } from "@/lib/openai/vision"

import { QRCode } from "./QRCode"

interface EcoScoreCardProps {
  result: VisionResult
  imageUrl: string
  /**
   * Optional badge unlock chip — surface in the bottom-left when the
   * scan triggered a new badge. T2-03 handles the actual award; this
   * card only renders the celebratory text.
   */
  unlockedBadge?: { code: string; name_vi: string; icon?: string | null } | null
  /**
   * The landing URL that the embedded QR resolves to. Default keeps
   * the production deeplink so the static SVG fallback stays in sync.
   */
  shareLandingUrl?: string
  /**
   * If true, the card mounts off-screen for capture only. We use
   * inline styles + absolute positioning instead of Tailwind so the
   * captured PNG is independent of the consumer's CSS reset.
   */
  offscreen?: boolean
}

const CARD_PX = 1080

const COLORS = {
  // Brand gradient — green → blue (oklch in globals.css mapped to hex).
  gradientStart: "#22c5a0",
  gradientEnd: "#3aa1ed",
  surface: "#ffffff",
  surfaceSoft: "rgba(255, 255, 255, 0.18)",
  surfaceText: "#0f172a",
  onDark: "#ffffff",
  ringTrack: "rgba(255, 255, 255, 0.25)",
  ringFill: "#ffffff",
  badgeChip: "rgba(255, 255, 255, 0.92)",
}

function impactEmoji(score: number): string {
  if (score <= 2) return "🌱"
  if (score <= 4) return "🌿"
  if (score <= 6) return "⚠️"
  if (score <= 8) return "🚨"
  return "🔥"
}

/**
 * Decomposition years → ancestor generations pun.
 * 25 years per generation, mirrors `ResultCard.tsx`.
 */
function ancestorLine(min: number, max: number | null): string | null {
  const years = max ?? min
  if (years < 80) return null
  const generations = Math.floor(years / 25)
  if (generations < 4) return null
  return `Sống lâu hơn ông cố tôi ${generations} đời 🤯`
}

/**
 * Generate the punchy headline used as the centerpiece of the card.
 * Falls back to a more measured tone when the item has a short
 * decomposition window (e.g. organic waste).
 */
function buildHeadline(result: VisionResult): string {
  const years = result.decomposition_years_max ?? result.decomposition_years_min
  const generations = Math.floor(years / 25)
  if (generations >= 4) {
    return `Tôi vừa cứu Trái Đất khỏi ${result.detected_item} — sống lâu hơn ông cố tôi ${generations} đời 🤯`
  }
  if (years >= 1) {
    return `Tôi vừa cứu Trái Đất khỏi ${result.detected_item} — phân hủy ~${years} năm 🌱`
  }
  return `Tôi vừa cứu Trái Đất khỏi ${result.detected_item} 🌱`
}

/**
 * 1080×1080 PNG-friendly Eco Score share card.
 *
 * Renders entirely with inline styles — html-to-image walks the
 * computed style of every node, so any reliance on global Tailwind
 * classes risks producing a card that looks different in the captured
 * PNG vs. the live preview. Inline styles eliminate that drift.
 *
 * The `forwardRef` is the capture handle: `ShareDialog` keeps a ref
 * and passes the underlying div to `captureNode()`.
 */
export const EcoScoreCard = forwardRef<HTMLDivElement, EcoScoreCardProps>(
  function EcoScoreCard(
    {
      result,
      imageUrl,
      unlockedBadge,
      shareLandingUrl = "https://reloop.vercel.app/?ref=eco-card",
      offscreen,
    },
    ref,
  ) {
    const material = getMaterialMeta(result.material_code)
    const score = result.environmental_impact_score
    const ringPct = (score / 10) * 100
    const ancestor = ancestorLine(
      result.decomposition_years_min,
      result.decomposition_years_max,
    )
    const headline = buildHeadline(result)

    return (
      <div
        ref={ref}
        // The wrapper sets a fixed width so the captured PNG is
        // exactly 1080×1080 regardless of the parent layout.
        style={{
          width: CARD_PX,
          height: CARD_PX,
          position: offscreen ? "fixed" : "relative",
          left: offscreen ? -99_999 : undefined,
          top: offscreen ? -99_999 : undefined,
          backgroundImage: `linear-gradient(135deg, ${COLORS.gradientStart} 0%, ${COLORS.gradientEnd} 100%)`,
          color: COLORS.onDark,
          fontFamily:
            "'Geist Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
          padding: 64,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 32,
          overflow: "hidden",
          // Subtle vignette so text reads cleanly on busy hero photos.
          boxShadow:
            "inset 0 0 240px rgba(0, 0, 0, 0.18), inset 0 0 80px rgba(0, 0, 0, 0.06)",
        }}
        aria-label={`ReLoop Eco Score ${score}/10 cho ${result.detected_item}`}
      >
        {/* ---------- Top row: hero image + brand ---------- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 32,
          }}
        >
          <div
            style={{
              width: 320,
              height: 320,
              borderRadius: 16,
              overflow: "hidden",
              border: `4px solid ${COLORS.onDark}`,
              boxShadow: "0 16px 48px rgba(0, 0, 0, 0.18)",
              backgroundColor: COLORS.surfaceSoft,
              flexShrink: 0,
            }}
          >
            {/* Hero image. crossOrigin anonymous lets html-to-image
                inline a CORS-clean copy on Supabase public URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={result.detected_item}
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          <div
            style={{
              textAlign: "right",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              ReLoop
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                opacity: 0.92,
              }}
            >
              Shazam cho rác
            </div>
            <div
              style={{
                marginTop: 16,
                padding: "8px 16px",
                borderRadius: 999,
                backgroundColor: COLORS.badgeChip,
                color: COLORS.surfaceText,
                fontSize: 18,
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
              }}
            >
              {material.name_vi}
            </div>
          </div>
        </div>

        {/* ---------- Headline ---------- */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            textShadow: "0 2px 12px rgba(0, 0, 0, 0.18)",
          }}
        >
          {headline}
        </div>

        {ancestor && (
          <div
            style={{
              fontSize: 24,
              fontStyle: "italic",
              opacity: 0.95,
              marginTop: -16,
            }}
          >
            {ancestor}
          </div>
        )}

        {/* ---------- Score ring + meta ---------- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            marginTop: "auto",
          }}
        >
          <ScoreRing score={score} percent={ringPct} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                opacity: 0.85,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              Eco Score
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                lineHeight: 1.4,
                maxWidth: 460,
              }}
            >
              {score <= 3
                ? "Tác động thấp — tái chế dễ."
                : score <= 6
                  ? "Tác động trung bình — cần phân loại đúng."
                  : "Tác động cao — ưu tiên tái sử dụng."}
            </div>
            {unlockedBadge && (
              <div
                style={{
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  alignSelf: "flex-start",
                  padding: "10px 18px",
                  borderRadius: 999,
                  backgroundColor: COLORS.badgeChip,
                  color: COLORS.surfaceText,
                  fontSize: 18,
                  fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
                }}
              >
                <span aria-hidden style={{ fontSize: 22 }}>
                  {unlockedBadge.icon ?? "🏆"}
                </span>
                Mở khóa: {unlockedBadge.name_vi}
              </div>
            )}
          </div>
        </div>

        {/* ---------- Bottom row: watermark + QR ---------- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingTop: 16,
            borderTop: "1px solid rgba(255, 255, 255, 0.32)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 18,
              opacity: 0.92,
            }}
          >
            <div style={{ fontWeight: 700 }}>♻ ReLoop</div>
            <div>Scan rác — đăng listing — kiếm eco-points</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                textAlign: "right",
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              <div style={{ opacity: 0.85, fontSize: 14 }}>Quét để thử</div>
              <div>reloop.app</div>
            </div>
            <QRCode url={shareLandingUrl} size={160} />
          </div>
        </div>
      </div>
    )
  },
)

interface ScoreRingProps {
  score: number
  percent: number
}

/**
 * Circular gauge rendered with raw SVG so it survives html-to-image
 * capture on every browser. Stroke-dashoffset drives the fill ring.
 */
function ScoreRing({ score, percent }: ScoreRingProps) {
  const size = 220
  const stroke = 18
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block" }}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={COLORS.ringTrack}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={COLORS.ringFill}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.onDark,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1 }}>
          {score}
          <span style={{ fontSize: 28, fontWeight: 600, opacity: 0.85 }}>
            /10
          </span>
        </div>
        <div style={{ fontSize: 36, marginTop: 4 }} aria-hidden>
          {impactEmoji(score)}
        </div>
      </div>
    </div>
  )
}
