import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { createClient } from "@supabase/supabase-js"
import { db } from "../db"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"

import { authRouter } from "./auth"
import { syncRouter } from "./sync"
import { contactsRouter } from "./contacts"
import { dealsRouter } from "./deals"
import { quotesRouter } from "./quotes"
import { aiRouter } from "./ai"

export interface TRPCContext {
  db: typeof db
  userId?: string
  tenantId?: string
}

export async function createContext(opts: {
  headers: Headers
}): Promise<TRPCContext> {
  const authorization = opts.headers.get("authorization")

  if (!authorization?.startsWith("Bearer ")) {
    return { db }
  }

  const token = authorization.slice(7)

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) return { db }

    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.supabase_uid, user.id))
      .limit(1)

    if (dbUser.length === 0) return { db }

    return {
      db,
      userId: dbUser[0].id,
      tenantId: dbUser[0].tenant_id,
    }
  } catch {
    return { db }
  }
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId || !ctx.tenantId) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: { ...ctx, userId: ctx.userId, tenantId: ctx.tenantId },
  })
})

export const appRouter = router({
  auth: authRouter,
  sync: syncRouter,
  contacts: contactsRouter,
  deals: dealsRouter,
  quotes: quotesRouter,
  ai: aiRouter,
})

export type AppRouter = typeof appRouter
