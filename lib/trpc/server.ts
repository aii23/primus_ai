import "server-only";
import { createCallerFactory } from "@/server/trpc";
import { appRouter } from "@/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Server-side tRPC caller — use in Server Components and Route Handlers
 * to call procedures without an HTTP round-trip.
 *
 * @example
 * const caller = await createServerCaller();
 * const stats = await caller.stats.get();
 */
export async function createServerCaller() {
  const session = await getServerSession(authOptions);
  const createCaller = createCallerFactory(appRouter);
  return createCaller({ session });
}
