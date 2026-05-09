import type { LucideIcon } from "lucide-react"

interface PillarCardProps {
  icon: LucideIcon
  title: string
  description: string
  accent?: "green" | "blue" | "amber"
}

const accentClasses: Record<NonNullable<PillarCardProps["accent"]>, string> = {
  green: "bg-brand-green/12 text-brand-green-deep ring-brand-green/25",
  blue: "bg-brand-blue/12 text-brand-blue-deep ring-brand-blue/25",
  amber: "bg-amber-500/12 text-amber-700 ring-amber-500/25",
}

export function PillarCard({ icon: Icon, title, description, accent = "green" }: PillarCardProps) {
  return (
    <article className="group relative flex h-full flex-col gap-4 rounded-2xl border border-foreground/8 bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md md:p-7">
      <span
        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${accentClasses[accent]}`}
        aria-hidden
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {title}
        </h3>
        <p className="text-pretty text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  )
}
