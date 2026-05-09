import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentProfile } from "@/actions/auth"

const tiles = [
  {
    href: "/scan",
    emoji: "📷",
    title: "Scan đồ",
    description: "Chụp ảnh — AI nhận diện vật liệu và gợi ý vòng đời tiếp theo.",
  },
  {
    href: "/listings",
    emoji: "🛍️",
    title: "Listings",
    description: "Đăng / duyệt món đồ tái sinh trong khu vực của bạn.",
  },
  {
    href: "/map",
    emoji: "🗺️",
    title: "Bản đồ",
    description: "Tìm điểm thu gom, sửa chữa, swap gần bạn.",
  },
] as const

export default async function DashboardPage() {
  const profile = await getCurrentProfile()
  const displayName = profile?.display_name ?? "bạn"

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Chào mừng, {displayName} 🌱
        </h1>
        <p className="mt-2 text-muted-foreground">
          Mỗi vòng quay là một bước thêm cho hành tinh.
        </p>
      </header>

      <section
        aria-label="Lối tắt"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div className="text-3xl" aria-hidden>
                  {tile.emoji}
                </div>
                <CardTitle className="mt-2">{tile.title}</CardTitle>
                <CardDescription>{tile.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary group-hover:underline">
                  Mở →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  )
}
