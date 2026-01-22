/**
 * Migration: Backfill the collection field from specifications.collection
 * Run once to populate existing items with their collection values
 *
 * Usage in convex console:
 * npx convex run migrations/backfill_collection_field.ts
 */

import { mutation } from '../_generated/server'

export const backfill_collection_field = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query('items').collect()
    let updated = 0

    for (const item of items) {
      const collection = item.specifications?.collection as string | undefined

      if (collection && !item.collection) {
        await ctx.db.patch(item._id, {
          collection,
        })
        updated++
      }
    }

    console.log(`Backfilled ${updated} items with collection field`)
    return { updated }
  },
})
