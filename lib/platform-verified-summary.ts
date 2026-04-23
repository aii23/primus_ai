import { z } from 'zod'

/**
 * Platform-specific fields persisted on `PlatformConnection.verifiedSummary` (JSON).
 * Extend the Zod object (and TypeScript type) when adding integrations — no new DB columns.
 */
export const verifiedSummarySchema = z
  .object({
    membershipType: z.string().optional(),
    tokenAmount: z.number().int().min(0).optional(),
    planType: z.string().optional(),
  })
  .passthrough()

export type VerifiedSummary = z.infer<typeof verifiedSummarySchema>

export function parseVerifiedSummary(raw: unknown): VerifiedSummary | undefined {
  if (raw == null) return undefined
  const parsed = verifiedSummarySchema.safeParse(raw)
  return parsed.success ? parsed.data : undefined
}

/** Persisted JSON blob from attestation extraction (omit when empty). */
export function buildVerifiedSummaryFromExtracted(extracted: {
  membershipType?: string
  tokenAmount?: number
  planType?: string
}): Record<string, unknown> | null {
  const out: Record<string, unknown> = {}
  if (extracted.membershipType != null && extracted.membershipType !== '')
    out.membershipType = extracted.membershipType
  if (extracted.tokenAmount !== undefined) out.tokenAmount = extracted.tokenAmount
  if (extracted.planType != null && extracted.planType !== '') out.planType = extracted.planType
  return Object.keys(out).length > 0 ? out : null
}
