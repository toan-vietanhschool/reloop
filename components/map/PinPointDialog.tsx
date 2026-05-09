"use client"

import { Locate, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { toast } from "sonner"

import { pinCollectionPoint } from "@/actions/collection-points"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MATERIAL_OPTIONS } from "@/lib/material"
import { POINT_TYPES, geolocate, pointTypeLabelVi } from "@/lib/map-utils"
import type { LatLng, MaterialCode, PointType } from "@/lib/map-utils"
import { POINTS } from "@/lib/points"

interface PinPointDialogProps {
  isLoggedIn: boolean
  /** Initial map center — used to pre-fill lat/lng for new pins. */
  defaultCenter: LatLng
}

interface FormState {
  name: string
  type: PointType
  accepts: Set<MaterialCode>
  lat: string
  lng: string
  address: string
  phone: string
  hours: string
  notes: string
}

function buildInitialState(center: LatLng): FormState {
  return {
    name: "",
    type: "scrap_dealer",
    accepts: new Set<MaterialCode>(),
    lat: center.lat.toFixed(6),
    lng: center.lng.toFixed(6),
    address: "",
    phone: "",
    hours: "",
    notes: "",
  }
}

/**
 * Public dialog wrapper: renders only the trigger button and toggles
 * `open`. The form body is a separate component so its state is
 * initialised fresh on each open (no setState-in-effect needed to
 * reset).
 */
export function PinPointDialog({
  isLoggedIn,
  defaultCenter,
}: PinPointDialogProps) {
  const [open, setOpen] = useState(false)

  if (!isLoggedIn) return null

  return (
    <>
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={() => setOpen(true)}
        className="pointer-events-auto shadow-md"
        aria-label="Pin điểm thu gom mới"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Pin điểm mới
      </Button>

      {open && (
        <PinPointDialogBody
          defaultCenter={defaultCenter}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

interface PinPointDialogBodyProps {
  defaultCenter: LatLng
  onClose: () => void
}

function PinPointDialogBody({
  defaultCenter,
  onClose,
}: PinPointDialogBodyProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [locating, setLocating] = useState(false)
  // Initialised once on mount; the parent unmounts this component when
  // the dialog closes, so reopening always starts from a fresh state.
  const [state, setState] = useState<FormState>(() =>
    buildInitialState(defaultCenter),
  )
  const headingId = useId()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Focus management: capture focus on mount, restore on unmount.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.focus()
    }, 0)
    return () => {
      window.clearTimeout(focusTimer)
      previouslyFocused.current?.focus()
      previouslyFocused.current = null
    }
  }, [])

  // Close on Escape.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation()
        onClose()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => {
      window.removeEventListener("keydown", handleKey)
    }
  }, [onClose])

  function toggleAccept(code: MaterialCode) {
    setState((prev) => {
      const next = new Set(prev.accepts)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return { ...prev, accepts: next }
    })
  }

  async function handleUseLocation() {
    setLocating(true)
    try {
      const pos = await geolocate()
      setState((prev) => ({
        ...prev,
        lat: pos.lat.toFixed(6),
        lng: pos.lng.toFixed(6),
      }))
      toast.success("Đã lấy vị trí hiện tại")
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không xác định được vị trí."
      toast.error(message)
    } finally {
      setLocating(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const lat = Number.parseFloat(state.lat)
    const lng = Number.parseFloat(state.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast.error("Tọa độ không hợp lệ")
      return
    }
    if (state.accepts.size === 0) {
      toast.error("Chọn ít nhất 1 vật liệu nhận")
      return
    }

    const payload = {
      name: state.name.trim(),
      type: state.type,
      accepts: Array.from(state.accepts),
      lat,
      lng,
      address: state.address.trim() || undefined,
      phone: state.phone.trim() || undefined,
      hours: state.hours.trim() || undefined,
      notes: state.notes.trim() || undefined,
    }

    setSubmitting(true)
    try {
      const result = await pinCollectionPoint(payload)
      if (result.error || !result.data) {
        toast.error("Không thể pin điểm", {
          description: result.error ?? "Lỗi không xác định",
        })
        return
      }
      toast.success(`Đã pin điểm! +${POINTS.point_pin} Eco Points`, {
        description: "Điểm sẽ hiển thị xanh sau khi admin xác minh.",
      })
      onClose()
      router.refresh()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lỗi không xác định"
      toast.error("Không thể pin điểm", { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <button
        type="button"
        aria-label="Đóng hộp thoại"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-background shadow-2xl outline-none sm:rounded-xl"
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2
            id={headingId}
            className="text-base font-semibold leading-snug"
          >
            Pin điểm thu gom mới
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Đóng"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="cp-name" className="text-sm font-medium">
              Tên điểm <span className="text-destructive">*</span>
            </label>
            <Input
              id="cp-name"
              name="name"
              required
              minLength={3}
              maxLength={120}
              value={state.name}
              onChange={(e) =>
                setState((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ví dụ: Vựa phế liệu cô Lan"
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cp-type" className="text-sm font-medium">
              Loại điểm <span className="text-destructive">*</span>
            </label>
            <select
              id="cp-type"
              name="type"
              required
              value={state.type}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  type: e.target.value as PointType,
                }))
              }
              disabled={submitting}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {POINT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {pointTypeLabelVi(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <fieldset>
              <legend className="text-sm font-medium">
                Vật liệu nhận{" "}
                <span className="text-destructive">*</span>
              </legend>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Chọn ít nhất 1 vật liệu mà điểm này thu gom.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {MATERIAL_OPTIONS.map((option) => {
                  const checked = state.accepts.has(option.code)
                  return (
                    <label
                      key={option.code}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition-colors ${
                        checked
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                          : "border-input bg-background hover:bg-accent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAccept(option.code)}
                        disabled={submitting}
                        className="h-3.5 w-3.5 accent-emerald-600"
                      />
                      <span className="flex-1 truncate">
                        {option.name_vi}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="cp-lat" className="text-sm font-medium">
                Vĩ độ <span className="text-destructive">*</span>
              </label>
              <Input
                id="cp-lat"
                name="lat"
                inputMode="decimal"
                required
                value={state.lat}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, lat: e.target.value }))
                }
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cp-lng" className="text-sm font-medium">
                Kinh độ <span className="text-destructive">*</span>
              </label>
              <Input
                id="cp-lng"
                name="lng"
                inputMode="decimal"
                required
                value={state.lng}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, lng: e.target.value }))
                }
                disabled={submitting}
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseLocation}
            disabled={locating || submitting}
            className="w-full"
          >
            <Locate className="h-4 w-4" aria-hidden />
            {locating
              ? "Đang lấy vị trí..."
              : "Dùng vị trí hiện tại của tôi"}
          </Button>

          <div className="space-y-1.5">
            <label htmlFor="cp-address" className="text-sm font-medium">
              Địa chỉ
            </label>
            <Input
              id="cp-address"
              name="address"
              maxLength={200}
              value={state.address}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              placeholder="Ví dụ: 123 Nguyễn Văn Trỗi, Q.Phú Nhuận"
              disabled={submitting}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="cp-phone" className="text-sm font-medium">
                Số điện thoại
              </label>
              <Input
                id="cp-phone"
                name="phone"
                inputMode="tel"
                value={state.phone}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="0912345678"
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cp-hours" className="text-sm font-medium">
                Giờ mở cửa
              </label>
              <Input
                id="cp-hours"
                name="hours"
                maxLength={120}
                value={state.hours}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    hours: e.target.value,
                  }))
                }
                placeholder="7:00 - 18:00 các ngày"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cp-notes" className="text-sm font-medium">
              Ghi chú
            </label>
            <textarea
              id="cp-notes"
              name="notes"
              maxLength={500}
              rows={3}
              value={state.notes}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="Thông tin bổ sung về điểm thu gom..."
              disabled={submitting}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t pt-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting || state.name.trim().length < 3}
            >
              {submitting
                ? "Đang gửi..."
                : `Pin điểm (+${POINTS.point_pin} điểm)`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
