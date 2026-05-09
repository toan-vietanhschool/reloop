import "server-only"

import { createHash } from "node:crypto"

import OpenAI from "openai"
import { z } from "zod"

import { awardPoints } from "@/actions/points"
import { trackServer } from "@/lib/analytics-server"
import { POINTS } from "@/lib/points"
import { createAdminClient } from "@/lib/supabase/admin"

import { VISION_SYSTEM_PROMPT, VISION_USER_PROMPT } from "./prompts"

const PLACEHOLDER_KEY = "PASTE_USER_OPENAI_KEY"
const MODEL = "gpt-4o-mini"
const OPENAI_TIMEOUT_MS = 30_000
const STORAGE_BUCKET = "scans"

let bucketEnsured = false

/**
 * Material code enum mirrors `material_code` Postgres enum.
 */
const MaterialCodeEnum = z.enum([
  "PET",
  "HDPE",
  "PP",
  "PS",
  "PVC",
  "OTHER_PLASTIC",
  "PAPER",
  "CARDBOARD",
  "GLASS",
  "METAL_AL",
  "METAL_FE",
  "TEXTILE",
  "ELECTRONIC",
  "ORGANIC",
  "BATTERY",
  "MIXED",
])

const CollectionPointTypeEnum = z.enum([
  "scrap_dealer",
  "recycle_bin",
  "ngo_dropoff",
  "ewaste",
  "other",
])

const DiyIdeaSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(400),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
})

/**
 * Strict Zod schema for the Vision JSON response. Mirrors
 * `VISION_SYSTEM_PROMPT` schema definition.
 */
export const VisionResultSchema = z.object({
  detected_item: z.string().min(1).max(160),
  material_code: MaterialCodeEnum,
  confidence: z.number().min(0).max(1),
  decomposition_years_min: z.number().int().min(0),
  decomposition_years_max: z.number().int().min(0).nullable(),
  environmental_impact_score: z.number().min(1).max(10),
  recyclable: z.boolean(),
  recycle_suggestions: z.array(z.string().min(1)).min(1).max(8),
  diy_ideas: z.array(DiyIdeaSchema).max(6).default([]),
  nearby_collection_point_types: z
    .array(CollectionPointTypeEnum)
    .max(6)
    .default([]),
  warning: z.string().nullable().default(null),
})

export type VisionResult = z.infer<typeof VisionResultSchema>
export type MaterialCode = z.infer<typeof MaterialCodeEnum>
export type DiyIdea = z.infer<typeof DiyIdeaSchema>

export interface AnalyzeImageOk {
  data: VisionResult
  cached: boolean
  error?: undefined
}

export interface AnalyzeImageErr {
  data: null
  cached: false
  error: string
}

export type AnalyzeImageResult = AnalyzeImageOk | AnalyzeImageErr

interface CachedAnalysis {
  result: VisionResult
  imageHash: string
}

/**
 * True when `OPENAI_API_KEY` is real (non-empty, non-placeholder).
 * MVP runs without an OpenAI key by returning a graceful fallback —
 * see `buildFallbackResult`.
 */
function isApiKeyConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY
  if (!key) return false
  if (key === PLACEHOLDER_KEY) return false
  if (key.startsWith("PASTE_")) return false
  return key.length > 10
}

function buildFallbackResult(): VisionResult {
  return {
    detected_item: "Demo (no AI key)",
    material_code: "MIXED",
    confidence: 0.5,
    decomposition_years_min: 100,
    decomposition_years_max: 500,
    environmental_impact_score: 5,
    recyclable: true,
    recycle_suggestions: [
      "Thêm OPENAI_API_KEY vào .env.local để dùng AI thật",
      "Trong khi chờ, bạn có thể thử mang đồ ra vựa phế liệu gần nhà",
    ],
    diy_ideas: [],
    nearby_collection_point_types: ["recycle_bin"],
    warning: null,
  }
}

/**
 * SHA-256 of the raw bytes — works as cache key + dedup key. We fetch
 * the image once on the server so two clients uploading the same file
 * to two different storage paths still hash to the same key.
 */
async function hashImageBytes(imageUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    const res = await fetch(imageUrl, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length === 0) return null
    return createHash("sha256").update(buf).digest("hex")
  } catch {
    return null
  }
}

/**
 * Look up an existing analysis by image hash — primary cache key.
 * Returns null if not found or on any error.
 */
async function findCachedByHash(
  imageHash: string,
): Promise<CachedAnalysis | null> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("ai_analyses")
      .select("result, image_hash")
      .eq("image_hash", imageHash)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ result: unknown; image_hash: string }>()

    if (error || !data) return null

    const parsed = VisionResultSchema.safeParse(data.result)
    if (!parsed.success) return null

    return { result: parsed.data, imageHash: data.image_hash }
  } catch {
    return null
  }
}

interface PersistAnalysisInput {
  imageUrl: string
  imageHash: string
  userId: string
  result: VisionResult
  tokensInput?: number | null
  tokensOutput?: number | null
}

/**
 * Persist a fresh analysis: cache row + eco_action + points bump.
 * Best-effort — failures are logged but do not break the user response.
 *
 * Anti-cheat: this function is only called on cache MISS — repeated
 * scans of the same image short-circuit at the cache lookup, so no
 * double-counting can occur.
 */
async function persistAnalysis(
  input: PersistAnalysisInput,
): Promise<{ analysisId: string | null }> {
  const admin = createAdminClient()

  const cacheRow = {
    image_hash: input.imageHash,
    image_url: input.imageUrl,
    model: MODEL,
    result: input.result as unknown as Record<string, unknown>,
    tokens_input: input.tokensInput ?? null,
    tokens_output: input.tokensOutput ?? null,
    user_id: input.userId,
  }

  const { data: inserted, error: insertError } = await admin
    .from("ai_analyses")
    .insert(cacheRow as never)
    .select("id")
    .single<{ id: string }>()

  let analysisId: string | null = null
  if (insertError) {
    console.warn("ai_analyses insert failed:", insertError.message)
  } else {
    analysisId = inserted?.id ?? null
  }

  // Award eco_points via the canonical helper (uses increment_points RPC).
  const award = await awardPoints(
    input.userId,
    "scan",
    POINTS.scan,
    "ai_analyses",
    analysisId ?? undefined,
    { skipRevalidate: true },
  )
  if (award.error) {
    console.warn("awardPoints(scan) failed:", award.error)
  }

  return { analysisId }
}

/**
 * Ensure the `scans` storage bucket exists. Idempotent — caches the
 * success per-process. Operator can also provision via Supabase
 * dashboard; this helper is best-effort.
 */
export async function ensureScansBucket(): Promise<void> {
  if (bucketEnsured) return
  try {
    const admin = createAdminClient()
    const { data, error: listError } = await admin.storage.listBuckets()
    if (listError) return

    const exists = data?.some((b) => b.name === STORAGE_BUCKET)
    if (exists) {
      bucketEnsured = true
      return
    }

    const { error: createError } = await admin.storage.createBucket(
      STORAGE_BUCKET,
      { public: true, fileSizeLimit: "3MB" },
    )
    if (!createError) {
      bucketEnsured = true
    }
  } catch {
    // swallow — caller can still call OpenAI on hosted URLs
  }
}

interface OpenAICallResult {
  parsed: VisionResult
  tokensInput: number | null
  tokensOutput: number | null
}

/**
 * Call OpenAI Vision with the image URL. Throws on any error so the
 * caller can decide how to surface fallback behaviour.
 */
async function callOpenAIVision(imageUrl: string): Promise<OpenAICallResult> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: OPENAI_TIMEOUT_MS,
  })

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    max_tokens: 800,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: VISION_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: VISION_USER_PROMPT },
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "low" },
          },
        ],
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content?.trim()
  if (!raw) {
    throw new Error("ai_empty_response")
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    throw new Error("ai_parse_error")
  }

  const parsed = VisionResultSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error("ai_invalid_shape")
  }

  return {
    parsed: parsed.data,
    tokensInput: completion.usage?.prompt_tokens ?? null,
    tokensOutput: completion.usage?.completion_tokens ?? null,
  }
}

/**
 * Public entry-point for `/api/ai/analyze-image`.
 *
 * Flow:
 *   1. Hash image bytes (skip cache if hashing fails).
 *   2. Cache hit → return cached, NO new eco_action (anti-cheat).
 *   3. No OpenAI key → return graceful fallback, NO points (we're not
 *      analysing anything for real).
 *   4. Else: call OpenAI, validate, persist, award points.
 */
export async function analyzeImage(
  imageUrl: string,
  userId: string,
): Promise<AnalyzeImageResult> {
  if (!imageUrl || typeof imageUrl !== "string") {
    return { data: null, cached: false, error: "invalid_image_url" }
  }

  // scan_started — fire before any heavy work so we can compute funnel
  // drop-off (started vs success) accurately.
  void trackServer(userId, "scan_started", {})

  const imageHash = await hashImageBytes(imageUrl)

  // 1. Cache lookup (only when we successfully hashed the image).
  if (imageHash) {
    const cached = await findCachedByHash(imageHash)
    if (cached) {
      void trackServer(userId, "scan_success", {
        cached: true,
        material_code: cached.result.material_code,
      })
      return { data: cached.result, cached: true }
    }
  }

  // 2. No real key → fallback (no caching, no points awarded).
  if (!isApiKeyConfigured()) {
    const fallback = buildFallbackResult()
    void trackServer(userId, "scan_success", {
      cached: false,
      fallback: true,
      material_code: fallback.material_code,
    })
    return { data: fallback, cached: false }
  }

  // 3. Real OpenAI call + persist.
  try {
    const { parsed, tokensInput, tokensOutput } =
      await callOpenAIVision(imageUrl)

    if (imageHash) {
      await persistAnalysis({
        imageUrl,
        imageHash,
        userId,
        result: parsed,
        tokensInput,
        tokensOutput,
      })
    } else {
      // Could not hash (network blip) — still award points but skip
      // cache write so we don't lose the dedup invariant.
      const award = await awardPoints(
        userId,
        "scan",
        POINTS.scan,
        "ai_analyses",
        undefined,
        { skipRevalidate: true },
      )
      if (award.error) {
        console.warn("awardPoints(scan, no-hash) failed:", award.error)
      }
    }

    void trackServer(userId, "scan_success", {
      cached: false,
      fallback: false,
      material_code: parsed.material_code,
      confidence: parsed.confidence,
    })
    return { data: parsed, cached: false }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "ai_unknown_error"
    void trackServer(userId, "scan_failed", { reason: message })
    return { data: null, cached: false, error: message }
  }
}
