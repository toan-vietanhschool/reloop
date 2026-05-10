"use client"

import "leaflet/dist/leaflet.css"

import L from "leaflet"
import { Locate, AlertCircle } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"

import { MarkerPopup } from "@/components/map/MarkerPopup"
import { PinPointDialog } from "@/components/map/PinPointDialog"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_ZOOM,
  HCM_CENTER,
  colorForType,
  geolocate,
  pointTypeLabelVi,
  type CollectionPoint,
  type LatLng,
  type MaterialCategory,
  type PointType,
} from "@/lib/map-utils"

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

interface MapViewProps {
  points: CollectionPoint[]
  enabledTypes: Set<PointType>
  query: string
  categoriesByCode: Record<string, MaterialCategory>
  isLoggedIn: boolean
}

/**
 * Marker uses a tinted teardrop with a colour-coded core. Verified
 * pins get a solid filled circle (trustworthy), unverified pins get an
 * inscribed triangle (community-contributed) so they are distinguishable
 * at a glance even before the user reads the popup.
 */
function buildMarkerIcon(type: PointType, verified: boolean): L.DivIcon {
  const tone = colorForType(type)
  const ring = verified ? "#065F46" : "#92400E"
  const fillCore = verified ? "#FFFFFF" : tone
  const innerHtml = verified
    ? `<div style="
        position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);
        width:10px;height:10px;border-radius:50%;background:${fillCore};
        box-shadow:0 0 0 2px ${tone};"></div>`
    : `<div style="
        position:absolute;left:50%;top:42%;transform:translate(-50%,-30%);
        width:0;height:0;
        border-left:7px solid transparent;border-right:7px solid transparent;
        border-bottom:11px solid ${fillCore};"></div>`

  const html = `
    <div style="position:relative;width:34px;height:42px;">
      <div style="
        position:absolute;inset:0 0 4px 0;
        border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;
        background:${tone}33;
        border:2px solid ${tone};
        box-shadow:0 6px 14px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.6);
        backdrop-filter:saturate(140%);"></div>
      ${innerHtml}
      <div style="
        position:absolute;left:50%;bottom:0;transform:translateX(-50%);
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid ${ring};
        opacity:0.9;"></div>
    </div>`
  return L.divIcon({
    className: "reloop-marker",
    html,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
  })
}

function buildUserIcon(): L.DivIcon {
  const html = `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:#2563EB33;animation:reloop-pulse 1.6s ease-out infinite;"></div>
      <div style="
        position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
        width:14px;height:14px;border-radius:50%;background:#2563EB;
        border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
    </div>
    <style>
      @keyframes reloop-pulse {
        0% { transform: scale(0.6); opacity: 0.8; }
        100% { transform: scale(1.6); opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .reloop-user-marker div { animation: none !important; }
      }
    </style>`
  return L.divIcon({
    className: "reloop-user-marker",
    html,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

interface RecenterProps {
  target: LatLng | null
}

function Recenter({ target }: RecenterProps) {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 14, { duration: 0.8 })
    }
  }, [target, map])
  return null
}

export default function MapView({
  points,
  enabledTypes,
  query,
  categoriesByCode,
  isLoggedIn,
}: MapViewProps) {
  const [userPos, setUserPos] = useState<LatLng | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [recenterTarget, setRecenterTarget] = useState<LatLng | null>(null)
  const [locating, setLocating] = useState(false)
  const userIcon = useMemo(() => buildUserIcon(), [])
  const errorTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (errorTimer.current !== null) {
        window.clearTimeout(errorTimer.current)
      }
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return points.filter((p) => {
      if (!enabledTypes.has(p.type)) return false
      if (!q) return true
      return p.name.toLowerCase().includes(q)
    })
  }, [points, enabledTypes, query])

  async function handleLocate() {
    setGeoError(null)
    setLocating(true)
    try {
      const pos = await geolocate()
      setUserPos(pos)
      setRecenterTarget(pos)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không xác định được vị trí."
      setGeoError(message)
      if (errorTimer.current !== null) {
        window.clearTimeout(errorTimer.current)
      }
      errorTimer.current = window.setTimeout(() => {
        setGeoError(null)
      }, 5_000)
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[HCM_CENTER.lat, HCM_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer attribution={ATTRIBUTION} url={TILE_URL} />

        <Recenter target={recenterTarget} />

        {filtered.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={buildMarkerIcon(point.type, point.verified)}
            title={`${point.name} — ${pointTypeLabelVi(point.type)}`}
          >
            <Popup>
              <MarkerPopup
                point={point}
                categoriesByCode={categoriesByCode}
                isLoggedIn={isLoggedIn}
              />
            </Popup>
          </Marker>
        ))}

        {userPos && (
          <Marker
            position={[userPos.lat, userPos.lng]}
            icon={userIcon}
            title="Vị trí của bạn"
          >
            <Popup>
              <span className="text-sm font-semibold">Bạn đang ở đây</span>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating control stack — top-right; designed states. */}
      <div className="pointer-events-none absolute right-3 top-3 z-[400] flex flex-col items-end gap-2">
        <PinPointDialog
          isLoggedIn={isLoggedIn}
          defaultCenter={userPos ?? HCM_CENTER}
        />
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleLocate}
          disabled={locating}
          className="pointer-events-auto gap-1.5 rounded-full bg-white px-3 text-sky-800 shadow-soft-lg ring-1 ring-sky-300 hover:bg-sky-50"
          aria-label="Định vị tôi"
        >
          <Locate className="size-3.5" aria-hidden />
          {locating ? "Đang định vị..." : "Vị trí của tôi"}
        </Button>
        {geoError && (
          <div
            role="status"
            className="pointer-events-auto flex max-w-[240px] items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow-soft-lg"
          >
            <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-700" aria-hidden />
            <span>{geoError}</span>
          </div>
        )}
      </div>

      {/* Bottom-left legend — small, ambient */}
      <div className="pointer-events-none absolute bottom-4 left-3 z-[400] hidden items-center gap-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] shadow-soft-lg ring-1 ring-border/50 backdrop-blur md:inline-flex">
        <span className="inline-flex items-center gap-1 text-foreground/80">
          <span
            aria-hidden
            className="inline-block size-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200"
          />
          Đã xác minh
        </span>
        <span className="text-border">•</span>
        <span className="inline-flex items-center gap-1 text-foreground/80">
          <span
            aria-hidden
            className="inline-block size-0 border-x-[5px] border-x-transparent border-b-[8px] border-b-amber-500"
          />
          Cộng đồng pin
        </span>
      </div>
    </div>
  )
}
