import Link from "next/link"

import { cn } from "@/lib/utils"

export interface AdminTab {
  href: string
  label: string
  count?: number
}

interface AdminTabsProps {
  tabs: AdminTab[]
  activeHref: string
}

/**
 * Server-rendered admin tab strip. Sticky under the AdminHeader so the
 * active tab + counts stay visible while the table scrolls.
 *
 * Active state derives from the `activeHref` prop instead of
 * `usePathname`, keeping this a server component and one HTTP request
 * per active tab.
 */
export function AdminTabs({ tabs, activeHref }: AdminTabsProps) {
  return (
    <nav
      aria-label="Tab kiểm duyệt"
      className="sticky top-14 z-20 mb-5 -mx-4 flex flex-wrap items-center gap-1 border-b border-amber-200/80 bg-amber-50/85 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-amber-50/70 sm:mx-0 sm:rounded-2xl sm:border sm:px-2 sm:py-1.5 sm:shadow-sm"
    >
      {tabs.map((tab) => {
        const isActive = tab.href === activeHref
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all",
              isActive
                ? "bg-amber-900 text-white shadow-sm"
                : "text-amber-900/75 hover:bg-amber-100 hover:text-amber-950",
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                  isActive
                    ? "bg-white text-amber-900"
                    : tab.count > 0
                      ? "bg-amber-200 text-amber-900"
                      : "bg-emerald-100 text-emerald-700",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
