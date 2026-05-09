"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

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

  // Group by city for nicer presentation.
  const byCity = schools.reduce<Record<string, SchoolOption[]>>((acc, s) => {
    const bucket = acc[s.city] ?? []
    bucket.push(s)
    acc[s.city] = bucket
    return acc
  }, {})
  const cities = Object.keys(byCity).sort((a, b) => a.localeCompare(b, "vi"))

  return (
    <label className="flex flex-col gap-1.5 text-sm md:flex-row md:items-center md:gap-3">
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
  )
}
