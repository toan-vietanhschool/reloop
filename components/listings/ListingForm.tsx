"use client"

import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { toast } from "sonner"

import { createListing } from "@/actions/listings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  INTENT_OPTIONS,
  MATERIAL_OPTIONS,
  type ListingIntent,
  type MaterialCode,
} from "@/lib/material"
import { MAX_PHOTOS } from "@/lib/validators/listing"

interface ListingFormProps {
  defaultCity?: string
}

interface PendingPhoto {
  id: string
  file: File
  previewUrl: string
}

const MAX_DIMENSION_PX = 1024
const TARGET_QUALITY = 0.8

export function ListingForm({ defaultCity }: ListingFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [intent, setIntent] = useState<ListingIntent>("give")
  const [materialCode, setMaterialCode] = useState<MaterialCode>("PET")
  const [condition, setCondition] = useState<string>("")
  const [city, setCity] = useState<string>(defaultCity ?? "")
  const [photos, setPhotos] = useState<PendingPhoto[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) return

    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      toast.warning(`Tối đa ${MAX_PHOTOS} ảnh`)
      event.target.value = ""
      return
    }

    const incoming = Array.from(fileList).slice(0, remaining)
    setIsCompressing(true)
    try {
      const compressedPromises = incoming.map(async (file) => {
        try {
          const compressed = await compressImage(file)
          return {
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file: compressed,
            previewUrl: URL.createObjectURL(compressed),
          }
        } catch {
          return {
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            previewUrl: URL.createObjectURL(file),
          }
        }
      })
      const compressed = await Promise.all(compressedPromises)
      setPhotos((existing) => [...existing, ...compressed])
    } catch {
      toast.error("Không thể xử lý ảnh, vui lòng thử lại.")
    } finally {
      setIsCompressing(false)
      event.target.value = ""
    }
  }

  function removePhoto(id: string) {
    setPhotos((existing) => {
      const target = existing.find((p) => p.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return existing.filter((p) => p.id !== id)
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("intent", intent)
    formData.append("material_code", materialCode)
    if (condition) formData.append("condition", condition)
    if (city) formData.append("city", city)
    photos.forEach((photo) => {
      formData.append("photos", photo.file, photo.file.name)
    })

    setIsSubmitting(true)
    try {
      const result = await createListing(formData)
      if (result.error || !result.data) {
        toast.error("Không thể đăng tin", {
          description: result.error ?? "Lỗi không xác định",
        })
        return
      }
      toast.success("Đã đăng tin thành công", {
        description: "Bài đăng đang được kiểm duyệt.",
      })
      router.push(`/listings/${result.data.id}`)
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định"
      toast.error("Không thể đăng tin", { description: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit =
    !isSubmitting && !isCompressing && title.trim().length >= 3

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-border/60 bg-card p-5 shadow-sm md:p-7"
    >
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Tiêu đề <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Tặng 5 chai PET sạch"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          Mô tả
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Thông tin thêm về món đồ, tình trạng, cách giao nhận..."
          disabled={isSubmitting}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="intent" className="text-sm font-medium">
            Mục đích <span className="text-destructive">*</span>
          </label>
          <select
            id="intent"
            name="intent"
            required
            value={intent}
            onChange={(e) => setIntent(e.target.value as ListingIntent)}
            disabled={isSubmitting}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {INTENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} — {option.description}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="material" className="text-sm font-medium">
            Vật liệu <span className="text-destructive">*</span>
          </label>
          <select
            id="material"
            name="material_code"
            required
            value={materialCode}
            onChange={(e) => setMaterialCode(e.target.value as MaterialCode)}
            disabled={isSubmitting}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {MATERIAL_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name_vi}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="condition" className="text-sm font-medium">
            Tình trạng (1-5)
          </label>
          <select
            id="condition"
            name="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            disabled={isSubmitting}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Không chỉ định</option>
            <option value="1">★ — Hỏng / cần sửa</option>
            <option value="2">★★ — Cũ, vẫn dùng được</option>
            <option value="3">★★★ — Bình thường</option>
            <option value="4">★★★★ — Tốt</option>
            <option value="5">★★★★★ — Như mới</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="city" className="text-sm font-medium">
            Thành phố
          </label>
          <Input
            id="city"
            name="city"
            maxLength={80}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ví dụ: TP.HCM"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="photos" className="text-sm font-medium">
          Ảnh (tối đa {MAX_PHOTOS})
        </label>
        <input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          disabled={isSubmitting || isCompressing || photos.length >= MAX_PHOTOS}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80 disabled:opacity-50"
        />
        {isCompressing ? (
          <p className="text-xs text-muted-foreground">Đang nén ảnh...</p>
        ) : null}

        {photos.length > 0 ? (
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {photos.map((photo) => (
              <li
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-md border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt="Ảnh xem trước"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  disabled={isSubmitting}
                  aria-label="Xóa ảnh"
                  className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/85 text-sm font-bold shadow hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-5">
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-11 bg-emerald-600 px-6 text-white shadow-md hover:bg-emerald-700"
        >
          {isSubmitting ? "Đang đăng..." : "Đăng tin"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="h-11"
        >
          Hủy
        </Button>
        <p className="ml-auto text-[11px] text-muted-foreground">
          Bài đăng sẽ được kiểm duyệt trước khi hiển thị công khai.
        </p>
      </div>
    </form>
  )
}

/**
 * Lazy-load `browser-image-compression` to avoid pulling it into the
 * initial JS bundle. Falls back to the original file if the library
 * fails or if the dev environment hasn't installed it yet.
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
