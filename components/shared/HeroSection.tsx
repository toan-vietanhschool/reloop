import { HeroCta } from "@/components/shared/HeroCta"

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-eco-hero-gradient"
    >
      <div className="absolute inset-0 -z-10 bg-eco-hero-grain opacity-[0.06]" aria-hidden />
      <div className="mx-auto flex min-h-[88svh] max-w-6xl flex-col items-start justify-center gap-7 px-6 py-24 text-eco-on-dark sm:gap-8 md:min-h-[92svh] md:px-10 md:py-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm md:text-sm">
          ReLoop · TDTU Vibe Coding
        </span>
        <h1
          id="hero-heading"
          className="hero-fade-up text-balance font-display text-[clamp(2.75rem,4vw+2rem,6rem)] font-extrabold leading-[0.95] tracking-tight"
        >
          Shazam cho rác.
        </h1>
        <p className="hero-fade-up hero-fade-up-2 max-w-2xl text-pretty text-lg leading-relaxed text-white/90 sm:text-xl md:text-2xl">
          Chụp 1 ảnh, biết tất cả: vật liệu, thời gian phân hủy, nơi tái chế gần nhất.
        </p>
        <div className="hero-fade-up hero-fade-up-3 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <HeroCta href="/scan" cta="scan" variant="primary">
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
    </section>
  )
}
