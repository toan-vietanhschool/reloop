import Link from "next/link"
import { Code2, Recycle } from "lucide-react"

const productLinks = [
  { href: "/scan", label: "Scan" },
  { href: "/map", label: "Map" },
  { href: "/listings", label: "Listings" },
]

const communityLinks = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/badges", label: "Badges" },
  { href: "/about", label: "Về ReLoop" },
]

const legalLinks = [
  { href: "/privacy", label: "Quyền riêng tư" },
  { href: "/terms", label: "Điều khoản" },
  { href: "/contact", label: "Liên hệ" },
]

export function Footer() {
  return (
    <footer className="border-t border-foreground/10 bg-eco-bg-soft text-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4 md:gap-8 md:px-10 md:py-16">
        <div className="flex flex-col gap-3 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            <Recycle className="h-5 w-5 text-brand-green-deep" aria-hidden />
            ReLoop
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Shazam cho rác — biến mỗi món đồ thành cơ hội tái chế thông minh.
          </p>
        </div>

        <FooterColumn title="Sản phẩm" links={productLinks} />
        <FooterColumn title="Cộng đồng" links={communityLinks} />
        <FooterColumn title="Pháp lý" links={legalLinks} />
      </div>

      <div className="border-t border-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
          <p>© 2026 ReLoop · TDTU Vibe Coding</p>
          <p>
            Bản đồ ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              OpenStreetMap contributors
            </a>
          </p>
          <a
            href="https://github.com/reloop-tdtu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
          >
            <Code2 className="h-4 w-4" aria-hidden />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}

interface FooterColumnProps {
  title: string
  links: ReadonlyArray<{ href: string; label: string }>
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <nav aria-label={title} className="flex flex-col gap-3 text-sm">
      <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
