"use client"

import { useEffect, useState } from "react"

interface PhotoGridProps {
  photos: string[]
  alt: string
}

export function PhotoGrid({ photos, alt }: PhotoGridProps) {
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
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-muted text-5xl">
        <span aria-hidden>♻️</span>
      </div>
    )
  }

  const gridClass =
    photos.length === 1
      ? "grid-cols-1"
      : photos.length === 2
        ? "grid-cols-2"
        : "grid-cols-2 md:grid-cols-3"

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null

  return (
    <>
      <div className={`grid gap-2 ${gridClass}`}>
        {photos.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Mở ảnh ${index + 1} / ${photos.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${alt} ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {activePhoto ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phóng to"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setActiveIndex(null)
            }}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white text-xl backdrop-blur hover:bg-white/25"
            aria-label="Đóng"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePhoto}
            alt={alt}
            className="max-h-[90vh] max-w-[95vw] rounded-md object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          {photos.length > 1 ? (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur">
              {(activeIndex ?? 0) + 1} / {photos.length}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
