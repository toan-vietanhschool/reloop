"use client"

import { useEffect } from "react"

import { track } from "@/lib/analytics"

interface ListingViewTrackerProps {
  listingId: string
  materialCode: string
  intent: string
}

/**
 * Fires `listing_viewed` once per mount. Mounted from the server-rendered
 * listing detail page so we capture the view post-RSC commit, including
 * shareable URLs.
 */
export function ListingViewTracker({
  listingId,
  materialCode,
  intent,
}: ListingViewTrackerProps) {
  useEffect(() => {
    track("listing_viewed", {
      listing_id: listingId,
      material_code: materialCode,
      intent,
    })
  }, [listingId, materialCode, intent])

  return null
}
