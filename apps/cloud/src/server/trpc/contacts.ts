import { z } from "zod"
import { router, protectedProcedure } from "."
import { contacts } from "../db/schema"
import { eq, and, ilike, or, sql } from "drizzle-orm"

export const contactsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().int().positive().default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      let query = ctx.db
        .select()
        .from(contacts)
        .where(
          and(
            eq(contacts.tenant_id, ctx.tenantId),
            eq(contacts.archived, false)
          )
        )
        .limit(input.limit)
        .offset(input.offset)

      if (input.search) {
        const searchTerm = `%${input.search}%`
        query = ctx.db
          .select()
          .from(contacts)
          .where(
            and(
              eq(contacts.tenant_id, ctx.tenantId),
              eq(contacts.archived, false),
              or(
                ilike(contacts.first_name, searchTerm),
                ilike(contacts.last_name, searchTerm),
                ilike(contacts.phone, searchTerm),
                ilike(contacts.company, searchTerm)
              )
            )
          )
          .limit(input.limit)
          .offset(input.offset)
      }

      return query
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(contacts)
        .where(
          and(eq(contacts.id, input.id), eq(contacts.tenant_id, ctx.tenantId))
        )
        .limit(1)

      return result[0] ?? null
    }),

  create: protectedProcedure
    .input(
      z.object({
        first_name: z.string().min(1),
        last_name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [contact] = await ctx.db
        .insert(contacts)
        .values({
          tenant_id: ctx.tenantId,
          ...input,
        })
        .returning()

      return contact
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        first_name: z.string().min(1).optional(),
        last_name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        lead_score: z.number().int().min(0).max(100).optional(),
        preferences: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      const [updated] = await ctx.db
        .update(contacts)
        .set({
          ...data,
          version: sql`${contacts.version} + 1`,
          updated_at: new Date(),
        })
        .where(
          and(eq(contacts.id, id), eq(contacts.tenant_id, ctx.tenantId))
        )
        .returning()

      return updated
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(contacts)
        .set({ archived: true, updated_at: new Date() })
        .where(
          and(eq(contacts.id, input.id), eq(contacts.tenant_id, ctx.tenantId))
        )
      return { success: true }
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const searchTerm = `%${input.query}%`
      return ctx.db
        .select()
        .from(contacts)
        .where(
          and(
            eq(contacts.tenant_id, ctx.tenantId),
            eq(contacts.archived, false),
            or(
              ilike(contacts.first_name, searchTerm),
              ilike(contacts.last_name, searchTerm),
              ilike(contacts.email, searchTerm),
              ilike(contacts.phone, searchTerm),
              ilike(contacts.company, searchTerm)
            )
          )
        )
        .limit(20)
    }),
})
