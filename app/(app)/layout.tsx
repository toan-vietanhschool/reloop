import { redirect } from "next/navigation"

import { Header } from "@/components/shared/Header"
import { getCurrentProfile } from "@/actions/auth"
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
    </div>
  )
}
