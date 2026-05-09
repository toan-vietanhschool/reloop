"use client"

import "leaflet/dist/leaflet.css"

import L from "leaflet"
import { Locate } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"

import { MarkerPopup } from "@/components/map/MarkerPopup"
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
}

function buildMarkerIcon(type: PointType, verified: boolean): L.DivIcon {
  const fill = colorForType(type)
  const ring = verified ? "#16A34A" : "#F59E0B"
  const html = `
    <div style="position:relative;width:32px;height:40px;">
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:${fill};
        border:3px solid ${ring};
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
        color:white;font-size:14px;font-weight:600;">
        ${verified ? "&#10003;" : "&middot;"}
      </div>
      <div style="
        position:absolute;left:50%;bottom:-2px;transform:translateX(-50%);
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid ${ring};"></div>
    </div>`
  return L.divIcon({
    className: "reloop-marker",
    html,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
  })
}

function buildUserIcon(): L.DivIcon {
  const html = `
    <div style="
      width:18px;height:18px;border-radius:50%;
      background:#2563EB;border:3px solid white;
      box-shadow:0 0 0 2px #2563EB, 0 2px 6px rgba(0,0,0,0.3);"></div>`
  return L.divIcon({
    className: "reloop-user-marker",
    html,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
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
              <span className="text-sm font-medium">Bạn đang ở đây</span>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="pointer-events-none absolute right-3 top-3 z-[400] flex flex-col items-end gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleLocate}
          disabled={locating}
          className="pointer-events-auto shadow-md"
          aria-label="Định vị tôi"
        >
          <Locate className="h-4 w-4" aria-hidden />
          {locating ? "Đang định vị..." : "Vị trí của tôi"}
        </Button>
        {geoError && (
          <div
            role="status"
            className="pointer-events-auto max-w-[220px] rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow"
          >
            {geoError}
          </div>
        )}
      </div>
    </div>
  )
}

