import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeTrustFromVerifiedCount } from "@/lib/trust-score";
import { router, protectedProcedure } from "../trpc";

const ReputationInput = z.object({
  overallScore: z.number().int().min(0).max(100).optional(),
  profileCompletion: z.number().int().min(0).max(100).optional(),
  /** Array of { name, score, maxScore, description } */
  factors: z.array(z.unknown()).optional(),
});

export const statsRouter = router({
  /**
   * Returns reputation for the current user.
   * `overallScore` and `profileCompletion` are derived from the count of
   * `verified` platform connections (0–4 → 0–100). Stored `ReputationScore`
   * row is only used for `id` / `updatedAt` continuity; scores are always computed.
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const verifiedCount = await prisma.platformConnection.count({
      where: { userAddress: ctx.address, status: "verified" },
    });
    const computed = computeTrustFromVerifiedCount(verifiedCount);
    const stored = await prisma.reputationScore.findUnique({
      where: { userAddress: ctx.address },
    });
    const now = new Date();
    return {
      id: stored?.id ?? "",
      userAddress: ctx.address,
      overallScore: computed.overallScore,
      profileCompletion: computed.profileCompletion,
      factors: computed.factors as unknown as Prisma.JsonValue,
      lastUpdated: now,
      updatedAt: stored?.updatedAt ?? now,
    };
  }),

  /** Create or replace the user's reputation score. */
  upsertReputation: protectedProcedure
    .input(ReputationInput)
    .mutation(async ({ ctx, input }) => {
      const { factors, ...rest } = input;
      const data = {
        ...rest,
        ...(factors !== undefined && {
          factors: factors as Prisma.InputJsonValue,
        }),
      };

      await prisma.user.upsert({
        where: { address: ctx.address },
        create: { address: ctx.address },
        update: {},
      });
      return prisma.reputationScore.upsert({
        where: { userAddress: ctx.address },
        create: { userAddress: ctx.address, ...data, lastUpdated: new Date() },
        update: { ...data, lastUpdated: new Date() },
      });
    }),
});
