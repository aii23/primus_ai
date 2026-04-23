import type { PlatformConnection } from '@prisma/client'

function summaryStringField(summary: unknown, key: string): string | undefined {
  if (summary == null || typeof summary !== 'object') return undefined
  const v = (summary as Record<string, unknown>)[key]
  return typeof v === 'string' ? v : undefined
}

function summaryNumberField(summary: unknown, key: string): number | undefined {
  if (summary == null || typeof summary !== 'object') return undefined
  const v = (summary as Record<string, unknown>)[key]
  return typeof v === 'number' ? v : undefined
}

// ─── Condition types ──────────────────────────────────────────────────────────
// These are stored as JSON in AchievementDefinition.condition and evaluated
// server-side in the achievements router.

/** True when a string field on the connection is non-empty. */
export interface ConditionPlatformFieldNonempty {
  type: 'platform_field_nonempty'
  platform: string
  /** `username` = top-level column; others = string keys inside `verifiedSummary` JSON */
  field: 'membershipType' | 'planType' | 'username'
}

/** True when a numeric field on the connection exceeds a threshold. */
export interface ConditionPlatformFieldGt {
  type: 'platform_field_gt'
  platform: string
  /** Numeric keys inside `verifiedSummary` JSON */
  field: 'tokenAmount'
  value: number
}

/** True when the connection for a platform has status === "verified". */
export interface ConditionPlatformVerified {
  type: 'platform_verified'
  platform: string
}

/**
 * True when at least `count` distinct platforms have status === "verified".
 * Progress tracks the current count (capped at maxProgress).
 */
export interface ConditionMinPlatformsVerified {
  type: 'min_platforms_verified'
  count: number
}

export type AchievementCondition =
  | ConditionPlatformFieldNonempty
  | ConditionPlatformFieldGt
  | ConditionPlatformVerified
  | ConditionMinPlatformsVerified

// ─── Result ───────────────────────────────────────────────────────────────────

export interface ConditionResult {
  /** How much progress the user has made toward this achievement. */
  progress: number
  /** The value at which the achievement is fully unlocked. */
  maxProgress: number
  /** True when progress >= maxProgress. */
  met: boolean
}

// ─── Evaluator ────────────────────────────────────────────────────────────────

/**
 * Evaluates a stored condition against the user's current platform connections.
 *
 * @param rawCondition - The JSON value from `AchievementDefinition.condition`.
 * @param connections  - All PlatformConnection rows for the user.
 * @param maxProgress  - Copied from the AchievementDefinition.
 */
export function evaluateCondition(
  rawCondition: unknown,
  connections: PlatformConnection[],
  maxProgress: number,
): ConditionResult {
  if (
    !rawCondition ||
    typeof rawCondition !== 'object' ||
    !('type' in rawCondition) ||
    typeof (rawCondition as Record<string, unknown>).type !== 'string'
  ) {
    return { progress: 0, maxProgress, met: false }
  }

  const condition = rawCondition as AchievementCondition
  const byPlatform = new Map(connections.map((c) => [c.platform, c]))

  switch (condition.type) {
    case 'platform_field_nonempty': {
      const conn = byPlatform.get(condition.platform)
      const value =
        condition.field === 'username'
          ? conn?.username
          : summaryStringField(conn?.verifiedSummary, condition.field)
      const met = typeof value === 'string' && value.trim() !== ''
      return { progress: met ? 1 : 0, maxProgress, met }
    }

    case 'platform_field_gt': {
      const conn = byPlatform.get(condition.platform)
      const value = summaryNumberField(conn?.verifiedSummary, condition.field)
      const met = typeof value === 'number' && value > condition.value
      return { progress: met ? 1 : 0, maxProgress, met }
    }

    case 'platform_verified': {
      const conn = byPlatform.get(condition.platform)
      const met = conn?.status === 'verified'
      return { progress: met ? 1 : 0, maxProgress, met }
    }

    case 'min_platforms_verified': {
      const verifiedCount = connections.filter((c) => c.status === 'verified').length
      const progress = Math.min(verifiedCount, maxProgress)
      const met = verifiedCount >= condition.count
      return { progress, maxProgress, met }
    }

    default:
      return { progress: 0, maxProgress, met: false }
  }
}
