/**
 * Migration: Ensure existing item slugs are unique and refresh
 * collection-group representative slugs when needed.
 *
 * Usage in convex console:
 * npx convex run migrations/backfill_unique_item_slugs:backfill_unique_item_slugs
 */

import type { Doc } from '../_generated/dataModel'
import { mutation } from '../_generated/server'

function slugifyItemName(name: string) {
  const baseSlug = name
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'e')
    .replace(/\s+/g, '-')
    .replace(/[^a-zа-я0-9-]/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return baseSlug || 'item'
}

export const backfill_unique_item_slugs = mutation({
  args: {},
  handler: async (ctx) => {
    const items = (await ctx.db.query('items').collect()).sort(
      (a, b) => a._creationTime - b._creationTime || a._id.localeCompare(b._id),
    )
    const finalSlugById = new Map<string, string>()
    const usedSlugs = new Set<string>()
    let updatedItems = 0

    for (const item of items) {
      const baseSlug = slugifyItemName(item.name)
      let slug = baseSlug
      let counter = 2

      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`
        counter += 1
      }

      usedSlugs.add(slug)
      finalSlugById.set(item._id.toString(), slug)

      if (item.slug !== slug) {
        await ctx.db.patch(item._id, { slug })
        updatedItems += 1
      }
    }

    const collectionGroups = (await ctx.db
      .query('collectionGroups')
      .collect()) as Doc<'collectionGroups'>[]
    let updatedGroups = 0

    for (const group of collectionGroups) {
      const representativeSlug = finalSlugById.get(
        group.representativeItemId.toString(),
      )

      if (
        !representativeSlug ||
        group.representativeSlug === representativeSlug
      ) {
        continue
      }

      await ctx.db.patch(group._id, { representativeSlug })
      updatedGroups += 1
    }

    console.log(
      `Updated ${updatedItems} item slugs and ${updatedGroups} collection groups`,
    )

    return { updatedItems, updatedGroups }
  },
})
