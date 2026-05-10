"use client"

import { useMemo, useState, useTransition } from "react"
import { CheckCircle2, ImageIcon, XCircle } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import {
  approveListing,
  approveListingsBulk,
  rejectListing,
  rejectListingsBulk,
} from "@/actions/admin"
import { BulkActionBar } from "@/components/admin/BulkActionBar"
import { Button } from "@/components/ui/button"
import { formatRelative } from "@/lib/format-relative"

export interface ModerationRow {
  id: string
  title: string
  description: string | null
  photo: string | null
  ownerId: string
  ownerName: string | null
  reason: string | null
  createdAt: string | null
}

interface ModerationTableProps {
  rows: ModerationRow[]
}

/**
 * Admin moderation table with multi-select + bulk actions.
 *
 * The table owns:
 *   1. Local `selected` Set to track which row ids are checked.
 *   2. `useTransition` to defer Server Action calls so the UI stays
 *      responsive (button disabled state during pending).
 *   3. Per-row Approve/Reject + bulk variants — both ultimately call
 *      `revalidatePath('/admin/moderation')` on the server, which
 *      drops the row from the next render automatically.
 */
export function ModerationTable({ rows }: ModerationTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  // When rows change (e.g. after revalidate), prune the selection so
  // we never carry an id that no longer exists in the table.
  const visibleIds = useMemo(() => new Set(rows.map((r) => r.id)), [rows])
  const effectiveSelected = useMemo(
    () => new Set([...selected].filter((id) => visibleIds.has(id))),
    [selected, visibleIds],
  )

  function toggleRow(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleAll(): void {
    setSelected((prev) => {
      if (prev.size >= rows.length) return new Set()
      return new Set(rows.map((r) => r.id))
    })
  }

  function clearSelection(): void {
    setSelected(new Set())
  }

  function handleApprove(id: string): void {
    startTransition(async () => {
      const result = await approveListing(id)
      if (result.error) {
        toast.error(`Không thể duyệt: ${result.error}`)
        return
      }
      toast.success("Đã duyệt bài đăng.")
    })
  }

  function handleReject(id: string): void {
    startTransition(async () => {
      const result = await rejectListing(id)
      if (result.error) {
        toast.error(`Không thể từ chối: ${result.error}`)
        return
      }
      toast.success("Đã từ chối bài đăng.")
    })
  }

  function handleBulkApprove(): void {
    const ids = Array.from(effectiveSelected)
    if (ids.length === 0) return
    startTransition(async () => {
      const result = await approveListingsBulk(ids)
      if (result.error) {
        toast.error(`Không thể duyệt hàng loạt: ${result.error}`)
        return
      }
      toast.success(`Đã duyệt ${result.data?.count ?? ids.length} bài đăng.`)
      clearSelection()
    })
  }

  function handleBulkReject(): void {
    const ids = Array.from(effectiveSelected)
    if (ids.length === 0) return
    startTransition(async () => {
      const result = await rejectListingsBulk(ids)
      if (result.error) {
        toast.error(`Không thể từ chối hàng loạt: ${result.error}`)
        return
      }
      toast.success(`Đã từ chối ${result.data?.count ?? ids.length} bài đăng.`)
      clearSelection()
    })
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-emerald-300 bg-white px-6 py-16 text-center">
        <div
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
        >
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-base font-semibold text-emerald-900">
          Không có bài đăng nào chờ kiểm duyệt
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Mọi bài đăng đã được AI / admin duyệt. Tuyệt vời!
        </p>
      </div>
    )
  }

  const allSelected =
    effectiveSelected.size > 0 && effectiveSelected.size === rows.length

  return (
    <div className="space-y-3">
      <BulkActionBar
        selectedCount={effectiveSelected.size}
        totalCount={rows.length}
        isPending={isPending}
        onApprove={handleBulkApprove}
        onReject={handleBulkReject}
        onClear={clearSelection}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[860px] table-fixed text-sm">
          <thead>
            <tr className="border-b border-border bg-amber-50/40 text-left">
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer accent-amber-700"
                />
              </th>
              <th className="w-16 px-3 py-2 font-medium">Ảnh</th>
              <th className="px-3 py-2 font-medium">Tiêu đề</th>
              <th className="px-3 py-2 font-medium">Lý do AI</th>
              <th className="px-3 py-2 font-medium">Người đăng</th>
              <th className="px-3 py-2 font-medium">Tạo lúc</th>
              <th className="px-3 py-2" aria-label="Hành động" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isChecked = effectiveSelected.has(row.id)
              return (
                <tr
                  key={row.id}
                  className={
                    isChecked
                      ? "border-t border-border/70 bg-amber-50/60"
                      : "border-t border-border/70"
                  }
                >
                  <td className="px-3 py-3 align-top">
                    <input
                      type="checkbox"
                      aria-label={`Chọn bài "${row.title}"`}
                      checked={isChecked}
                      onChange={() => toggleRow(row.id)}
                      className="h-4 w-4 cursor-pointer accent-amber-700"
                    />
                  </td>
                  <td className="px-3 py-3 align-top">
                    {row.photo ? (
                      <Image
                        src={row.photo}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                        <ImageIcon className="h-5 w-5" aria-hidden />
                      </div>
                    )}
                  </td>
                  <td className="max-w-[280px] px-3 py-3 align-top">
                    <p className="font-medium leading-snug">{row.title}</p>
                    {row.description ? (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {row.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="max-w-[220px] px-3 py-3 align-top text-xs text-rose-700">
                    {row.reason ?? (
                      <span className="italic text-muted-foreground">
                        (không có lý do)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top text-xs text-slate-700">
                    {row.ownerName ?? "—"}
                  </td>
                  <td className="px-3 py-3 align-top text-xs text-muted-foreground">
                    {formatRelative(row.createdAt)}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        disabled={isPending}
                        onClick={() => handleApprove(row.id)}
                        className="h-8 bg-emerald-600 px-3 hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        Duyệt
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => handleReject(row.id)}
                        className="h-8 px-3"
                      >
                        <XCircle className="h-3.5 w-3.5" aria-hidden />
                        Từ chối
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
