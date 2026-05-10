import type { Metadata } from "next"

import { ScanClient } from "@/components/scan/ScanClient"

export const metadata: Metadata = {
  title: "AI Vision Scan — ReLoop",
  description:
    "Chụp 1 ảnh, biết tất cả: vật liệu, thời gian phân hủy, ý tưởng DIY, nơi tái chế gần nhất.",
}

export default function ScanPage() {
  return (
    <main className="relative w-full">
      {/* Soft mesh backdrop pinned to viewport edge for editorial depth.
          Sits behind the scan card on every state. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-gradient-mesh opacity-80"
      />
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
        <ScanClient />
      </div>
    </main>
  )
}
