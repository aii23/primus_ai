import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import superjson from "superjson";
import { authOptions } from "@/lib/auth";

// ─── Context ──────────────────────────────────────────────────────────────────

export async function createContext(req: Request) {
  const session = await getServerSession(authOptions);
  return { session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// ─── tRPC init ────────────────────────────────────────────────────────────────

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// ─── Reusable builders ────────────────────────────────────────────────────────

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

/** No auth required. */
export const publicProcedure = t.procedure;

/** Requires a valid session; injects `address` into ctx. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.address) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, address: ctx.session.address } });
});
