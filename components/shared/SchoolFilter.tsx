"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { cn } from "@/lib/utils"

export interface SchoolOption {
  code: string
  name_vi: string
  city: string
}

interface SchoolFilterProps {
  schools: ReadonlyArray<SchoolOption>
  /** Currently active school filter, or null/empty for "all". */
  current: string | null
}

const ALL_VALUE = "__all__"

export function SchoolFilter({ schools, current }: SchoolFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const value = current && current.length > 0 ? current : ALL_VALUE

  const handleChange = (next: string): void => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === ALL_VALUE) {
      params.delete("school")
    } else {
      params.set("school", next)
    }

    const qs = params.toString()
    const target = qs.length > 0 ? `/leaderboard?${qs}` : "/leaderboard"

    startTransition(() => {
      router.push(target, { scroll: false })
    })
  }

  // Group by city for nicer dropdown presentation.
  const byCity = schools.reduce<Record<string, SchoolOption[]>>((acc, s) => {
    const bucket = acc[s.city] ?? []
    bucket.push(s)
    acc[s.city] = bucket
    return acc
  }, {})
  const cities = Object.keys(byCity).sort((a, b) => a.localeCompare(b, "vi"))

  return (
    <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-3">
      {/* Mobile: horizontally scrollable chip rail */}
      <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 md:hidden">
        <Chip
          active={value === ALL_VALUE}
          disabled={isPending}
          onClick={() => handleChange(ALL_VALUE)}
        >
          Toàn bộ
        </Chip>
        {schools.map((s) => (
          <Chip
            key={s.code}
            active={value === s.code}
            disabled={isPending}
            onClick={() => handleChange(s.code)}
          >
            {s.name_vi}
          </Chip>
        ))}
      </div>

      {/* Desktop: native select grouped by city */}
      <label className="hidden text-sm md:flex md:items-center md:gap-3">
        <span className="font-medium text-foreground">Lọc theo trường</span>
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isPending}
          aria-busy={isPending}
          className="min-w-[14rem] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value={ALL_VALUE}>Toàn bộ trường</option>
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
      </label>
    </div>
  )
}

interface ChipProps {
  active: boolean
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}

function Chip({ active, disabled, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
        active
          ? "border-brand-green bg-brand-green text-white shadow-brand"
          : "border-foreground/15 bg-card text-foreground/70 hover:border-brand-green/40 hover:text-brand-green-deep",
        disabled ? "cursor-not-allowed opacity-60" : "",
      )}
    >
      {children}
    </button>
  )
}
