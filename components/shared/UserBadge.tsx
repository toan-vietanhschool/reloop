interface UserBadgeProps {
  ecoPoints: number
  className?: string
}

export function UserBadge({ ecoPoints, className }: UserBadgeProps) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 " +
        (className ?? "")
      }
      aria-label={`${ecoPoints} eco points`}
      title="Eco-points của bạn"
    >
      <span aria-hidden>🌱</span>
      <span>{ecoPoints.toLocaleString("vi-VN")}</span>
    </span>
  )
}
