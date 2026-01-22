import { query } from './_generated/server'
import { requireRole } from './authHelpers'

export const getAllItems = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    return await ctx.db.query('items').collect()
  },
})
