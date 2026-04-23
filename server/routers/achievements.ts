import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { AchievementDefinition } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { evaluateCondition } from "@/lib/achievement-conditions";

const AchievementStatusEnum = z.enum([
  "locked",
  "available",
  "claiming",
  "claimed",
]);

export const achievementsRouter = router({
  /** List all global achievement definitions (public — no auth needed). */
  listDefinitions: publicProcedure.query(() => {
    return prisma.achievementDefinition.findMany({
      orderBy: { createdAt: "asc" },
    });
  }),

  /**
   * List the current user's achievements joined with their definitions.
   * Returns one entry per definition; missing rows are shown as "locked".
   */
  listMine: protectedProcedure.query(async ({ ctx }) => {
    const [definitions, userAchievements] = await Promise.all([
      prisma.achievementDefinition.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.userAchievement.findMany({
        where: { userAddress: ctx.address },
        include: { achievement: true },
      }),
    ]);

    const byId = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

    return definitions.map((def: AchievementDefinition) => {
      const ua = byId.get(def.id);
      return {
        ...def,
        status: (ua?.status ?? "locked") as z.infer<typeof AchievementStatusEnum>,
        progress: ua?.progress ?? 0,
        unlockedAt: ua?.unlockedAt ?? null,
        claimedAt: ua?.claimedAt ?? null,
      };
    });
  }),

  /**
   * Evaluate each achievement's condition against the user's current
   * platform connections and upsert UserAchievement rows accordingly.
   *
   * - Never downgrades a "claimed" achievement.
   * - Sets status to "available" when condition is fully met.
   * - Updates progress for partial progress (e.g. Full AI Stack).
   * - Returns the number of rows created or updated.
   */
  checkAndUpdate: protectedProcedure.mutation(async ({ ctx }) => {
    const [connections, definitions, existingUAs] = await Promise.all([
      prisma.platformConnection.findMany({ where: { userAddress: ctx.address } }),
      prisma.achievementDefinition.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.userAchievement.findMany({ where: { userAddress: ctx.address } }),
    ]);

    // Ensure the parent User row exists before writing child rows
    await prisma.user.upsert({
      where: { address: ctx.address },
      create: { address: ctx.address },
      update: {},
    });

    const existingByDef = new Map(existingUAs.map((ua) => [ua.achievementId, ua]));

    const upserts = definitions
      .map((def) => {
        const existing = existingByDef.get(def.id);

        // Never touch a claimed achievement
        if (existing?.status === "claimed") return null;

        const result = evaluateCondition(def.condition, connections, def.maxProgress);
        const newStatus = result.met ? "available" : "locked";
        const wasAvailable = existing?.status === "available";

        return prisma.userAchievement.upsert({
          where: {
            userAddress_achievementId: {
              userAddress: ctx.address,
              achievementId: def.id,
            },
          },
          create: {
            userAddress: ctx.address,
            achievementId: def.id,
            status: newStatus,
            progress: result.progress,
            unlockedAt: newStatus === "available" ? new Date() : null,
          },
          update: {
            status: newStatus,
            progress: result.progress,
            // Only set unlockedAt the first time a condition is satisfied
            ...(!wasAvailable && newStatus === "available" && {
              unlockedAt: new Date(),
            }),
          },
        });
      })
      .filter(Boolean);

    await Promise.all(upserts);

    return { updated: upserts.length };
  }),

  /**
   * Claim an achievement that has status "available".
   * Transitions to "claimed" and records claimedAt.
   */
  claim: protectedProcedure
    .input(z.object({ achievementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ua = await prisma.userAchievement.findUnique({
        where: {
          userAddress_achievementId: {
            userAddress: ctx.address,
            achievementId: input.achievementId,
          },
        },
      });

      if (!ua) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Achievement not found for this user.",
        });
      }

      if (ua.status !== "available") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Achievement is "${ua.status}", not "available".`,
        });
      }

      return prisma.userAchievement.update({
        where: {
          userAddress_achievementId: {
            userAddress: ctx.address,
            achievementId: input.achievementId,
          },
        },
        data: {
          status: "claimed",
          claimedAt: new Date(),
        },
        include: { achievement: true },
      });
    }),

  /** Update (or create) a user's progress on a specific achievement. */
  updateProgress: protectedProcedure
    .input(
      z.object({
        achievementId: z.string(),
        status: AchievementStatusEnum.optional(),
        progress: z.number().int().min(0).optional(),
        unlockedAt: z.date().nullable().optional(),
        claimedAt: z.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { achievementId, ...data } = input;

      await prisma.user.upsert({
        where: { address: ctx.address },
        create: { address: ctx.address },
        update: {},
      });

      return prisma.userAchievement.upsert({
        where: {
          userAddress_achievementId: {
            userAddress: ctx.address,
            achievementId,
          },
        },
        create: { userAddress: ctx.address, achievementId, ...data },
        update: { ...data },
        include: { achievement: true },
      });
    }),
});
