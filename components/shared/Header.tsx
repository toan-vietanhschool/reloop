import Link from "next/link"

import { UserBadge } from "@/components/shared/UserBadge"
import { ProfileDropdown } from "@/components/shared/ProfileDropdown"
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
    <header className="sticky top-0 z-[500] w-full border-b border-border/60 bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/55">
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
          <ProfileDropdown
            displayName={displayName}
            initials={initials}
            avatarUrl={profile?.avatar_url}
            ecoPoints={profile?.eco_points}
          />
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

