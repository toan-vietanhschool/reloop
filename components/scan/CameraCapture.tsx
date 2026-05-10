"use client"

import { useRef } from "react"
import { Camera, ImageIcon, Upload } from "lucide-react"

interface CameraCaptureProps {
  onPick: (file: File) => void
  disabled?: boolean
}

/**
 * Reusable camera/upload trigger pair. On mobile, the `capture`
 * attribute forces the rear camera; desktop browsers fall back to the
 * file picker. We intentionally accept exactly ONE file at a time.
 *
 * Visual treatment matches the editorial CTAs used in `ScanClient` —
 * surfaced cards with rings instead of plain buttons.
 */
export function CameraCapture({ onPick, disabled }: CameraCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      onPick(file)
    }
    // Reset so picking the same file again still triggers onChange.
    event.target.value = ""
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <CtaCard
        accent="emerald"
        label="Chụp ảnh"
        hint="Camera trực tiếp"
        icon={<Camera className="size-5" aria-hidden />}
        disabled={disabled}
        onClick={() => cameraInputRef.current?.click()}
      />
      <CtaCard
        accent="sky"
        label="Chọn từ thư viện"
        hint="Upload ảnh có sẵn"
        icon={<ImageIcon className="size-5" aria-hidden />}
        disabled={disabled}
        onClick={() => galleryInputRef.current?.click()}
      />
    </div>
  )
}

interface CtaCardProps {
  accent: "emerald" | "sky"
  label: string
  hint: string
  icon: React.ReactNode
  disabled?: boolean
  onClick: () => void
}

const CTA_ACCENT: Record<
  CtaCardProps["accent"],
  { ring: string; iconBg: string; iconText: string; hover: string }
> = {
  emerald: {
    ring: "ring-emerald-500/40 hover:ring-emerald-500/70",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    hover: "hover:bg-emerald-50",
  },
  sky: {
    ring: "ring-sky-500/40 hover:ring-sky-500/70",
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
    hover: "hover:bg-sky-50",
  },
}

function CtaCard({ accent, label, hint, icon, disabled, onClick }: CtaCardProps) {
  const c = CTA_ACCENT[accent]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm ring-1 transition-all hover:-translate-y-0.5 hover:shadow-soft-lg focus:outline-none focus-visible:ring-2 ${c.ring} ${c.hover} ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <span
        aria-hidden
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${c.iconBg} ${c.iconText} transition-transform group-hover:scale-105`}
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold tracking-tight">{label}</span>
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      </span>
      <span
        aria-hidden
        className="ml-auto inline-flex size-7 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground transition-all group-hover:translate-x-1"
      >
        <Upload className="size-3.5" />
      </span>
    </button>
  )
}
