import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { createPrimusSignedRequest } from "@/lib/primus-attestation-server";
import { router, protectedProcedure } from "../trpc";

const AIPlatformEnum = z.enum([
  "cursor",
  "claude_console",
  "chatgpt",
  "claude",
]);

const ConnectionStatusEnum = z.enum([
  "not_connected",
  "connecting",
  "connected",
  "verifying",
  "verified",
  "failed",
]);

export const connectionsRouter = router({
  /**
   * Build a signed Primus zkTLS request using server-side credentials.
   * The browser completes attestation via the Primus extension.
   */
  primusSignedRequest: protectedProcedure
    .input(z.object({ platform: AIPlatformEnum }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await createPrimusSignedRequest({
          userAddress: ctx.address,
          platform: input.platform,
        });
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to create Primus signed request";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),

  /** List all platform connections for the current user. */
  list: protectedProcedure.query(async ({ ctx }) => {
    return prisma.platformConnection.findMany({
      where: { userAddress: ctx.address },
      orderBy: { createdAt: "asc" },
    });
  }),

  /** Get a single connection by platform. */
  getByPlatform: protectedProcedure
    .input(z.object({ platform: AIPlatformEnum }))
    .query(async ({ ctx, input }) => {
      return prisma.platformConnection.findUnique({
        where: {
          userAddress_platform: {
            userAddress: ctx.address,
            platform: input.platform,
          },
        },
      });
    }),

  /**
   * Upsert a platform connection.
   * Call this after a successful Primus zkTLS verification to store the attestation.
   * Put platform-specific parsed fields in `verifiedSummary` (typed in app code).
   */
  upsert: protectedProcedure
    .input(
      z.object({
        platform: AIPlatformEnum,
        status: ConnectionStatusEnum,
        username: z.string().optional(),
        /** Parsed highlights (membershipType, tokenAmount, planType, …) */
        verifiedSummary: z.record(z.string(), z.unknown()).nullable().optional(),
        primusTemplateId: z.string().optional(),
        /** Raw Primus zkTLS attestation payload */
        attestationData: z.unknown().optional(),
        lastVerified: z.date().optional(),
        connectedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { platform, attestationData, verifiedSummary, ...rest } = input;
      const data = {
        ...rest,
        ...(attestationData !== undefined && {
          attestationData: attestationData as Prisma.InputJsonValue,
        }),
        ...(verifiedSummary !== undefined && {
          verifiedSummary:
            verifiedSummary === null
              ? Prisma.DbNull
              : (verifiedSummary as Prisma.InputJsonValue),
        }),
      };

      // Ensure parent User row exists
      await prisma.user.upsert({
        where: { address: ctx.address },
        create: { address: ctx.address },
        update: {},
      });

      return prisma.platformConnection.upsert({
        where: {
          userAddress_platform: {
            userAddress: ctx.address,
            platform,
          },
        },
        create: { userAddress: ctx.address, platform, ...data },
        update: { ...data },
      });
    }),

  /** Mark a connection as disconnected without deleting the row. */
  disconnect: protectedProcedure
    .input(z.object({ platform: AIPlatformEnum }))
    .mutation(async ({ ctx, input }) => {
      return prisma.platformConnection.update({
        where: {
          userAddress_platform: {
            userAddress: ctx.address,
            platform: input.platform,
          },
        },
        data: {
          status: "not_connected",
          username: null,
          verifiedSummary: Prisma.DbNull,
          attestationData: Prisma.DbNull,
          lastVerified: null,
          connectedAt: null,
        },
      });
    }),
});
