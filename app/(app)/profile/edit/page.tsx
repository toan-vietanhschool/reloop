import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { getCurrentProfile } from "@/actions/auth"
import { ProfileEditForm } from "@/components/profile/ProfileEditForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sửa hồ sơ — ReLoop",
}

export default async function ProfileEditPage() {
  const profile = await getCurrentProfile()
  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <main className="relative w-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-mesh opacity-80"
      />
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 md:pt-10">
        <Link
          href="/profile"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Quay lại hồ sơ
        </Link>

        <header className="mb-8 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Cấu hình
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Sửa hồ sơ
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground md:text-base">
            Thông tin hiển thị công khai trong cộng đồng ReLoop. Bạn có thể
            chỉnh sửa bất cứ lúc nào.
          </p>
        </header>

        <section className="overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-soft-lg sm:p-8">
          <ProfileEditForm
            defaultValues={{
              display_name: profile.display_name,
              bio: profile.bio ?? "",
              city: profile.city ?? "",
              avatar_url: profile.avatar_url ?? "",
            }}
          />
        </section>
      </div>
    </main>
  )
}
