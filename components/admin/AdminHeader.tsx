import Link from "next/link"
import { Shield } from "lucide-react"

import { signOut } from "@/actions/auth"
import { UserBadge } from "@/components/shared/UserBadge"
import type { Profile } from "@/actions/auth"

interface AdminHeaderProps {
  profile: Profile
}

const adminNav = [
  { href: "/admin/moderation", label: "Kiểm duyệt" },
  { href: "/admin/points", label: "Điểm thu gom" },
  { href: "/admin/users", label: "Người dùng" },
] as const

export function AdminHeader({ profile }: AdminHeaderProps) {
  const displayName = profile.display_name ?? "Admin"

  return (
    <header className="sticky top-0 z-30 w-full border-b border-amber-300/60 bg-amber-50/80 backdrop-blur supports-[backdrop-filter]:bg-amber-50/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/admin/points"
          className="flex items-center gap-2 text-base font-bold tracking-tight text-amber-900"
        >
          <Shield className="h-4 w-4" aria-hidden />
          <span>ReLoop Admin</span>
        </Link>

        <nav
          aria-label="Admin"
          className="hidden items-center gap-6 md:flex"
        >
          {adminNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-amber-900/80 transition-colors hover:text-amber-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <UserBadge
            ecoPoints={profile.eco_points}
            className="hidden sm:inline-flex"
          />
          <span className="hidden text-sm text-amber-950 md:inline">
            {displayName}
          </span>
          <Link
            href="/dashboard"
            className="text-xs font-medium text-amber-900 underline-offset-2 hover:underline"
          >
            Về trang chính
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-amber-900/30 bg-white/60 px-2.5 py-1 text-xs font-medium text-amber-900 shadow-sm hover:bg-white"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="border-t border-amber-300/60 px-4 py-2 md:hidden">
        <nav
          aria-label="Admin (mobile)"
          className="flex items-center gap-4 overflow-x-auto"
        >
          {adminNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-xs font-medium text-amber-900/80 transition-colors hover:text-amber-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
