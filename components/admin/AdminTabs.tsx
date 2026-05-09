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
 * Server-rendered admin tab strip. We use real <Link> elements (not a
 * client-state tab component) so each tab gets its own URL, can be
 * deep-linked, and preserves Next.js streaming + RSC caching per route.
 *
 * Active state is derived from the `activeHref` prop instead of
 * `usePathname`, keeping this component a server component.
 */
export function AdminTabs({ tabs, activeHref }: AdminTabsProps) {
  return (
    <nav
      aria-label="Tab kiểm duyệt"
      className="mb-5 flex flex-wrap items-center gap-1 rounded-lg border border-amber-200 bg-white p-1 shadow-sm"
    >
      {tabs.map((tab) => {
        const isActive = tab.href === activeHref
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-amber-100 text-amber-950 shadow-sm"
                : "text-amber-900/70 hover:bg-amber-50 hover:text-amber-950",
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                  isActive
                    ? "bg-amber-700 text-white"
                    : "bg-amber-100 text-amber-900",
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
