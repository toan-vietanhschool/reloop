import { Camera, Map as MapIcon, Recycle, ScanLine, Sparkles } from "lucide-react"

import { Footer } from "@/components/shared/Footer"
import { HeroSection } from "@/components/shared/HeroSection"
import { PillarCard } from "@/components/shared/PillarCard"
import { StatBlock } from "@/components/shared/StatBlock"

export const revalidate = 60

const pillars = [
  {
    icon: ScanLine,
    title: "AI Vision Scan",
    description:
      "Chụp ảnh đồ vật → AI nhận diện vật liệu, gợi ý tái chế, chấm Eco Score 1–10.",
    accent: "green" as const,
  },
  {
    icon: MapIcon,
    title: "Map cộng đồng",
    description:
      "20+ điểm thu gom HCM/HN. User pin điểm mới, cộng đồng vote xác thực.",
    accent: "blue" as const,
  },
  {
    icon: Recycle,
    title: "Marketplace tái chế",
    description:
      "Cho — Đổi — Bán đồ cũ. Kiếm Eco Coin, tích badges, lên leaderboard trường.",
    accent: "amber" as const,
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
    description: "Nhận diện vật liệu, ước lượng thời gian phân hủy, đề xuất hành động.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Hành động: cho · đổi · bán · vứt đúng chỗ",
    description: "Đăng marketplace, tìm điểm thu gom gần nhất, hoặc xử lý ngay tại nhà.",
    icon: Recycle,
  },
] as const

export default function MarketingHome() {
  return (
    <>
      <HeroSection />

      <section
        aria-labelledby="pillars-heading"
        className="bg-background"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-10 flex flex-col gap-3 md:mb-14 md:max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green-deep">
              Ba trụ cột
            </span>
            <h2
              id="pillars-heading"
              className="font-display text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
            >
              Một nền tảng. Toàn bộ vòng đời rác.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {pillars.map((pillar) => (
              <PillarCard
                key={pillar.title}
                icon={pillar.icon}
                title={pillar.title}
                description={pillar.description}
                accent={pillar.accent}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="how-it-works-heading"
        className="bg-eco-bg-soft"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-10 flex flex-col gap-3 md:mb-14 md:max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue-deep">
              Cách hoạt động
            </span>
            <h2
              id="how-it-works-heading"
              className="font-display text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
            >
              Ba bước. Dưới 10 giây.
            </h2>
          </div>
          <ol className="grid gap-5 md:grid-cols-3 md:gap-6">
            {steps.map((step) => (
              <li
                key={step.number}
                className="relative flex h-full flex-col gap-4 rounded-2xl border border-foreground/8 bg-card p-6 shadow-sm md:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-extrabold text-brand-green-deep md:text-4xl">
                    {step.number}
                  </span>
                  <step.icon className="h-6 w-6 text-foreground/40" aria-hidden />
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug text-foreground md:text-xl">
                  {step.title}
                </h3>
                <p className="text-pretty text-base leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="stats-heading"
        className="bg-background"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-10 flex flex-col gap-3 md:mb-14 md:max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-destructive">
              Vì sao quan trọng
            </span>
            <h2
              id="stats-heading"
              className="font-display text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
            >
              Việt Nam đang bị nhấn chìm trong rác.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            <StatBlock
              value="1.8 triệu"
              label="tấn nhựa Việt Nam ra biển mỗi năm"
              emphasis="danger"
            />
            <StatBlock
              value="27%"
              label="nhựa được tái chế ở TP.HCM"
              emphasis="blue"
            />
            <StatBlock
              value="73%"
              label="rác chưa qua xử lý đúng cách"
              emphasis="danger"
            />
          </div>
          <p className="mt-6 text-xs text-muted-foreground md:text-sm">
            Nguồn: VnExpress, Bộ Tài nguyên & Môi trường (2024–2025).
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
