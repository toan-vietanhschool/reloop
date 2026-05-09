"use server"

import { ensureScansBucket } from "@/lib/openai/vision"

/**
 * Server Action exposed for one-shot bucket provisioning. The browser
 * upload path uses the user's anon-key client; if the bucket doesn't
 * yet exist on a fresh deployment, an admin/operator can call this
 * once (e.g. from `/admin`) instead of using the dashboard.
 *
 * The route handler `/api/ai/analyze-image` does NOT call this — that
 * route only reads the image URL and does not need the bucket to
 * exist (the upload happens earlier in the browser flow). This action
 * is purely an idempotent provisioning helper.
 */
export async function provisionScansBucket(): Promise<{
  ok: boolean
  error: string | null
}> {
  try {
    await ensureScansBucket()
    return { ok: true, error: null }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown_error"
    return { ok: false, error: message }
  }
}
