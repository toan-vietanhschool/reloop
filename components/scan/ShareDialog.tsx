"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Download, Globe, Loader2, Share2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import {
  buildEcoScoreFilename,
  buildFacebookShareUrl,
  captureNode,
  downloadBlob,
  generateCaption,
  shareViaWebShare,
} from "@/lib/share"
import type { VisionResult } from "@/lib/openai/vision"

import { EcoScoreCard } from "./EcoScoreCard"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: VisionResult
  imageUrl: string
  unlockedBadge?: { code: string; name_vi: string; icon?: string | null } | null
}

const SHARE_LANDING_URL = "https://reloop.vercel.app/?ref=eco-card"

/**
 * Modal that lets the user export their scan as a 1080×1080 PNG and
 * share it on mobile (Web Share API) or desktop (download / Facebook
 * intent).
 *
 * The actual capture target — `<EcoScoreCard>` — is rendered offscreen
 * so the user only sees the on-brand preview thumbnail in the dialog.
 * We keep the offscreen mount only while `open` is true to avoid
 * leaking image elements when the dialog is dismissed.
 */
export function ShareDialog({
  open,
  onOpenChange,
  result,
  imageUrl,
  unlockedBadge,
}: ShareDialogProps) {
  const captureRef = useRef<HTMLDivElement | null>(null)
  const [busy, setBusy] = useState<"download" | "share" | "facebook" | null>(
    null,
  )

  const caption = useMemo(() => generateCaption(result), [result])

  // Close on Escape — symmetric with BadgeUnlockDialog/PinPointDialog.
  useEffect(() => {
    if (!open) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onOpenChange])

  if (!open) return null

  async function handleCapture(): Promise<Blob | null> {
    if (!captureRef.current) {
      toast.error("Card chưa sẵn sàng. Thử lại sau giây lát.")
      return null
    }
    try {
      return await captureNode(captureRef.current)
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tạo ảnh PNG. Thử lại nhé."
      toast.error(message)
      return null
    }
  }

  async function handleDownload() {
    setBusy("download")
    const blob = await handleCapture()
    if (!blob) {
      setBusy(null)
      return
    }
    const filename = buildEcoScoreFilename(result.material_code)
    downloadBlob(blob, filename)
    track("share_clicked", {
      target: "download",
      score: result.environmental_impact_score,
      material: result.material_code,
      detected_item: result.detected_item,
    })
    toast.success("Đã tải PNG về máy 🎉")
    setBusy(null)
  }

  async function handleShare() {
    setBusy("share")
    const blob = await handleCapture()
    if (!blob) {
      setBusy(null)
      return
    }
    const shared = await shareViaWebShare({
      blob,
      caption,
      title: "ReLoop AI Scan",
      filename: buildEcoScoreFilename(result.material_code),
    })
    if (shared) {
      track("share_clicked", {
        target: "web_share",
        score: result.environmental_impact_score,
        material: result.material_code,
        detected_item: result.detected_item,
      })
      toast.success("Đã chia sẻ 🚀")
      setBusy(null)
      return
    }

    // Fallback: copy caption to clipboard so the user can paste anywhere.
    try {
      await navigator.clipboard.writeText(caption)
      track("share_clicked", {
        target: "clipboard",
        score: result.environmental_impact_score,
        material: result.material_code,
        detected_item: result.detected_item,
      })
      toast.success("Đã copy caption vào clipboard")
    } catch {
      toast.error("Trình duyệt không hỗ trợ chia sẻ trực tiếp.")
    }
    setBusy(null)
  }

  function handleFacebook() {
    setBusy("facebook")
    const fbUrl = buildFacebookShareUrl(SHARE_LANDING_URL, caption)
    track("share_clicked", {
      target: "facebook",
      score: result.environmental_impact_score,
      material: result.material_code,
      detected_item: result.detected_item,
    })
    window.open(
      fbUrl,
      "_blank",
      "noopener,noreferrer,width=640,height=560",
    )
    toast.message(
      "Mở cửa sổ Facebook. Kéo-thả PNG đã tải để đính kèm vào bài đăng.",
    )
    setBusy(null)
  }

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <button
        type="button"
        aria-label="Đóng hộp thoại"
        className="absolute inset-0 cursor-default"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-2xl">
        <header className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2
              id="share-dialog-title"
              className="text-lg font-bold tracking-tight"
            >
              Chia sẻ kết quả
            </h2>
            <p className="text-xs text-muted-foreground">
              Tải PNG vuông 1080×1080 (Instagram-ready) hoặc share trực tiếp.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          {/* Visual preview — scaled-down clone of the capture card so
              the user can confirm what will be shared. */}
          <PreviewThumbnail
            result={result}
            imageUrl={imageUrl}
            unlockedBadge={unlockedBadge}
          />

          <div className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Caption gợi ý:</span>{" "}
            {caption}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={handleDownload}
              disabled={busy !== null}
              className="flex-1"
            >
              {busy === "download" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              Tải về (PNG)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleShare}
              disabled={busy !== null}
              className="flex-1"
            >
              {busy === "share" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 size-4" />
              )}
              Chia sẻ
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleFacebook}
              disabled={busy !== null}
              className="flex-1"
            >
              <Globe className="mr-2 size-4" />
              Facebook
            </Button>
          </div>

          <p className="text-[11px] italic text-muted-foreground">
            Lưu ý: Facebook không cho upload ảnh qua URL — sau khi nhấn
            &quot;Facebook&quot;, hãy tải PNG về và kéo-thả vào ô soạn bài.
          </p>
        </div>
      </div>

      {/* Offscreen capture target — fixed at 1080×1080 so the PNG
          comes out at full Instagram-square resolution. */}
      <EcoScoreCard
        ref={captureRef}
        result={result}
        imageUrl={imageUrl}
        unlockedBadge={unlockedBadge}
        offscreen
      />
    </div>
  )
}

interface PreviewThumbnailProps {
  result: VisionResult
  imageUrl: string
  unlockedBadge?: { code: string; name_vi: string; icon?: string | null } | null
}

/**
 * In-dialog preview. We render a smaller, layout-only version of the
 * card so the user can confirm what the PNG will look like before
 * committing to a download/share.
 */
function PreviewThumbnail({
  result,
  imageUrl,
  unlockedBadge,
}: PreviewThumbnailProps) {
  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-xl"
      style={{
        backgroundImage:
          "linear-gradient(135deg, oklch(70% 0.18 160) 0%, oklch(70% 0.18 220) 100%)",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
      }}
    >
      <div className="flex h-full flex-col gap-3 p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="size-20 shrink-0 overflow-hidden rounded-lg border-2 border-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={result.detected_item}
              className="size-full object-cover"
            />
          </div>
          <div className="text-right">
            <div className="text-lg font-extrabold leading-none">ReLoop</div>
            <div className="text-[11px] opacity-90">Shazam cho rác</div>
          </div>
        </div>
        <div className="text-base font-bold leading-snug">
          {result.detected_item}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-80">
              Eco Score
            </div>
            <div className="text-3xl font-extrabold leading-none">
              {result.environmental_impact_score}
              <span className="text-base font-semibold opacity-80">/10</span>
            </div>
            {unlockedBadge && (
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-900">
                <span aria-hidden>{unlockedBadge.icon ?? "🏆"}</span>
                {unlockedBadge.name_vi}
              </div>
            )}
          </div>
          <div className="text-right text-[10px] opacity-90">
            reloop.app
            <div className="opacity-70">Quét để thử</div>
          </div>
        </div>
      </div>
    </div>
  )
}
