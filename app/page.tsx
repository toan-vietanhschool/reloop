import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-semibold tracking-tight">
        ReLoop &mdash; Shazam cho rác.
      </h1>
      <p className="text-lg text-muted-foreground">
        Đang khởi tạo&hellip;
      </p>
      <Button>Bắt đầu</Button>
    </main>
  )
}
