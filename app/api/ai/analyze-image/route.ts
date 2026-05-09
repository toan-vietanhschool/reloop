import { NextResponse } from "next/server"
import { z } from "zod"

import { analyzeImage } from "@/lib/openai/vision"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5

/**
 * In-memory rate-limit ledger. Keyed by user id, value is a sliding
 * window of timestamps within RATE_LIMIT_WINDOW_MS.
 *
 * NOTE: single-instance only — works for our MVP single Vercel instance.
 * For multi-region scale, swap to Upstash Redis (see NOTES).
 */
const rateLedger = new Map<string, number[]>()

function takeRateToken(userId: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  const prev = rateLedger.get(userId) ?? []
  const recent = prev.filter((t) => t > windowStart)

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLedger.set(userId, recent)
    return false
  }

  recent.push(now)
  rateLedger.set(userId, recent)
  return true
}

const RequestSchema = z.object({
  imageUrl: z.string().url(),
})

export async function POST(request: Request) {
  // 1. Authenticate via cookie-bound Supabase client.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { data: null, error: "Bạn cần đăng nhập để dùng AI Vision." },
      { status: 401 },
    )
  }

  // 2. Rate-limit (5 calls / 60s / user).
  if (!takeRateToken(user.id)) {
    return NextResponse.json(
      {
        data: null,
        error: "Bạn đã scan quá nhanh, thử lại sau 1 phút.",
      },
      { status: 429 },
    )
  }

  // 3. Parse body.
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { data: null, error: "Body không phải JSON hợp lệ." },
      { status: 400 },
    )
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        error:
          parsed.error.issues[0]?.message ?? "imageUrl không hợp lệ.",
      },
      { status: 400 },
    )
  }

  // 4. Run vision analysis (handles cache + fallback + points).
  const result = await analyzeImage(parsed.data.imageUrl, user.id)

  if (result.error || !result.data) {
    return NextResponse.json(
      {
        data: null,
        cached: false,
        error: result.error ?? "ai_unknown_error",
      },
      { status: 502 },
    )
  }

  return NextResponse.json(
    { data: result.data, cached: result.cached },
    { status: 200 },
  )
}
