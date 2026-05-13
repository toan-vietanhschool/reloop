"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"

import { signOut } from "@/actions/auth"
import { UserBadge } from "@/components/shared/UserBadge"

interface ProfileDropdownProps {
  displayName: string
  initials: string
  avatarUrl?: string | null
  ecoPoints?: number
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/listings", label: "Listings" },
  { href: "/map", label: "Bản đồ" },
  { href: "/leaderboard", label: "Leaderboard" },
] as const

export function ProfileDropdown({
  displayName,
  initials,
  avatarUrl,
  ecoPoints,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Click outside → đóng dropdown
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    // Dùng mousedown thay vì click để bắt sớm hơn
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  // Escape key → đóng dropdown
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-2 py-1 text-sm font-medium shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-xs font-bold text-emerald-800"
          aria-hidden
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
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
        <ChevronDown open={open} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-black/5"
        >
          {ecoPoints !== undefined && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50/60 px-3 py-2 sm:hidden">
              <UserBadge ecoPoints={ecoPoints} />
            </div>
          )}
          {/* Mobile nav links — hidden on desktop where the top-bar nav is visible. */}
          <div className="md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
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
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-emerald-50/60"
          >
            Hồ sơ
          </Link>
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
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
      )}
    </div>
  )
}

function ChevronDown({ open }: { open: boolean }) {
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
      className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
