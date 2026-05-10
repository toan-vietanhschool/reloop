import { timingSafeEqual } from "node:crypto"

/**
 * Constant-time string equality. Use this whenever comparing a
 * client-supplied secret/token against an expected value (cron secrets,
 * webhook signatures, bearer tokens) so a timing side-channel cannot
 * leak the expected value byte-by-byte.
 *
 * Returns false immediately on length mismatch — that branch reveals
 * only the length of `a`, not its contents, which is acceptable for
 * fixed-length secrets.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8")
  const bBuf = Buffer.from(b, "utf8")
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}
