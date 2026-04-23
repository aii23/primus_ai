import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  /** Get the current user, or null if they haven't been stored yet. */
  get: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findUnique({
      where: { address: ctx.address },
    });
  }),

  /**
   * Upsert the current user record.
   * Called automatically after a successful SIWE sign-in.
   */
  upsert: protectedProcedure
    .input(z.object({}).optional()) // no extra fields for now — address comes from session
    .mutation(async ({ ctx }) => {
      return prisma.user.upsert({
        where: { address: ctx.address },
        create: { address: ctx.address },
        update: { updatedAt: new Date() },
      });
    }),
});
