"use client"

import { useRef } from "react"
import { Camera, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CameraCaptureProps {
  onPick: (file: File) => void
  disabled?: boolean
}

/**
 * Reusable camera/upload trigger. On mobile, the `capture` attribute
 * forces the rear camera; desktop browsers fall back to the file
 * picker. We intentionally accept exactly ONE file at a time.
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
      <Button
        type="button"
        size="lg"
        className="h-14 flex-1 text-base"
        onClick={() => cameraInputRef.current?.click()}
        disabled={disabled}
      >
        <Camera className="mr-2 size-5" />
        Chụp ảnh
      </Button>
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="h-14 flex-1 text-base"
        onClick={() => galleryInputRef.current?.click()}
        disabled={disabled}
      >
        <ImageIcon className="mr-2 size-5" />
        Chọn từ thư viện
      </Button>
    </div>
  )
}
