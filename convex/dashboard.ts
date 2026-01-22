import { v } from 'convex/values'
import { Id } from './_generated/dataModel'
import { query } from './_generated/server'

// Get single item by ID with all details
export const show_item = query({
  args: {
    id: v.id('items'),
  },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id)
    if (!item) return null

    // Fetch brand details
    let brandName = 'Неизвестно'
    if (item.brandId) {
      const brand = await ctx.db.get(item.brandId)
      if (brand && 'name' in brand) {
        brandName = brand.name as string
      }
    }

    return {
      ...item,
      brandName,
    }
  },
})

// Get items by brand and category (related items for product page)
export const show_items_by_brand_and_collection = query({
  args: {
    itemId: v.id('items'),
    brandId: v.id('brands'),
    categoryId: v.id('categories'),
  },
  handler: async (ctx, { itemId, brandId, categoryId }) => {
    // Get items from same brand and category, excluding the current item
    const relatedItems = await ctx.db
      .query('items')
      .filter((q) =>
        q.and(
          q.eq(q.field('brandId'), brandId),
          q.eq(q.field('categoryId'), categoryId),
          q.eq(q.field('status'), 'active'),
          q.eq(q.field('inStock'), true),
          q.neq(q.field('_id'), itemId),
        ),
      )
      .take(8)

    return relatedItems
  },
})

// Get all active brands for filtering
export const show_all_brands = query({
  args: {},
  handler: async (ctx) => {
    const brands = await ctx.db
      .query('brands')
      .filter((q) => q.eq(q.field('status'), 'active'))
      .order('asc')
      .collect()

    return brands
  },
})

// Get subcategories by parent category
export const show_subcategories_by_category = query({
  args: {
    parent: v.id('categories'),
  },
  handler: async (ctx, { parent }) => {
    const subcategories = await ctx.db
      .query('categories')
      .withIndex('by_parent_order', (q) => q.eq('parentId', parent))
      .filter((q) => q.eq(q.field('isVisible'), true))
      .collect()

    return {
      subcategories,
    }
  },
})
