import type { TrustScoreFactor } from '@/lib/types'

/** Number of AI platforms used for trust normalization (matches connections UI). */
export const TRUST_SCORE_PLATFORM_CAP = 4

export interface ComputedTrustScore {
  overallScore: number
  profileCompletion: number
  factors: TrustScoreFactor[]
}

/**
 * Trust score 0–100 from how many connections are in `verified` status.
 * Each verified platform adds an equal share up to {@link TRUST_SCORE_PLATFORM_CAP}.
 */
export function computeTrustFromVerifiedCount(verifiedCount: number): ComputedTrustScore {
  const n = Math.min(Math.max(verifiedCount, 0), TRUST_SCORE_PLATFORM_CAP)
  const overallScore = Math.round((n / TRUST_SCORE_PLATFORM_CAP) * 100)
  return {
    overallScore,
    profileCompletion: overallScore,
    factors: [
      {
        name: 'Verified connections',
        score: overallScore,
        maxScore: 100,
        description: `${n} of ${TRUST_SCORE_PLATFORM_CAP} platforms verified`,
      },
    ],
  }
}
