interface UserBadgeProps {
  ecoPoints: number
  className?: string
}

export function UserBadge({ ecoPoints, className }: UserBadgeProps) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-0.5 text-xs font-semibold text-navy shadow-sm transition-shadow hover:shadow-brand " +
        (className ?? "")
      }
      aria-label={`${ecoPoints} eco points`}
      title="Eco-points của bạn"
    >
      <span aria-hidden>🌱</span>
      <span className="tabular-nums">{ecoPoints.toLocaleString("vi-VN")}</span>
    </span>
  )
}
