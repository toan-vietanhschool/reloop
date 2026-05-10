import Image from "next/image"
import Link from "next/link"

import { signOut } from "@/actions/auth"
import { UserBadge } from "@/components/shared/UserBadge"
import type { Profile } from "@/actions/auth"

interface HeaderProps {
  profile: Profile | null
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/listings", label: "Listings" },
  { href: "/map", label: "Bản đồ" },
  { href: "/leaderboard", label: "Leaderboard" },
] as const

export function Header({ profile }: HeaderProps) {
  const displayName = profile?.display_name ?? "ReLooper"
  const initials = getInitials(displayName)

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/55">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-base font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm"
          >
            🌱
          </span>
          <span>ReLoop</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-emerald-50/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {profile ? (
            <UserBadge
              ecoPoints={profile.eco_points}
              className="hidden sm:inline-flex"
            />
          ) : null}
          <details className="group relative">
            <summary
              className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-card px-2 py-1 text-sm font-medium shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="User menu"
            >
              <span
                className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-xs font-bold text-emerald-800"
                aria-hidden
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt=""
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </span>
              <span className="hidden md:inline">{displayName}</span>
              <ChevronDown />
            </summary>
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-black/5"
            >
              {profile ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50/60 px-3 py-2 sm:hidden">
                  <UserBadge ecoPoints={profile.eco_points} />
                </div>
              ) : null}
              {/* Mobile nav links — hidden on desktop where the top-bar nav is visible. */}
              <div className="md:hidden">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-emerald-50/60"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-1 h-px bg-border" />
              </div>
              <Link
                href="/profile"
                role="menuitem"
                className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-emerald-50/60"
              >
                Hồ sơ
              </Link>
              <Link
                href="/dashboard"
                role="menuitem"
                className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-emerald-50/60"
              >
                Dashboard
              </Link>
              <div className="my-1 h-px bg-border" />
              <form action={signOut}>
                <button
                  type="submit"
                  role="menuitem"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  Đăng xuất
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "RL"
  const parts = trimmed.split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "RL"
}

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="text-muted-foreground transition-transform group-open:rotate-180"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
