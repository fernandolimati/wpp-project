import { z } from "zod"
import { router, protectedProcedure } from "."
import { quotes } from "../db/schema"
import { eq, and } from "drizzle-orm"

export const quotesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        deal_id: z.string().uuid().optional(),
        limit: z.number().int().positive().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [eq(quotes.tenant_id, ctx.tenantId)]
      if (input.deal_id) {
        conditions.push(eq(quotes.deal_id, input.deal_id))
      }

      return ctx.db
        .select()
        .from(quotes)
        .where(and(...conditions))
        .limit(input.limit)
    }),

  create: protectedProcedure
    .input(
      z.object({
        deal_id: z.string().uuid(),
        legs: z.array(
          z.object({
            from: z.string(),
            to: z.string(),
            date: z.string(),
            passengers: z.number().int().positive(),
          })
        ),
        line_items: z.array(
          z.object({
            description: z.string(),
            type: z.enum(["charter_fee", "landing_fee", "handling", "catering", "other"]),
            amount: z.number().min(0),
          })
        ),
        tax_amount: z.number().min(0),
        subtotal: z.number().min(0),
        total: z.number().min(0),
        valid_until: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [quote] = await ctx.db
        .insert(quotes)
        .values({
          tenant_id: ctx.tenantId,
          deal_id: input.deal_id,
          legs: input.legs,
          line_items: input.line_items,
          tax_amount: input.tax_amount,
          subtotal: input.subtotal,
          total: input.total,
          valid_until: input.valid_until ? new Date(input.valid_until) : undefined,
        })
        .returning()

      return quote
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(quotes)
        .where(
          and(eq(quotes.id, input.id), eq(quotes.tenant_id, ctx.tenantId))
        )
        .limit(1)

      return result[0] ?? null
    }),
})
