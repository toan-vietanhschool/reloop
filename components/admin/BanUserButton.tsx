"use client"

import { useTransition } from "react"
import { Ban } from "lucide-react"
import { toast } from "sonner"

import { banUser } from "@/actions/admin"
import { Button } from "@/components/ui/button"

interface BanUserButtonProps {
  userId: string
  displayName: string
  alreadyBanned: boolean
}

/**
 * Single-button ban control. Prompts the admin for a reason via a
 * native window.prompt to avoid pulling in an extra dialog component
 * for the MVP — the moderation panel is admin-only and doesn't need
 * a polished modal here.
 */
export function BanUserButton({
  userId,
  displayName,
  alreadyBanned,
}: BanUserButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick(): void {
    if (alreadyBanned) {
      toast.info("Người dùng đã bị cấm trước đó.")
      return
    }
    const reason = window.prompt(
      `Nhập lý do cấm "${displayName}":`,
      "Spam / vi phạm chính sách",
    )
    if (reason === null) return
    const trimmed = reason.trim()
    if (trimmed.length === 0) {
      toast.error("Lý do không được để trống.")
      return
    }

    startTransition(async () => {
      const result = await banUser(userId, trimmed)
      if (result.error) {
        toast.error(`Không thể cấm: ${result.error}`)
        return
      }
      toast.success(`Đã cấm ${displayName}.`)
    })
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={alreadyBanned ? "outline" : "destructive"}
      disabled={isPending || alreadyBanned}
      onClick={handleClick}
      className="h-8 px-3"
    >
      <Ban className="h-3.5 w-3.5" aria-hidden />
      {alreadyBanned ? "Đã cấm" : "Cấm"}
    </Button>
  )
}
