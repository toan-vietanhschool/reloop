import type { Metadata } from "next"

import { ListingForm } from "@/components/listings/ListingForm"
import { getCurrentProfile } from "@/actions/auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Đăng tin mới — ReLoop",
}

export default async function NewListingPage() {
  const profile = await getCurrentProfile()

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Đăng tin mới
        </h1>
        <p className="mt-2 text-muted-foreground">
          Mô tả món đồ và chọn vật liệu — AI sẽ tự kiểm duyệt trước khi hiển thị
          công khai.
        </p>
      </header>

      <ListingForm defaultCity={profile?.city ?? undefined} />
    </main>
  )
}
