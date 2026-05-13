import { Camera, Map as MapIcon, Recycle, ScanLine, Sparkles } from "lucide-react"

import { Footer } from "@/components/shared/Footer"
import { HeroSection } from "@/components/shared/HeroSection"
import { PillarCard } from "@/components/shared/PillarCard"
import { StatBlock } from "@/components/shared/StatBlock"

export const revalidate = 300

const featurePillar = {
  icon: ScanLine,
  title: "AI Vision Scan",
  description:
    "Chụp ảnh đồ vật → AI nhận diện vật liệu trong 3 giây, gợi ý cách tái chế và chấm Eco Score 1–10. Hoạt động offline trên mọi smartphone.",
  accent: "green" as const,
  imageSrc: "/images/pillars/ai-scan.jpg",
  href: "/scan",
} as const

const sidePillars = [
  {
    icon: MapIcon,
    title: "Map cộng đồng",
    description:
      "20+ điểm thu gom đã xác thực ở HCM/HN. Pin điểm mới, cộng đồng vote.",
    accent: "blue" as const,
    imageSrc: "/images/pillars/community-map.jpg",
    href: "/map",
  },
  {
    icon: Recycle,
    title: "Marketplace tái chế",
    description:
      "Cho · Đổi · Bán đồ cũ. Kiếm Eco Coin, mở khóa badges, leo bảng xếp hạng.",
    accent: "amber" as const,
    imageSrc: "/images/pillars/marketplace.jpg",
    href: "/listings",
  },
] as const

const steps = [
  {
    number: "01",
    title: "Chụp ảnh đồ cần xử lý",
    description: "Mở camera, bấm chụp. Không cần đăng ký, không cần tải app.",
    icon: Camera,
  },
  {
    number: "02",
    title: "AI phân tích trong 3 giây",
    description:
      "Nhận diện vật liệu, ước lượng thời gian phân hủy, đề xuất hành động phù hợp.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Hành động: cho · đổi · bán · vứt đúng chỗ",
    description:
      "Đăng marketplace, tìm điểm thu gom gần nhất, hoặc xử lý ngay tại nhà.",
    icon: Recycle,
  },
] as const

export default function MarketingHome() {
  return (
    <>
      <HeroSection />

      {/* Pillars — bento grid: 1 feature card spans 2 cols, 2 stacked on right */}
      <section
        aria-labelledby="pillars-heading"
        className="relative isolate bg-background"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-10 flex flex-col gap-3 md:mb-14 md:max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-lime-deep">
              Giải pháp
            </span>
            <h2
              id="pillars-heading"
              className="font-display text-balance text-3xl font-black uppercase leading-[0.95] tracking-tight text-navy sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Một nền tảng.{" "}
              <span className="text-lime-deep">
                Toàn bộ vòng đời rác.
              </span>
            </h2>
            <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Từ camera đến marketplace — ReLoop lo nguyên chuỗi: nhận diện, định
              vị, kết nối người cho và người cần.
            </p>
          </div>

          {/* Bento: feature spans 2 on md+, two compact cards stacked on the right side */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            <PillarCard
              variant="feature"
              icon={featurePillar.icon}
              title={featurePillar.title}
              description={featurePillar.description}
              accent={featurePillar.accent}
              imageSrc={featurePillar.imageSrc}
              href={featurePillar.href}
            />
            {sidePillars.map((pillar) => (
              <PillarCard
                key={pillar.title}
                icon={pillar.icon}
                title={pillar.title}
                description={pillar.description}
                accent={pillar.accent}
                imageSrc={pillar.imageSrc}
                href={pillar.href}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works — horizontal timeline desktop, vertical mobile */}
      <section
        aria-labelledby="how-it-works-heading"
        className="relative isolate bg-fill"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 flex flex-col gap-3 md:mb-16 md:max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-light">
              Cách hoạt động
            </span>
            <h2
              id="how-it-works-heading"
              className="font-display text-balance text-3xl font-black uppercase leading-[0.95] tracking-tight text-navy sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Ba bước.{" "}
              <span className="text-lime-deep">Dưới 10 giây.</span>
            </h2>
          </div>

          <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0">
            {/* Connecting line — desktop only */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-[44px] hidden h-px bg-gradient-to-r from-lime/0 via-lime/40 to-navy-light/0 md:block"
            />

            {steps.map((step, idx) => (
              <li
                key={step.number}
                className="relative flex flex-col gap-4 md:px-5"
              >
                {/* Dot marker on the timeline */}
                <div className="flex items-center gap-3">
                  <span
                    className="relative grid h-[88px] w-[88px] place-items-center rounded-2xl border border-border bg-card shadow-card md:h-[88px]"
                    aria-hidden
                  >
                    <step.icon
                      className="h-7 w-7 text-navy"
                      strokeWidth={1.75}
                    />
                    <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-lime text-xs font-bold text-navy shadow-brand">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-lime-deep/70">
                    Bước {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-xl font-semibold leading-snug text-foreground md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="text-pretty text-base leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Stats — animated count-up via IntersectionObserver */}
      <section
        aria-labelledby="stats-heading"
        className="relative isolate bg-background"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-10 flex flex-col gap-3 md:mb-14 md:max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-destructive">
              Vì sao quan trọng
            </span>
            <h2
              id="stats-heading"
              className="font-display text-balance text-3xl font-black uppercase leading-[0.95] tracking-tight text-navy sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Việt Nam đang bị nhấn chìm{" "}
              <span className="text-destructive">trong rác.</span>
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            <StatBlock
              value="1,800,000"
              numericValue={1800000}
              label="tấn nhựa Việt Nam ra biển mỗi năm"
              emphasis="danger"
            />
            <StatBlock
              value="27%"
              numericValue={27}
              suffix="%"
              label="nhựa được tái chế ở TP.HCM"
              emphasis="blue"
            />
            <StatBlock
              value="73%"
              numericValue={73}
              suffix="%"
              label="rác chưa qua xử lý đúng cách"
              emphasis="danger"
            />
          </div>
          <p className="mt-6 text-xs text-muted-foreground md:text-sm">
            Nguồn: VnExpress, Bộ Tài nguyên &amp; Môi trường (2024–2025).
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
