import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { statsRouter } from "./routers/stats";
import { achievementsRouter } from "./routers/achievements";
import { connectionsRouter } from "./routers/connections";

export const appRouter = router({
  user: userRouter,
  stats: statsRouter,
  achievements: achievementsRouter,
  connections: connectionsRouter,
});

export type AppRouter = typeof appRouter;
