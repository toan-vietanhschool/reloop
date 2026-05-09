import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/actions/auth"
import { ProfileEditForm } from "@/components/profile/ProfileEditForm"

export const dynamic = "force-dynamic"

export default async function ProfileEditPage() {
  const profile = await getCurrentProfile()
  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Sửa hồ sơ
        </h1>
        <p className="mt-2 text-muted-foreground">
          Thông tin hiển thị công khai trong cộng đồng ReLoop.
        </p>
      </header>

      <ProfileEditForm
        defaultValues={{
          display_name: profile.display_name,
          bio: profile.bio ?? "",
          city: profile.city ?? "",
          avatar_url: profile.avatar_url ?? "",
        }}
      />
    </main>
  )
}
