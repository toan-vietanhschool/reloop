"use client"

import { useMemo, useState, useTransition } from "react"
import { CheckCircle2, ImageIcon, Inbox, XCircle } from "lucide-react"
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
    return <EmptyState />
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

      <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[920px] table-fixed text-sm">
          <thead>
            <tr className="border-b border-amber-200 bg-gradient-to-r from-amber-50/80 to-amber-100/40 text-left">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="size-4 cursor-pointer accent-amber-700"
                />
              </th>
              <th className="w-16 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                Ảnh
              </th>
              <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                Tiêu đề
              </th>
              <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                Lý do AI
              </th>
              <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                Người đăng
              </th>
              <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                Tạo lúc
              </th>
              <th className="px-3 py-2.5" aria-label="Hành động" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isChecked = effectiveSelected.has(row.id)
              const zebra = i % 2 === 1 ? "bg-amber-50/30" : "bg-white"
              return (
                <tr
                  key={row.id}
                  className={
                    isChecked
                      ? "border-t border-border/70 bg-amber-100/60"
                      : `border-t border-border/70 ${zebra} transition-colors hover:bg-amber-50/60`
                  }
                >
                  <td className="px-3 py-3 align-top">
                    <input
                      type="checkbox"
                      aria-label={`Chọn bài "${row.title}"`}
                      checked={isChecked}
                      onChange={() => toggleRow(row.id)}
                      className="size-4 cursor-pointer accent-amber-700"
                    />
                  </td>
                  <td className="px-3 py-3 align-top">
                    {row.photo ? (
                      <Image
                        src={row.photo}
                        alt=""
                        width={56}
                        height={56}
                        className="size-14 rounded-xl object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="flex size-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-border">
                        <ImageIcon className="size-5" aria-hidden />
                      </div>
                    )}
                  </td>
                  <td className="max-w-[280px] px-3 py-3 align-top">
                    <p className="font-semibold leading-snug">{row.title}</p>
                    {row.description ? (
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                        {row.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="max-w-[220px] px-3 py-3 align-top text-xs">
                    {row.reason ? (
                      <span className="rounded-md bg-rose-50 px-2 py-1 text-rose-800 ring-1 ring-rose-200">
                        {row.reason}
                      </span>
                    ) : (
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
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        disabled={isPending}
                        onClick={() => handleApprove(row.id)}
                        className="h-8 gap-1 bg-emerald-600 px-3 hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="size-3.5" aria-hidden />
                        Duyệt
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleReject(row.id)}
                        className="h-8 gap-1 border-rose-200 px-3 text-rose-700 hover:bg-rose-50"
                      >
                        <XCircle className="size-3.5" aria-hidden />
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

/**
 * Empty state — surfaced as a celebratory card. Reused visually with
 * the points + users empty states across admin pages.
 */
function EmptyState() {
  return (
    <div className="relative isolate flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-6 py-16 text-center shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-emerald-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-12 size-56 rounded-full bg-sky-200/40 blur-3xl"
      />
      <div className="relative">
        <span
          aria-hidden
          className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm ring-2 ring-emerald-200"
        >
          <Inbox className="size-7" />
        </span>
        <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow ring-2 ring-white">
          <CheckCircle2 className="size-3.5" aria-hidden />
        </span>
      </div>
      <div className="relative space-y-1">
        <h2 className="text-lg font-bold text-emerald-900">
          Không có gì cần duyệt
        </h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Mọi bài đăng đã được AI / admin xử lý. Tuyệt vời — đi uống cà
          phê thôi!
        </p>
      </div>
    </div>
  )
}
