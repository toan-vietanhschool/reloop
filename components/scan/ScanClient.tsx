"use client"

import { useEffect, useState } from "react"
import { Loader2, RefreshCcw, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient as createBrowserSupabase } from "@/lib/supabase/client"
import type { VisionResult } from "@/lib/openai/vision"

import { CameraCapture } from "./CameraCapture"
import { ResultCard } from "./ResultCard"
import { ScanResultSkeleton } from "./Skeleton"

const MAX_DIMENSION_PX = 1024
const TARGET_QUALITY = 0.8
const STORAGE_BUCKET = "scans"

type Phase = "idle" | "compressing" | "uploading" | "analysing" | "done"

interface AnalysisState {
  result: VisionResult
  cached: boolean
}

export function ScanClient() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null)

  // Revoke object URLs when the preview changes/unmounts to avoid leaks.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setUploadedUrl(null)
    setAnalysis(null)
    setPhase("idle")
  }

  async function handlePick(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh.")
      return
    }

    setAnalysis(null)
    setUploadedUrl(null)
    setPhase("compressing")

    const compressed = await compressImage(file)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(compressed))

    setPhase("uploading")
    try {
      const url = await uploadToSupabase(compressed)
      setUploadedUrl(url)
      setPhase("idle")
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Không thể upload ảnh."
      toast.error(message)
      setPhase("idle")
    }
  }

  async function handleAnalyse() {
    if (!uploadedUrl) {
      toast.error("Chưa có ảnh để phân tích.")
      return
    }

    setPhase("analysing")
    const toastId = toast.loading("AI đang phân tích ảnh của bạn…")
    try {
      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadedUrl }),
      })

      const json = (await res.json()) as {
        data: VisionResult | null
        cached?: boolean
        error?: string
      }

      if (!res.ok || !json.data) {
        const errMsg = json.error ?? `HTTP ${res.status}`
        toast.error(errMsg, { id: toastId })
        setPhase("idle")
        return
      }

      setAnalysis({ result: json.data, cached: Boolean(json.cached) })
      setPhase("done")
      toast.success(
        json.cached
          ? "Lấy kết quả từ cache (cùng ảnh đã scan trước đó)"
          : "Phân tích xong! +5 eco-points 🌱",
        { id: toastId },
      )
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Có lỗi khi gọi AI."
      toast.error(message, { id: toastId })
      setPhase("idle")
    }
  }

  async function handleShare() {
    if (!analysis) return
    const text = `Tớ vừa scan "${analysis.result.detected_item}" trên ReLoop — ${analysis.result.material_code}, phân hủy ~${analysis.result.decomposition_years_min} năm 🌱`
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text, title: "ReLoop AI Scan" })
        return
      }
      await navigator.clipboard.writeText(text)
      toast.success("Đã copy kết quả vào clipboard!")
    } catch {
      // user cancelled — ignore
    }
  }

  function handleSaveHistory() {
    // Cache row already saved server-side. Surface confirmation.
    toast.success("Kết quả đã được lưu vào lịch sử scan của bạn.")
  }

  const isWorking =
    phase === "compressing" ||
    phase === "uploading" ||
    phase === "analysing"

  return (
    <div className="flex w-full flex-col">
      {!previewUrl && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              Chụp 1 ảnh đồ vật bất kỳ — chai nhựa, lon nước, túi nilon,
              quần áo cũ… AI sẽ nhận diện vật liệu và gợi ý cách tái chế.
            </p>
            <CameraCapture onPick={handlePick} disabled={isWorking} />
          </CardContent>
        </Card>
      )}

      {previewUrl && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl border bg-muted">
              {/* Preview is always a local Blob URL — keep <img> for simplicity. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Ảnh đã chụp"
                className="size-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="flex-1"
                onClick={handleAnalyse}
                disabled={isWorking || !uploadedUrl}
              >
                {phase === "analysing" ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang phân tích…
                  </>
                ) : phase === "uploading" ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang tải ảnh lên…
                  </>
                ) : phase === "compressing" ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang nén ảnh…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Phân tích bằng AI
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={reset}
                disabled={phase === "analysing"}
              >
                <RefreshCcw className="mr-2 size-4" />
                Chụp lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "analysing" && <ScanResultSkeleton />}

      {analysis && previewUrl && (
        <ResultCard
          result={analysis.result}
          imageUrl={previewUrl}
          cached={analysis.cached}
          onShare={handleShare}
          onSaveHistory={handleSaveHistory}
        />
      )}
    </div>
  )
}

/**
 * Lazy-load `browser-image-compression` to avoid pulling it into the
 * initial JS bundle. Mirrors the pattern in components/listings/ListingForm.tsx.
 */
async function compressImage(file: File): Promise<File> {
  try {
    const mod = await import("browser-image-compression")
    const compress = mod.default ?? mod
    const compressed = await compress(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: MAX_DIMENSION_PX,
      initialQuality: TARGET_QUALITY,
      useWebWorker: true,
      fileType: "image/jpeg",
    })
    return compressed instanceof File
      ? compressed
      : new File([compressed], file.name, { type: "image/jpeg" })
  } catch {
    return file
  }
}

/**
 * Upload a compressed JPEG to the `scans` bucket scoped by user id.
 * Returns the public URL ready to send to the analyse-image route.
 */
async function uploadToSupabase(file: File): Promise<string> {
  const supabase = createBrowserSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Bạn cần đăng nhập để dùng AI Scan.")
  }

  const path = `${user.id}/${Date.now()}.jpg`
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: "image/jpeg",
      upsert: false,
    })
  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path)
  if (!publicUrlData?.publicUrl) {
    throw new Error("Không thể lấy URL công khai của ảnh.")
  }
  return publicUrlData.publicUrl
}
