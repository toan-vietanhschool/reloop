import Link from "next/link"
import { Code2, GitFork, Recycle, X as XIcon } from "lucide-react"

const productLinks = [
  { href: "/scan", label: "Scan" },
  { href: "/map", label: "Map cộng đồng" },
  { href: "/listings", label: "Marketplace" },
] as const

const communityLinks = [
  { href: "/leaderboard", label: "Bảng xếp hạng" },
  { href: "/badges", label: "Huy hiệu" },
  { href: "/about", label: "Về ReLoop" },
] as const

const legalLinks = [
  { href: "/privacy", label: "Quyền riêng tư" },
  { href: "/terms", label: "Điều khoản" },
  { href: "/contact", label: "Liên hệ" },
] as const

const followLinks = [
  {
    href: "https://github.com/reloop-tdtu",
    label: "GitHub",
    Icon: GitFork,
    external: true,
  },
  {
    href: "https://twitter.com/reloop_tdtu",
    label: "Twitter / X",
    Icon: XIcon,
    external: true,
  },
] as const

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-foreground/10 bg-eco-bg-soft text-foreground">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-mesh opacity-50"
      />
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        {/* Brand band */}
        <div className="mb-12 flex flex-col items-start gap-4 border-b border-foreground/10 pb-12 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3 md:max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-green/15 text-brand-green-deep ring-1 ring-brand-green/30">
                <Recycle className="h-5 w-5" aria-hidden />
              </span>
              ReLoop
            </Link>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground">
              Shazam cho rác — biến mỗi món đồ thành cơ hội tái chế thông minh.
              Made in Vietnam, mở mã nguồn cho cộng đồng.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {followLinks.map(({ href, label, Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-foreground/15 bg-card text-foreground/70 transition hover:-translate-y-0.5 hover:border-brand-green/40 hover:text-brand-green-deep hover:shadow-brand"
              >
                <Icon className="h-4.5 w-4.5" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
          <FooterColumn title="Sản phẩm" links={productLinks} />
          <FooterColumn title="Cộng đồng" links={communityLinks} />
          <FooterColumn title="Pháp lý" links={legalLinks} />
          <div className="flex flex-col gap-3 text-sm">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
              Theo dõi
            </h2>
            <ul className="flex flex-col gap-2.5">
              {followLinks.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-foreground/10 bg-background/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
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
            Mở mã nguồn trên GitHub
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
      <ul className="flex flex-col gap-2.5">
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
