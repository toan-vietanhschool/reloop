import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/actions/auth"
import { BadgeUnlockDialog } from "@/components/shared/BadgeUnlockDialog"
import { Header } from "@/components/shared/Header"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getCurrentProfile()

  return (
    <div className="flex min-h-screen flex-col">
      <Header profile={profile} />
      <div className="flex-1">{children}</div>
      <BadgeUnlockDialog userId={user.id} />
    </div>
  )
}
