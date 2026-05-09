"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { updateProfile } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProfileEditFormDefaults {
  display_name: string
  bio: string
  city: string
  avatar_url: string
}

interface ProfileEditFormProps {
  defaultValues: ProfileEditFormDefaults
}

const DISPLAY_NAME_MIN = 2
const DISPLAY_NAME_MAX = 50
const BIO_MAX = 200
const CITY_MAX = 80

function isValidUrl(value: string): boolean {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function ProfileEditForm({ defaultValues }: ProfileEditFormProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(defaultValues.display_name)
  const [bio, setBio] = useState(defaultValues.bio)
  const [city, setCity] = useState(defaultValues.city)
  const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatar_url)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = displayName.trim()
    if (
      trimmedName.length < DISPLAY_NAME_MIN ||
      trimmedName.length > DISPLAY_NAME_MAX
    ) {
      toast.error(
        `Tên hiển thị cần ${DISPLAY_NAME_MIN}–${DISPLAY_NAME_MAX} ký tự.`,
      )
      return
    }
    if (bio.length > BIO_MAX) {
      toast.error(`Bio tối đa ${BIO_MAX} ký tự.`)
      return
    }
    if (city.length > CITY_MAX) {
      toast.error(`Thành phố tối đa ${CITY_MAX} ký tự.`)
      return
    }
    if (!isValidUrl(avatarUrl.trim())) {
      toast.error("URL avatar không hợp lệ — cần bắt đầu bằng http:// hoặc https://.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateProfile({
        display_name: trimmedName,
        bio: bio.trim() || null,
        city: city.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })

      if (!result.success) {
        toast.error(result.error ?? "Không thể lưu hồ sơ.")
        return
      }

      toast.success("Đã lưu hồ sơ.")
      router.push("/profile")
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field
        id="display_name"
        label="Tên hiển thị"
        required
        hint={`${DISPLAY_NAME_MIN}–${DISPLAY_NAME_MAX} ký tự`}
      >
        <Input
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          minLength={DISPLAY_NAME_MIN}
          maxLength={DISPLAY_NAME_MAX}
          required
          autoComplete="name"
        />
      </Field>

      <Field
        id="bio"
        label="Giới thiệu"
        hint={`${bio.length}/${BIO_MAX} ký tự`}
      >
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={BIO_MAX}
          rows={3}
          className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Bạn quan tâm đến tái chế gì? (tuỳ chọn)"
        />
      </Field>

      <Field id="city" label="Thành phố" hint="Tuỳ chọn">
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          maxLength={CITY_MAX}
          placeholder="Hồ Chí Minh"
          autoComplete="address-level2"
        />
      </Field>

      <Field
        id="avatar_url"
        label="URL avatar"
        hint="Dán link ảnh (tuỳ chọn)"
      >
        <Input
          id="avatar_url"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://…"
          inputMode="url"
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/profile")}
          disabled={isSubmitting}
        >
          Huỷ
        </Button>
      </div>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}

function Field({ id, label, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
