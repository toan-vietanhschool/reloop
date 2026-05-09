import { redirect } from "next/navigation"

import { AdminHeader } from "@/components/admin/AdminHeader"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/admin/points")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>()

  if (error || !profile || profile.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col bg-amber-50/30">
      <AdminHeader profile={profile} />
      <div className="flex-1">{children}</div>
    </div>
  )
}
