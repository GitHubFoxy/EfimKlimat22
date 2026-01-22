import { mutation } from './_generated/server'
import { requireRole } from './authHelpers'

export const clearItems = mutation(async (ctx) => {
  await requireRole(ctx, ['admin'])
  const items = await ctx.db.query('items').collect()
  for (const item of items) {
    await ctx.db.delete(item._id)
  }
  return { deleted: items.length }
})
