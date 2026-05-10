"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

interface PhotoGridProps {
  photos: string[]
  alt: string
  /** Material fallback image used when `photos` is empty. */
  fallbackSrc?: string
  /** Material colour for the empty-state ribbon. */
  fallbackColor?: string
  /** Vietnamese material name for the empty-state ribbon. */
  fallbackLabel?: string
}

/**
 * Photo gallery for the listing detail page.
 *
 * - 0 photos → a single tall material-fallback image so the page never feels empty.
 * - 1 photo  → full-width hero.
 * - 2+ photos → a "primary + thumbnails" editorial layout on desktop, stacked
 *   on mobile. Click any tile to open the lightbox; arrow keys navigate, Esc closes.
 */
export function PhotoGrid({
  photos,
  alt,
  fallbackSrc,
  fallbackColor,
  fallbackLabel,
}: PhotoGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    if (activeIndex === null) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null)
      } else if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? null : (current + 1) % photos.length,
        )
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null
            ? null
            : (current - 1 + photos.length) % photos.length,
        )
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [activeIndex, photos.length])

  if (photos.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 shadow-sm ring-1 ring-border/60">
        {fallbackSrc ? (
          <Image
            src={fallbackSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">
            <span aria-hidden>♻️</span>
          </div>
        )}
        {fallbackLabel ? (
          <span
            className="absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md ring-1 ring-white/20"
            style={{ backgroundColor: fallbackColor ?? "oklch(48% 0.13 160)" }}
          >
            {fallbackLabel}
          </span>
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"
        />
      </div>
    )
  }

  if (photos.length === 1) {
    const onlyPhoto = photos[0] ?? ""
    return (
      <button
        type="button"
        onClick={() => setActiveIndex(0)}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        aria-label="Mở ảnh phóng to"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={onlyPhoto}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {renderLightbox(activeIndex, photos, alt, () => setActiveIndex(null))}
      </button>
    )
  }

  // 2+ photos → editorial split: large primary on the left, thumbs on the right.
  const [primary, ...rest] = photos
  return (
    <div className="grid gap-3 md:grid-cols-[3fr_1fr]">
      <button
        type="button"
        onClick={() => setActiveIndex(0)}
        className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        aria-label={`Mở ảnh 1 / ${photos.length}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primary}
          alt={`${alt} 1`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          loading="eager"
        />
      </button>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-1 md:grid-rows-3">
        {rest.slice(0, 3).map((src, idx) => {
          const realIndex = idx + 1
          const isLastTileWithMore = idx === 2 && photos.length > 4
          const remaining = photos.length - 4
          return (
            <button
              key={`${src}-${realIndex}`}
              type="button"
              onClick={() => setActiveIndex(realIndex)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-border/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 md:aspect-auto"
              aria-label={`Mở ảnh ${realIndex + 1} / ${photos.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${alt} ${realIndex + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                loading="lazy"
              />
              {isLastTileWithMore ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-base font-semibold text-white backdrop-blur-sm">
                  +{remaining}
                </div>
              ) : null}
            </button>
          )
        })}
      </div>
      {renderLightbox(activeIndex, photos, alt, () => setActiveIndex(null))}
    </div>
  )
}

function renderLightbox(
  activeIndex: number | null,
  photos: string[],
  alt: string,
  onClose: () => void,
) {
  if (activeIndex === null) return null
  const activePhoto = photos[activeIndex]
  if (!activePhoto) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh phóng to"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl text-white backdrop-blur transition-colors hover:bg-white/25"
        aria-label="Đóng"
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={activePhoto}
        alt={alt}
        className="max-h-[90vh] max-w-[95vw] rounded-md object-contain shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      />
      {photos.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur">
          {activeIndex + 1} / {photos.length}
        </div>
      ) : null}
    </div>
  )
}
