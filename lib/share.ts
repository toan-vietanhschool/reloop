/**
 * Share helpers for T2-08 Eco Score Card.
 *
 * Responsibilities:
 *   - Capture an arbitrary DOM node as a 1080×1080 PNG blob via
 *     html-to-image (dynamic import — keeps the heavy canvas/svg code
 *     out of the initial bundle).
 *   - Auto-generate a Vietnamese caption from a `VisionResult` so the
 *     user can paste/share without typing.
 *   - Wrap `navigator.share()` with a clean boolean return so the
 *     caller can fall back to download / clipboard.
 *   - Trigger a same-tab download for desktop browsers without Web
 *     Share API support.
 *
 * Notes:
 *   - All functions are runtime-safe in SSR — they early-return when
 *     `window` is undefined.
 *   - `html-to-image` is intentionally NOT a hard dependency at compile
 *     time. The dynamic import lets `pnpm install` run before the
 *     dialog is ever opened. If the package is missing, `captureNode`
 *     throws a friendly Vietnamese error so the dialog can toast it.
 */

import type { VisionResult } from "@/lib/openai/vision"

const PNG_PIXEL_RATIO = 2

/**
 * Render `node` to a PNG Blob at 2x pixel density.
 *
 * Pixel ratio 2 doubles the rendered resolution of the 1080×1080 card
 * to 2160×2160 — Instagram and Facebook compress hard, so the higher
 * source quality survives the upload pipeline.
 *
 * `cacheBust: true` adds a query param to image src URLs so we don't
 * accidentally re-use a stale CORS-tainted canvas snapshot from a
 * previous render.
 */
export async function captureNode(node: HTMLElement): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("captureNode chỉ chạy trên trình duyệt.")
  }

  type HtmlToImageToBlob = (
    node: HTMLElement,
    options?: Record<string, unknown>,
  ) => Promise<Blob | null>

  let toBlob: HtmlToImageToBlob | null = null

  try {
    // Dynamic import — keeps the heavy SVG/canvas serializer out of
    // the initial bundle. Catching keeps the build green even when
    // the package is temporarily missing in dev.
    const mod = (await import("html-to-image")) as unknown as {
      toBlob?: HtmlToImageToBlob
    }
    toBlob = mod.toBlob ?? null
  } catch {
    toBlob = null
  }

  if (!toBlob) {
    throw new Error(
      "Thiếu thư viện html-to-image. Chạy `pnpm install` để cài đặt.",
    )
  }

  const blob = await toBlob(node, {
    pixelRatio: PNG_PIXEL_RATIO,
    cacheBust: true,
    backgroundColor: "#ffffff",
  })
  if (!blob) {
    throw new Error("Không thể tạo ảnh PNG.")
  }
  return blob
}

/**
 * Convert decomposition years into a "ancestor generations" pun.
 * 25 years per generation — same constant as `ResultCard.tsx`.
 */
function generationsFromYears(years: number): number {
  return Math.max(0, Math.floor(years / 25))
}

/**
 * Auto-generate a Vietnamese share caption from a VisionResult.
 *
 * Tone follows playbook §7.1 — punchy, slightly absurd, ends with a
 * call-to-action that drives traffic back to reloop.app.
 */
export function generateCaption(result: VisionResult): string {
  const years = result.decomposition_years_max ?? result.decomposition_years_min
  const generations = generationsFromYears(years)
  const gensLine =
    generations >= 4
      ? `, sống lâu hơn ông cố tôi ${generations} đời 🤯`
      : ""
  return [
    `Tôi vừa scan "${result.detected_item}"${gensLine}`,
    `Eco Score ${result.environmental_impact_score}/10. Bạn thử xem? reloop.app`,
  ].join("\n")
}

interface WebSharePayload {
  blob: Blob
  caption: string
  title?: string
  filename?: string
}

/**
 * Share via the Web Share API (mobile Safari/Chrome on Android).
 *
 * Returns true when the share dialog was actually opened. Returns
 * false when the API is unavailable, when files can't be shared, or
 * when the user cancels — callers can then fall back to download /
 * clipboard / Facebook intent.
 */
export async function shareViaWebShare(
  payload: WebSharePayload,
): Promise<boolean> {
  if (typeof navigator === "undefined") return false
  if (typeof navigator.share !== "function") return false

  const file = new File(
    [payload.blob],
    payload.filename ?? "eco-score.png",
    { type: payload.blob.type || "image/png" },
  )
  const data: ShareData = {
    title: payload.title ?? "ReLoop AI Scan",
    text: payload.caption,
    files: [file],
  }

  // canShare is the only reliable feature-detect for file shares.
  const canShareFiles =
    typeof navigator.canShare === "function" && navigator.canShare(data)
  if (!canShareFiles) return false

  try {
    await navigator.share(data)
    return true
  } catch (error: unknown) {
    // AbortError = user cancelled, treat as a no-op fallback.
    if (
      error instanceof DOMException &&
      (error.name === "AbortError" || error.name === "NotAllowedError")
    ) {
      return false
    }
    return false
  }
}

/**
 * Trigger a same-tab download via a temporary anchor element.
 * Works in every modern browser and does not require user gesture
 * permissions beyond the original click.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  // Defer revoke so Safari has time to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

/**
 * Build a Facebook sharer URL for a given landing page. Facebook does
 * NOT accept file uploads via URL — the user has to drag-drop the PNG
 * into the post editor manually after the sharer dialog opens. We
 * still pass the landing URL so the OG card preview shows correctly.
 */
export function buildFacebookShareUrl(landingUrl: string, quote: string): string {
  const params = new URLSearchParams({
    u: landingUrl,
    quote,
  })
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
}

/**
 * Compose a deterministic filename for the downloaded PNG so users
 * can re-find scans in their Downloads folder.
 */
export function buildEcoScoreFilename(materialCode: string): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-")
  return `eco-score-${materialCode.toLowerCase()}-${ts}.png`
}
