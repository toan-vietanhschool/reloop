import type { Metadata } from "next"

import { ScanClient } from "@/components/scan/ScanClient"

export const metadata: Metadata = {
  title: "AI Vision Scan — ReLoop",
  description:
    "Chụp 1 ảnh, biết tất cả: vật liệu, thời gian phân hủy, ý tưởng DIY, nơi tái chế gần nhất.",
}

export default function ScanPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Vision Scan
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Chụp 1 ảnh đồ vật bất kỳ. Tớ sẽ nói cho bạn biết nó làm bằng gì,
          phân hủy bao lâu, và tái chế ở đâu được.
        </p>
      </header>
      <ScanClient />
    </main>
  )
}
