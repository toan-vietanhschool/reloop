"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { setSchool } from "@/actions/profile"
import { Button } from "@/components/ui/button"

interface SchoolOption {
  code: string
  name_vi: string
  city: string
}

interface SchoolPromptProps {
  /** Pre-fetched schools list. Server passes this so client doesn't query. */
  schools: ReadonlyArray<SchoolOption>
}

const SKIP_KEY = "reloop:schoolPrompt:skipped"

/**
 * Resolve the initial open state synchronously from sessionStorage. Runs
 * only on the client (the function is invoked lazily by useState, but
 * we still guard against SSR by checking `window`). Computing the state
 * during render — not inside useEffect — avoids the cascading render
 * that the react-hooks/set-state-in-effect rule warns about.
 */
function resolveInitialOpen(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.sessionStorage.getItem(SKIP_KEY) !== "1"
  } catch {
    // sessionStorage may be unavailable (private mode); show prompt anyway.
    return true
  }
}

export function SchoolPrompt({ schools }: SchoolPromptProps) {
  const router = useRouter()
  const [open, setOpen] = useState<boolean>(resolveInitialOpen)
  const [selected, setSelected] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  const handleSkip = (): void => {
    try {
      window.sessionStorage.setItem(SKIP_KEY, "1")
    } catch {
      // ignore — worst case, user sees the prompt next route change.
    }
    setOpen(false)
  }

  const handleConfirm = (): void => {
    if (!selected) {
      setError("Vui lòng chọn trường của bạn.")
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await setSchool(selected)
      if (!result.success) {
        setError(
          result.error === "invalid_school"
            ? "Mã trường không hợp lệ."
            : "Không lưu được trường. Thử lại sau.",
        )
        return
      }
      try {
        window.sessionStorage.setItem(SKIP_KEY, "1")
      } catch {
        // ignore
      }
      setOpen(false)
      router.refresh()
    })
  }

  // Group by city so the dropdown is easier to scan.
  const byCity = schools.reduce<Record<string, SchoolOption[]>>((acc, s) => {
    const bucket = acc[s.city] ?? []
    bucket.push(s)
    acc[s.city] = bucket
    return acc
  }, {})
  const cities = Object.keys(byCity).sort((a, b) => a.localeCompare(b, "vi"))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-prompt-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm md:items-center"
    >
      <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <span aria-hidden className="text-3xl">
            🎓
          </span>
          <div>
            <h2
              id="school-prompt-title"
              className="font-display text-lg font-semibold leading-tight"
            >
              Bạn học trường nào?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Chọn trường để cạnh tranh trên leaderboard cùng bạn cùng trường.
            </p>
          </div>
        </div>

        <label className="mb-1 block text-sm font-medium" htmlFor="school-select">
          Trường THPT
        </label>
        <select
          id="school-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="" disabled>
            -- Chọn trường --
          </option>
          {cities.map((city) => (
            <optgroup key={city} label={city}>
              {byCity[city].map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name_vi}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {error ? (
          <p
            role="alert"
            className="mt-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={isPending}
          >
            Bỏ qua
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? "Đang lưu..." : "Xác nhận"}
          </Button>
        </div>
      </div>
    </div>
  )
}
