import { MapPageClient } from "@/components/map/MapPageClient"
import { createClient } from "@/lib/supabase/server"
import type {
  CollectionPoint,
  MaterialCategory,
} from "@/lib/map-utils"

export const metadata = {
  title: "Bản đồ điểm thu gom — ReLoop",
  description: "Tìm vựa phế liệu, thùng tái chế, điểm e-waste gần bạn.",
}

export default async function MapPage() {
  const supabase = await createClient()

  const [pointsRes, categoriesRes] = await Promise.all([
    supabase
      .from("collection_points")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("material_categories").select("*"),
  ])

  const points: CollectionPoint[] = pointsRes.data ?? []
  const categories: MaterialCategory[] = categoriesRes.data ?? []

  const categoriesByCode: Record<string, MaterialCategory> = {}
  for (const c of categories) {
    categoriesByCode[c.code] = c
  }

  return (
    <MapPageClient points={points} categoriesByCode={categoriesByCode} />
  )
}
