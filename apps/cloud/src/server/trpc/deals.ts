import { z } from "zod"
import { router, protectedProcedure } from "."
import { deals } from "../db/schema"
import { eq, and, sql } from "drizzle-orm"

const dealStages = [
  "lead",
  "qualified",
  "sourcing",
  "quoted",
  "negotiation",
  "booked",
  "confirmed",
  "completed",
  "lost",
] as const

export const dealsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        contact_id: z.string().uuid().optional(),
        stage: z.enum(dealStages).optional(),
        limit: z.number().int().positive().default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [eq(deals.tenant_id, ctx.tenantId)]

      if (input.contact_id) {
        conditions.push(eq(deals.contact_id, input.contact_id))
      }
      if (input.stage) {
        conditions.push(eq(deals.stage, input.stage))
      }

      return ctx.db
        .select()
        .from(deals)
        .where(and(...conditions))
        .limit(input.limit)
        .offset(input.offset)
    }),

  create: protectedProcedure
    .input(
      z.object({
        contact_id: z.string().uuid(),
        title: z.string().min(1),
        stage: z.enum(dealStages).default("lead"),
        value: z.number().min(0).default(0),
        expected_close: z.string().datetime().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [deal] = await ctx.db
        .insert(deals)
        .values({
          tenant_id: ctx.tenantId,
          contact_id: input.contact_id,
          title: input.title,
          stage: input.stage,
          value: input.value,
          expected_close: input.expected_close ? new Date(input.expected_close) : undefined,
          notes: input.notes,
        })
        .returning()

      return deal
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).optional(),
        stage: z.enum(dealStages).optional(),
        value: z.number().min(0).optional(),
        expected_close: z.string().datetime().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      const updateData: Record<string, unknown> = {
        ...data,
        version: sql`${deals.version} + 1`,
        updated_at: new Date(),
      }
      if (data.expected_close) {
        updateData.expected_close = new Date(data.expected_close)
      }

      const [updated] = await ctx.db
        .update(deals)
        .set(updateData)
        .where(and(eq(deals.id, id), eq(deals.tenant_id, ctx.tenantId)))
        .returning()

      return updated
    }),

  moveStage: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        stage: z.enum(dealStages),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [updated] = await ctx.db
        .update(deals)
        .set({
          stage: input.stage,
          version: sql`${deals.version} + 1`,
          updated_at: new Date(),
        })
        .where(and(eq(deals.id, input.id), eq(deals.tenant_id, ctx.tenantId)))
        .returning()

      return updated
    }),

  getPipeline: protectedProcedure.query(async ({ ctx }) => {
    const allDeals = await ctx.db
      .select()
      .from(deals)
      .where(eq(deals.tenant_id, ctx.tenantId))

    const pipeline: Record<string, typeof allDeals> = {}
    for (const stage of dealStages) {
      pipeline[stage] = allDeals.filter((d) => d.stage === stage)
    }

    return pipeline
  }),

  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    const allDeals = await ctx.db
      .select()
      .from(deals)
      .where(eq(deals.tenant_id, ctx.tenantId))

    const totalValue = allDeals.reduce((sum, d) => sum + d.value, 0)
    const activeDeals = allDeals.filter(
      (d) => d.stage !== "completed" && d.stage !== "lost"
    )
    const wonDeals = allDeals.filter((d) => d.stage === "completed")
    const lostDeals = allDeals.filter((d) => d.stage === "lost")

    return {
      totalDeals: allDeals.length,
      totalValue,
      activeDeals: activeDeals.length,
      activeValue: activeDeals.reduce((sum, d) => sum + d.value, 0),
      wonDeals: wonDeals.length,
      wonValue: wonDeals.reduce((sum, d) => sum + d.value, 0),
      lostDeals: lostDeals.length,
      winRate:
        wonDeals.length + lostDeals.length > 0
          ? wonDeals.length / (wonDeals.length + lostDeals.length)
          : 0,
    }
  }),
})
