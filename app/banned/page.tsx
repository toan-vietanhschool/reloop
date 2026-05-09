import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { signOut } from "@/actions/auth"

export const metadata = {
  title: "Tài khoản bị khóa — ReLoop",
}

export const dynamic = "force-dynamic"

export default function BannedPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center gap-5 px-4 py-10 text-center">
      <div
        aria-hidden
        className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700"
      >
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight text-rose-900">
        Tài khoản đã bị khóa
      </h1>
      <p className="text-sm text-muted-foreground">
        Tài khoản của bạn đã bị khóa do vi phạm quy định cộng đồng. Nếu bạn cần
        khiếu nại, vui lòng liên hệ{" "}
        <a
          href="mailto:admin@reloop.app"
          className="font-medium text-emerald-700 underline underline-offset-2"
        >
          admin@reloop.app
        </a>
        .
      </p>
      <form action={signOut} className="mt-2">
        <button
          type="submit"
          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          Đăng xuất
        </button>
      </form>
      <Link
        href="/"
        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        Trở về trang chủ
      </Link>
    </main>
  )
}
