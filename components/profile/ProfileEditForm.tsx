"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMemo, useState, type FormEvent } from "react"
import { ImageOff, User } from "lucide-react"
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

function getInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "🌱"
  return (trimmed[0] ?? "").toUpperCase()
}

export function ProfileEditForm({ defaultValues }: ProfileEditFormProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(defaultValues.display_name)
  const [bio, setBio] = useState(defaultValues.bio)
  const [city, setCity] = useState(defaultValues.city)
  const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatar_url)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initial = getInitial(displayName)
  const previewUrl = useMemo(() => {
    const trimmed = avatarUrl.trim()
    if (!trimmed) return null
    return isValidUrl(trimmed) ? trimmed : null
  }, [avatarUrl])

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
      toast.error(
        "URL avatar không hợp lệ — cần bắt đầu bằng http:// hoặc https://.",
      )
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
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Avatar preview row -------------------------------------- */}
      <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/20 p-4">
        <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-2xl font-extrabold text-emerald-800 ring-2 ring-emerald-200">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt=""
              width={80}
              height={80}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : avatarUrl.trim() ? (
            <ImageOff className="size-6 text-rose-500" aria-hidden />
          ) : (
            <span aria-hidden>{initial}</span>
          )}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Avatar
          </p>
          <p className="text-sm font-semibold tracking-tight">
            {displayName.trim() || "Tên hiển thị"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {previewUrl
              ? "Xem trước ảnh đại diện trên đây."
              : "Dán URL ảnh phía dưới để xem trước."}
          </p>
        </div>
      </div>

      <Field
        id="display_name"
        label="Tên hiển thị"
        required
        hint={`${DISPLAY_NAME_MIN}–${DISPLAY_NAME_MAX} ký tự`}
        icon={<User className="size-3.5" aria-hidden />}
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
        hint="Dán link ảnh — JPG hoặc PNG"
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

      <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/profile")}
          disabled={isSubmitting}
        >
          Huỷ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-emerald-600 to-sky-500 font-semibold shadow-brand hover:brightness-105"
        >
          {isSubmitting ? "Đang lưu…" : "Lưu thay đổi"}
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
  icon?: React.ReactNode
  children: React.ReactNode
}

function Field({ id, label, hint, required, icon, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-semibold tracking-tight"
      >
        {icon}
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </label>
      {children}
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
