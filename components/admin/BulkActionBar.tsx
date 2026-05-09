"use client"

import { CheckCircle2, X, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface BulkActionBarProps {
  selectedCount: number
  totalCount: number
  isPending: boolean
  onApprove: () => void
  onReject: () => void
  onClear: () => void
}

/**
 * Sticky toolbar surfaced above a moderation table when one or more
 * rows are selected. The bar only renders when at least one row is
 * checked, so the page layout doesn't shift on mount.
 *
 * Buttons are wired to action handlers passed from the parent; this
 * component is intentionally dumb — it does no fetch / mutation.
 */
export function BulkActionBar({
  selectedCount,
  totalCount,
  isPending,
  onApprove,
  onReject,
  onClear,
}: BulkActionBarProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div
      role="region"
      aria-label="Thanh hành động hàng loạt"
      className="sticky top-14 z-20 -mx-4 mb-3 flex flex-wrap items-center gap-3 border-y border-amber-300/70 bg-amber-100/95 px-4 py-2 text-sm shadow-sm backdrop-blur sm:mx-0 sm:rounded-lg sm:border"
    >
      <span className="font-medium text-amber-900">
        Đã chọn {selectedCount}/{totalCount}
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="default"
          disabled={isPending}
          onClick={onApprove}
          className="h-8 bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          Phê duyệt {selectedCount} đã chọn
        </Button>

        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={onReject}
          className="h-8"
        >
          <XCircle className="h-3.5 w-3.5" aria-hidden />
          Từ chối {selectedCount} đã chọn
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={onClear}
          className="h-8 text-amber-900 hover:bg-amber-200/60"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Bỏ chọn
        </Button>
      </div>
    </div>
  )
}
