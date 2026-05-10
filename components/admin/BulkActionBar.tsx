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
      className="sticky top-[7.25rem] z-20 -mx-4 mb-3 flex flex-wrap items-center gap-3 border-y border-amber-300/70 bg-gradient-to-r from-amber-100/95 to-amber-50/95 px-4 py-2.5 text-sm shadow-soft-lg backdrop-blur sm:mx-0 sm:rounded-2xl sm:border"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-amber-900 text-xs font-bold text-white shadow tabular-nums">
          {selectedCount}
        </span>
        <span className="font-semibold text-amber-950">
          được chọn{" "}
          <span className="font-medium text-amber-700">/ {totalCount}</span>
        </span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="default"
          disabled={isPending}
          onClick={onApprove}
          className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle2 className="size-3.5" aria-hidden />
          Phê duyệt {selectedCount}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={onReject}
          className="h-8 gap-1"
        >
          <XCircle className="size-3.5" aria-hidden />
          Từ chối {selectedCount}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={onClear}
          className="h-8 gap-1 text-amber-900 hover:bg-amber-200/60"
        >
          <X className="size-3.5" aria-hidden />
          Bỏ chọn
        </Button>
      </div>
    </div>
  )
}
