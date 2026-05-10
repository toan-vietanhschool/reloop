import Image from "next/image"
import { ChevronDown, Leaf, ScanLine } from "lucide-react"

import { HeroCta } from "@/components/shared/HeroCta"

interface TrustStat {
  readonly value: string
  readonly label: string
}

const TRUST_STATS: ReadonlyArray<TrustStat> = [
  { value: "1,8M", label: "tấn nhựa ra biển/năm" },
  { value: "27%", label: "đã tái chế ở TP.HCM" },
  { value: "73%", label: "rác chưa xử lý đúng" },
] as const

/**
 * Editorial-style hero: eyebrow + asymmetric grid (text left, large image right
 * on desktop, full-bleed image with text overlay on mobile). Scroll cue +
 * trust strip anchor the bottom of the viewport.
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-eco-hero-gradient"
    >
      {/* Layered atmospheric texture */}
      <div
        className="absolute inset-0 -z-10 bg-eco-hero-grain opacity-[0.07]"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-mesh opacity-60"
        aria-hidden
      />

      {/* Asymmetric grid: 7/12 text · 5/12 image on desktop */}
      <div className="relative mx-auto grid min-h-[88svh] max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-28 pt-16 text-eco-on-dark md:min-h-[92svh] md:grid-cols-12 md:gap-8 md:px-10 md:pb-32 md:pt-24">
        {/* Text column */}
        <div className="relative z-10 flex flex-col items-start gap-6 md:col-span-7 md:gap-8">
          <span className="hero-fade-up inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur-md md:text-sm">
            <Leaf className="h-3.5 w-3.5" aria-hidden />
            ReLoop · TDTU Vibe Coding 2026
          </span>

          <h1
            id="hero-heading"
            className="hero-fade-up hero-fade-up-2 text-balance font-display text-[clamp(2.75rem,3.5vw+2rem,6.5rem)] font-extrabold leading-[0.92] tracking-tight"
          >
            Shazam{" "}
            <span className="relative inline-block">
              cho rác.
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-[6px] w-full rounded-full bg-white/40 md:h-2"
              />
            </span>
          </h1>

          <p className="hero-fade-up hero-fade-up-3 max-w-2xl text-pretty text-lg leading-relaxed text-white/95 sm:text-xl md:text-2xl">
            Chụp 1 ảnh — biết tất cả: vật liệu, thời gian phân hủy, nơi tái chế
            gần nhất. Cho · đổi · bán đồ cũ, kiếm eco-points cho mỗi món tái sinh.
          </p>

          <div className="hero-fade-up hero-fade-up-3 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <HeroCta href="/scan" cta="scan" variant="primary">
              <ScanLine className="h-5 w-5" aria-hidden />
              Bắt đầu Scan
            </HeroCta>
            <HeroCta href="/map" cta="map" variant="outline">
              Xem Map điểm tái chế
            </HeroCta>
          </div>

          <p className="hero-fade-up hero-fade-up-4 text-sm text-white/75">
            Miễn phí · Không cần tải app · Hoạt động trên mọi trình duyệt
          </p>
        </div>

        {/* Image column — desktop only as a visual anchor; mobile gets a soft glow instead */}
        <div className="relative md:col-span-5">
          <div className="hero-fade-up hero-fade-up-3 relative hidden aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-soft-lg md:block">
            <Image
              src="/images/hero/recycling-hands.jpg"
              alt="Đôi tay đang phân loại đồ tái chế — nhựa, giấy, kim loại"
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
            {/* Subtle gradient overlay for legibility if a caption ever lands here */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
              aria-hidden
            />
            {/* Floating chip — depth signal */}
            <div className="float-slow absolute bottom-5 left-5 right-5 rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-sm text-white backdrop-blur-md">
              <p className="font-semibold">AI Vision · 3 giây</p>
              <p className="text-xs text-white/80">PET · phân hủy 450 năm</p>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#pillars-heading"
          aria-label="Cuộn xuống xem ba trụ cột"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-white md:flex"
        >
          <span>Khám phá</span>
          <ChevronDown className="scroll-cue h-5 w-5" aria-hidden />
        </a>
      </div>

      {/* Trust strip — anchored full-width below hero, separator lines between */}
      <div className="border-t border-white/15 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/15 px-6 py-5 text-eco-on-dark md:px-10 md:py-6">
          {TRUST_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-0.5 px-3 text-center md:flex-row md:items-baseline md:justify-center md:gap-2"
            >
              <span className="font-display text-xl font-extrabold tracking-tight md:text-2xl">
                {stat.value}
              </span>
              <span className="text-[11px] leading-snug text-white/80 md:text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
