import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"

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
    <header className="sticky top-0 z-30 w-full border-b border-amber-300/70 bg-amber-50/85 backdrop-blur supports-[backdrop-filter]:bg-amber-50/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/admin/moderation"
          className="group flex items-center gap-2 text-base font-extrabold tracking-tight text-amber-950"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-amber-900 text-white shadow-sm transition-transform group-hover:rotate-3">
            <ShieldCheck className="size-4" aria-hidden />
          </span>
          <span className="leading-none">
            ReLoop{" "}
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
              Admin
            </span>
          </span>
        </Link>

        <nav
          aria-label="Admin"
          className="hidden items-center gap-1 md:flex"
        >
          {adminNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-amber-900/80 transition-colors hover:bg-amber-100 hover:text-amber-950"
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
          <span className="hidden text-sm font-medium text-amber-950 md:inline">
            {displayName}
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline-offset-2 hover:underline"
          >
            <ArrowLeft className="size-3" aria-hidden />
            Về trang chính
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-amber-900/30 bg-white/70 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm transition-colors hover:bg-white"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="border-t border-amber-300/70 px-4 py-2 md:hidden">
        <nav
          aria-label="Admin (mobile)"
          className="flex items-center gap-1.5 overflow-x-auto"
        >
          {adminNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
