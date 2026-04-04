import { z } from "zod"
import { router, publicProcedure, protectedProcedure } from "."
import { createClient } from "@supabase/supabase-js"
import { tenants, users } from "../db/schema"

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        companyName: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
      })

      if (authError) throw authError

      const [tenant] = await ctx.db
        .insert(tenants)
        .values({ name: input.companyName })
        .returning()

      const [user] = await ctx.db
        .insert(users)
        .values({
          tenant_id: tenant.id,
          email: input.email,
          name: input.name,
          role: "admin",
          supabase_uid: authData.user.id,
        })
        .returning()

      return { userId: user.id, tenantId: tenant.id }
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      })

      if (error) throw error

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      }
    }),

  session: protectedProcedure.query(({ ctx }) => {
    return { userId: ctx.userId, tenantId: ctx.tenantId }
  }),

  refreshToken: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: input.refreshToken,
      })

      if (error) throw error

      return {
        accessToken: data.session!.access_token,
        refreshToken: data.session!.refresh_token,
        expiresAt: data.session!.expires_at,
      }
    }),
})
