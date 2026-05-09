interface StatBlockProps {
  value: string
  label: string
  emphasis?: "green" | "blue" | "danger"
}

const emphasisClasses: Record<NonNullable<StatBlockProps["emphasis"]>, string> = {
  green: "text-brand-green-deep",
  blue: "text-brand-blue-deep",
  danger: "text-destructive",
}

export function StatBlock({ value, label, emphasis = "green" }: StatBlockProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-foreground/8 bg-card p-7 text-left md:p-8">
      <span
        className={`font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-none tracking-tight ${emphasisClasses[emphasis]}`}
      >
        {value}
      </span>
      <span className="text-pretty text-base leading-snug text-foreground/80 md:text-lg">
        {label}
      </span>
    </div>
  )
}
