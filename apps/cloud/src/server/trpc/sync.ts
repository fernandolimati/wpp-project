import { z } from "zod"
import { router, protectedProcedure } from "."
import { contacts, deals, activities } from "../db/schema"
import { eq, and, gt, sql } from "drizzle-orm"

export const syncRouter = router({
  push: protectedProcedure
    .input(
      z.object({
        operation: z.enum(["create", "update", "delete"]),
        table: z.string(),
        recordId: z.string(),
        version: z.number().int(),
        payload: z.record(z.unknown()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { operation, table, recordId, version, payload } = input

      if (table === "contacts") {
        if (operation === "create") {
          await ctx.db.insert(contacts).values({
            id: recordId,
            tenant_id: ctx.tenantId,
            first_name: payload.first_name as string,
            last_name: payload.last_name as string | undefined,
            email: payload.email as string | undefined,
            phone: payload.phone as string | undefined,
            company: payload.company as string | undefined,
            lead_score: (payload.lead_score as number) || 0,
            preferences: payload.preferences || null,
            whatsapp_jid: payload.whatsapp_jid as string | undefined,
            source: (payload.source as string) || "manual",
            version: 1,
          })
          return { success: true, conflict: false }
        }

        if (operation === "update") {
          const result = await ctx.db
            .update(contacts)
            .set({
              ...payload,
              version: sql`${contacts.version} + 1`,
              updated_at: new Date(),
            } as Record<string, unknown>)
            .where(
              and(
                eq(contacts.id, recordId),
                eq(contacts.tenant_id, ctx.tenantId),
                eq(contacts.version, version)
              )
            )
            .returning()

          if (result.length === 0) {
            return { success: false, conflict: true }
          }
          return { success: true, conflict: false }
        }

        if (operation === "delete") {
          await ctx.db
            .update(contacts)
            .set({ archived: true, updated_at: new Date() })
            .where(
              and(eq(contacts.id, recordId), eq(contacts.tenant_id, ctx.tenantId))
            )
          return { success: true, conflict: false }
        }
      }

      if (table === "deals") {
        if (operation === "create") {
          await ctx.db.insert(deals).values({
            id: recordId,
            tenant_id: ctx.tenantId,
            contact_id: payload.contact_id as string,
            title: payload.title as string,
            stage: (payload.stage as string) || "lead",
            value: (payload.value as number) || 0,
            notes: payload.notes as string | undefined,
            version: 1,
          })
          return { success: true, conflict: false }
        }

        if (operation === "update") {
          const result = await ctx.db
            .update(deals)
            .set({
              ...payload,
              version: sql`${deals.version} + 1`,
              updated_at: new Date(),
            } as Record<string, unknown>)
            .where(
              and(
                eq(deals.id, recordId),
                eq(deals.tenant_id, ctx.tenantId),
                eq(deals.version, version)
              )
            )
            .returning()

          if (result.length === 0) {
            return { success: false, conflict: true }
          }
          return { success: true, conflict: false }
        }
      }

      return { success: false, conflict: false, error: "Unknown table" }
    }),

  pullChanges: protectedProcedure
    .input(
      z.object({
        since: z.string().datetime().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const sinceDate = input.since ? new Date(input.since) : new Date(0)

      const updatedContacts = await ctx.db
        .select()
        .from(contacts)
        .where(
          and(
            eq(contacts.tenant_id, ctx.tenantId),
            gt(contacts.updated_at, sinceDate)
          )
        )

      const updatedDeals = await ctx.db
        .select()
        .from(deals)
        .where(
          and(eq(deals.tenant_id, ctx.tenantId), gt(deals.updated_at, sinceDate))
        )

      const updatedActivities = await ctx.db
        .select()
        .from(activities)
        .where(
          and(
            eq(activities.tenant_id, ctx.tenantId),
            gt(activities.updated_at, sinceDate)
          )
        )

      return {
        contacts: updatedContacts,
        deals: updatedDeals,
        activities: updatedActivities,
        syncedAt: new Date().toISOString(),
      }
    }),

  getLastSync: protectedProcedure.query(async () => {
    return { lastSync: new Date().toISOString() }
  }),
})
