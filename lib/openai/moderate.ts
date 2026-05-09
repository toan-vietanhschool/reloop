import "server-only"

import OpenAI from "openai"

export interface ModerationResult {
  safe: boolean
  reason: string
}

export interface ModerationInput {
  title: string
  description?: string | null
}

const MODERATION_SYSTEM_PROMPT = `Bạn là moderator cho ReLoop — sàn tái sử dụng đồ ở Việt Nam.

Phân tích bài đăng và quyết định listing có an toàn để hiển thị công khai không.

KHÔNG AN TOÀN nếu:
- Hàng cấm: ma túy, vũ khí, động vật hoang dã, nội tạng người, thuốc kê đơn
- Hàng giả/lậu: tiền giả, giấy tờ giả, hàng nhái thương hiệu
- Đồ nguy hiểm chưa xử lý đúng: pin chưa cách điện, hóa chất độc, chất phóng xạ
- Lừa đảo, đa cấp, thu phí trước bất thường
- Nội dung 18+, kích động thù hằn, phân biệt chủng tộc, mê tín có hại

AN TOÀN nếu:
- Đồ tái chế thông thường (chai nhựa, giấy, kim loại, vải, đồ điện tử cũ đã tháo pin đúng cách)
- Đồ cũ còn dùng được: quần áo, sách, đồ gia dụng, đồ chơi
- Phế liệu thông thường: sắt vụn, nhôm, đồng

Trả về JSON CHÍNH XÁC theo schema:
{ "safe": boolean, "reason": "lý do ngắn gọn bằng tiếng Việt (≤120 ký tự)" }
Không thêm văn bản nào ngoài JSON.`

const PLACEHOLDER_KEY = "PASTE_USER_OPENAI_KEY"

function isApiKeyConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY
  if (!key) return false
  if (key === PLACEHOLDER_KEY) return false
  if (key.startsWith("PASTE_")) return false
  return key.length > 10
}

/**
 * Moderate a listing's text content using GPT-4o-mini.
 *
 * Graceful fallback: when `OPENAI_API_KEY` is missing or still set to
 * the placeholder, returns `{safe: true, reason: 'no-key'}` so MVP
 * works without OpenAI billing. Production behaviour with a real key
 * runs an actual GPT moderation call.
 */
export async function moderateListing(
  input: ModerationInput,
): Promise<ModerationResult> {
  if (!isApiKeyConfigured()) {
    return { safe: true, reason: "no-key" }
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const description = input.description?.trim() ?? ""
  const userMessage = [
    `Tiêu đề: ${input.title.trim()}`,
    description ? `Mô tả: ${description}` : "Mô tả: (không có)",
  ].join("\n")

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 120,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: MODERATION_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) {
      return { safe: false, reason: "moderation_empty_response" }
    }

    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "safe" in parsed &&
      typeof (parsed as { safe: unknown }).safe === "boolean"
    ) {
      const reasonValue = (parsed as { reason?: unknown }).reason
      const reason =
        typeof reasonValue === "string" && reasonValue.trim().length > 0
          ? reasonValue.trim().slice(0, 200)
          : "no-reason"
      return {
        safe: (parsed as { safe: boolean }).safe,
        reason,
      }
    }

    return { safe: false, reason: "moderation_invalid_shape" }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "moderation_unknown_error"
    // Fail closed for unknown OpenAI errors so unsafe content is not
    // auto-published. Caller can surface the reason to the admin queue.
    return { safe: false, reason: `moderation_error:${message.slice(0, 80)}` }
  }
}
