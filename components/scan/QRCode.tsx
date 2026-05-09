"use client"

import { useEffect, useState } from "react"

interface QRCodeProps {
  /**
   * URL to encode. When `qrcode.react` is installed at runtime we
   * generate a fresh QR; otherwise we fall back to the static
   * pre-generated SVG at `/qr-share.svg`.
   */
  url: string
  /** Render size in CSS pixels (the SVG itself is square). */
  size?: number
  /** Hex foreground colour for the modules. */
  fgColor?: string
  /** Hex background colour. */
  bgColor?: string
  /** Optional className for layout overrides. */
  className?: string
}

interface QRCodeSvgComponentProps {
  value: string
  size: number
  fgColor: string
  bgColor: string
  level: "L" | "M" | "Q" | "H"
  includeMargin: boolean
}

/**
 * Embed a QR code in the share card.
 *
 * Strategy:
 *   - Try to dynamically import `qrcode.react`. If installed, it
 *     produces a real, scannable QR for the live URL — useful when
 *     the share card embeds a deep-link (e.g. `?ref=share`).
 *   - If the package is missing (this is the MVP path), fall back to
 *     the static SVG at `/qr-share.svg`. The static SVG is regenerated
 *     by a production cron whenever the share landing URL changes.
 *
 * The fallback path keeps the component synchronous on first paint —
 * critical because html-to-image captures the DOM as soon as the
 * dialog mounts, and an `<img>` tag with a same-origin SVG src renders
 * deterministically before the capture call.
 */
export function QRCode({
  url,
  size = 160,
  fgColor = "#0f172a",
  bgColor = "#ffffff",
  className,
}: QRCodeProps) {
  const [DynamicQR, setDynamicQR] = useState<
    React.ComponentType<QRCodeSvgComponentProps> | null
  >(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const mod = (await import("qrcode.react")) as {
          QRCodeSVG?: React.ComponentType<QRCodeSvgComponentProps>
          default?: React.ComponentType<QRCodeSvgComponentProps>
        }
        const component = mod.QRCodeSVG ?? mod.default ?? null
        if (!cancelled && component) setDynamicQR(() => component)
      } catch {
        // qrcode.react not installed — keep static fallback.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (DynamicQR) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          borderRadius: 12,
          padding: 8,
        }}
      >
        <DynamicQR
          value={url}
          size={size - 16}
          fgColor={fgColor}
          bgColor={bgColor}
          level="M"
          includeMargin={false}
        />
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        borderRadius: 12,
        padding: 8,
      }}
    >
      {/* Static fallback. The crossOrigin attribute is unnecessary
          because the SVG is same-origin (served from /public). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/qr-share.svg"
        alt="Mã QR đến reloop.app"
        width={size - 16}
        height={size - 16}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  )
}
