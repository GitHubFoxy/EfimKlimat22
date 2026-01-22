import { Id } from '../_generated/dataModel'
import { internalMutation } from '../_generated/server'

const RADIATOR_CATEGORY_IDS = [
  'k177mgnb7h9566dnb6cn7nez7d7z2w2g',
  'k17a5eyr9cfak4kyab1ftn495x7z36gf',
  'k17c31nr0bt47qvbkw5jf2b8rs7z2c0s',
  'k17dqs2er7we7fxrcamwx77fa17z3ygm',
  'k17dfctax0zejzyt6npgmmj09s7z3vgw',
] as const

/**
 * REVERT: Convert segments → power for ALL items (undo the mistake)
 */
export const revertSegmentsToPower = internalMutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query('items').collect()

    let reverted = 0

    for (const item of items) {
      const specs = item.specifications as Record<string, any> | undefined
      if (!specs?.segments) continue

      const segments = String(specs.segments)
      const match = segments.match(/^(\d+)\s*секций$/i)
      if (!match) continue

      const power = `${match[1]} кВт`

      const newSpecs = { ...specs }
      delete newSpecs.segments
      newSpecs.power = power

      await ctx.db.patch(item._id, { specifications: newSpecs })
      reverted++
    }

    return { reverted }
  },
})

/**
 * Convert power → segments ONLY for radiator categories
 */
export const convertRadiatorPowerToSegments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const categoryIds = RADIATOR_CATEGORY_IDS.map(
      (id) => id as Id<'categories'>,
    )

    let converted = 0
    let skipped = 0

    for (const categoryId of categoryIds) {
      const items = await ctx.db
        .query('items')
        .withIndex('by_category_no_status', (q) =>
          q.eq('categoryId', categoryId),
        )
        .collect()

      for (const item of items) {
        const specs = item.specifications as Record<string, any> | undefined
        if (!specs?.power) continue

        const power = String(specs.power)
        const match = power.match(/^(\d+)\s*кВт$/i)
        if (!match) {
          skipped++
          continue
        }

        const segments = `${match[1]} секций`

        const newSpecs = { ...specs }
        delete newSpecs.power
        newSpecs.segments = segments

        await ctx.db.patch(item._id, { specifications: newSpecs })
        converted++
      }
    }

    return { converted, skipped }
  },
})
