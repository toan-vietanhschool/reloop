"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  Camera,
  ImageIcon,
  Loader2,
  RefreshCcw,
  ScanLine,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { createClient as createBrowserSupabase } from "@/lib/supabase/client"
import type { VisionResult } from "@/lib/openai/vision"

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

interface ExampleScan {
  imageSrc: string
  alt: string
  itemLabel: string
  materialLabel: string
  materialColor: string
  decompositionLabel: string
}

const HOW_IT_WORKS = [
  {
    icon: Camera,
    title: "1. Chụp",
    body: "Bấm chụp một ảnh đồ vật bất kỳ — không cần ánh sáng đẹp.",
  },
  {
    icon: Wand2,
    title: "2. AI phân tích",
    body: "GPT-4o nhận diện vật liệu, độ tin cậy, mức tác động.",
  },
  {
    icon: ScanLine,
    title: "3. Hành động",
    body: "Gợi ý DIY, điểm thu gom gần nhất, +5 eco-points/scan.",
  },
] as const

const EXAMPLE_SCANS: readonly ExampleScan[] = [
  {
    imageSrc: "/images/materials/pet.jpg",
    alt: "Chai PET đã qua sử dụng",
    itemLabel: "Chai PET",
    materialLabel: "Nhựa PET",
    materialColor: "#3B82F6",
    decompositionLabel: "~450 năm phân hủy",
  },
  {
    imageSrc: "/images/materials/metal-al.jpg",
    alt: "Lon nhôm tái chế",
    itemLabel: "Lon nhôm",
    materialLabel: "Nhôm",
    materialColor: "#6B7280",
    decompositionLabel: "~80 năm phân hủy",
  },
  {
    imageSrc: "/images/materials/paper.jpg",
    alt: "Giấy báo cũ",
    itemLabel: "Báo cũ",
    materialLabel: "Giấy",
    materialColor: "#F59E0B",
    decompositionLabel: "~6 tuần phân hủy",
  },
] as const

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
    const hasNativeShare =
      typeof navigator !== "undefined" && "share" in navigator
    const platform = hasNativeShare ? "web_share_api" : "clipboard"
    track("share_clicked", {
      platform,
      surface: "scan_result",
      material_code: analysis.result.material_code,
    })
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
    <div className="flex w-full flex-col gap-6">
      {!previewUrl && (
        <ScanEmptyState
          isWorking={isWorking}
          onPick={handlePick}
        />
      )}

      {previewUrl && phase !== "analysing" && !analysis && (
        <PreviewPanel
          previewUrl={previewUrl}
          phase={phase}
          uploadedUrl={uploadedUrl}
          isWorking={isWorking}
          onAnalyse={handleAnalyse}
          onReset={reset}
        />
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

interface ScanEmptyStateProps {
  isWorking: boolean
  onPick: (file: File) => void
}

/**
 * The empty-state hero — combines a brand mesh backdrop, dual primary
 * CTAs, "how it works" rhythm strip, and 3 worked examples. This is the
 * largest surface in the scan flow so we lean into editorial layout.
 */
function ScanEmptyState({ isWorking, onPick }: ScanEmptyStateProps) {
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onPick(file)
    event.target.value = ""
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Hero panel ------------------------------------------------ */}
      <section
        aria-label="AI Vision Scan"
        className="relative overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-white shadow-soft-lg"
      >
        {/* Editorial backdrop image with brand wash */}
        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
          <Image
            src="/images/hero/eco-lifestyle.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 720px, 100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-tr from-emerald-900/85 via-emerald-700/55 to-sky-500/35"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.25),transparent_45%)]"
          />

          <div className="relative z-10 flex h-full flex-col justify-end gap-3 p-6 text-white sm:p-10">
            <span className="hero-fade-up inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur">
              <Sparkles className="size-3.5" aria-hidden />
              AI Vision · GPT-4o
            </span>
            <h1 className="hero-fade-up hero-fade-up-2 max-w-xl text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              AI Vision Scan
            </h1>
            <p className="hero-fade-up hero-fade-up-3 max-w-xl text-sm text-white/90 sm:text-base">
              Chụp 1 ảnh đồ vật bất kỳ — chai nhựa, lon nước, túi nilon,
              quần áo cũ. Tớ sẽ nói nó làm bằng gì, phân hủy bao lâu, và
              tái chế ở đâu được.
            </p>
          </div>
        </div>

        {/* Dual primary CTAs sit on the seam between hero and content */}
        <div className="-mt-7 px-4 sm:-mt-8 sm:px-10">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CtaPill
              label="Chụp ảnh"
              hint="Camera trực tiếp"
              icon={<Camera className="size-5" aria-hidden />}
              accent="emerald"
              capture="environment"
              disabled={isWorking}
              onChange={handleInputChange}
            />
            <CtaPill
              label="Chọn từ thư viện"
              hint="Upload ảnh có sẵn"
              icon={<ImageIcon className="size-5" aria-hidden />}
              accent="sky"
              disabled={isWorking}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* How-it-works rhythm strip --------------------------------- */}
        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden border-t border-emerald-100 bg-emerald-100/60 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.title} className="bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-emerald-700">
                <step.icon className="size-4" aria-hidden />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  {step.title}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Examples gallery ------------------------------------------- */}
      <section aria-label="Ví dụ scan thành công" className="space-y-4">
        <header className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Trải nghiệm thật
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              Ví dụ scan thành công
            </h2>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Bạn cũng sẽ nhận kết quả tương tự sau ~3 giây.
          </p>
        </header>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {EXAMPLE_SCANS.map((example) => (
            <li
              key={example.itemLabel}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={example.imageSrc}
                  alt={example.alt}
                  fill
                  sizes="(min-width: 640px) 240px, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span
                  className="absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm"
                  style={{ backgroundColor: example.materialColor }}
                >
                  {example.materialLabel}
                </span>
              </div>
              <div className="space-y-1 px-4 py-3">
                <p className="text-sm font-semibold tracking-tight">
                  {example.itemLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {example.decompositionLabel}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

interface CtaPillProps {
  label: string
  hint: string
  icon: React.ReactNode
  accent: "emerald" | "sky"
  capture?: "environment" | "user"
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const CTA_ACCENT: Record<
  CtaPillProps["accent"],
  { ring: string; iconBg: string; iconText: string; hover: string; bg: string }
> = {
  emerald: {
    ring: "ring-emerald-500/40 hover:ring-emerald-500/70",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    hover: "hover:bg-emerald-50",
    bg: "bg-white",
  },
  sky: {
    ring: "ring-sky-500/40 hover:ring-sky-500/70",
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
    hover: "hover:bg-sky-50",
    bg: "bg-white",
  },
}

/**
 * Large CTA tile — replaces the default "outline button" feel with a
 * surfaced card that contains a single hidden file input. Designed
 * focus + hover state per `~/.claude/rules/ecc/web/design-quality.md`.
 */
function CtaPill({
  label,
  hint,
  icon,
  accent,
  capture,
  disabled,
  onChange,
}: CtaPillProps) {
  const c = CTA_ACCENT[accent]
  return (
    <label
      className={`group relative flex cursor-pointer items-center gap-4 rounded-2xl ${c.bg} ${c.hover} px-5 py-4 shadow-soft-lg ring-1 ${c.ring} transition-all focus-within:ring-2 hover:-translate-y-0.5 hover:shadow-brand ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <input
        type="file"
        accept="image/*"
        capture={capture}
        className="sr-only"
        onChange={onChange}
        disabled={disabled}
      />
      <span
        aria-hidden
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${c.iconBg} ${c.iconText} transition-transform group-hover:scale-105`}
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-base font-semibold tracking-tight">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
      <span
        aria-hidden
        className="ml-auto inline-flex size-8 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:bg-foreground/10"
      >
        <Upload className="size-4" />
      </span>
    </label>
  )
}

interface PreviewPanelProps {
  previewUrl: string
  phase: Phase
  uploadedUrl: string | null
  isWorking: boolean
  onAnalyse: () => void
  onReset: () => void
}

function PreviewPanel({
  previewUrl,
  phase,
  uploadedUrl,
  isWorking,
  onAnalyse,
  onReset,
}: PreviewPanelProps) {
  return (
    <section
      aria-label="Ảnh đã chọn"
      className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft-lg"
    >
      <div className="grid gap-0 sm:grid-cols-[1.05fr_1fr]">
        <div className="relative isolate aspect-square w-full overflow-hidden bg-muted/40 sm:aspect-auto sm:min-h-[24rem]">
          {/* Soft brand wash behind image so portrait crops feel intentional */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-mesh opacity-90"
          />
          {/* Local Blob URL — keep <img> for simplicity (no domain config). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Ảnh đã chụp"
            className="absolute inset-0 m-auto max-h-[28rem] w-auto max-w-full object-contain p-6"
          />
          <div
            aria-hidden
            className="absolute inset-x-6 bottom-6 h-14 rounded-full bg-black/15 blur-2xl"
          />
        </div>

        <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
          <div className="space-y-3">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              <Sparkles className="size-3.5" aria-hidden />
              Sẵn sàng phân tích
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              Ảnh trông tuyệt đấy!
            </h2>
            <p className="text-sm text-muted-foreground">
              AI sẽ nhận diện vật liệu, ước tính thời gian phân hủy và đề
              xuất 3 ý tưởng tái chế cho bạn.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              size="lg"
              className="h-12 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 text-base font-semibold shadow-brand hover:shadow-soft-lg hover:brightness-105"
              onClick={onAnalyse}
              disabled={isWorking || !uploadedUrl}
            >
              {phase === "analysing" ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Đang phân tích…
                </>
              ) : phase === "uploading" ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Đang tải ảnh lên…
                </>
              ) : phase === "compressing" ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Đang nén ảnh…
                </>
              ) : (
                <>
                  <Wand2 className="mr-1.5 size-4" aria-hidden />
                  Phân tích bằng AI
                </>
              )}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12 w-full text-base"
              onClick={onReset}
              disabled={phase === "analysing"}
            >
              <RefreshCcw className="mr-1.5 size-4" aria-hidden />
              Chụp lại
            </Button>
          </div>
        </div>
      </div>
    </section>
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
