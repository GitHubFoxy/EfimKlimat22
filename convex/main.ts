import { v } from 'convex/values'
import { query } from './_generated/server'
import { validateLimit, validateSearchQuery } from './validation'

export const search_items = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, { query }) => {
    validateSearchQuery(query)

    if (!query.trim()) {
      return []
    }

    const results = await ctx.db
      .query('items')
      .withSearchIndex('search_main', (q) =>
        q
          .search('searchText', query)
          .eq('status', 'active')
          .eq('inStock', true),
      )
      .take(10)

    // Fetch brand names for each item
    const resultsWithBrands = await Promise.all(
      results.map(async (item) => {
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
      }),
    )

    return resultsWithBrands
  },
})

export const main_page_by_filter = query({
  args: {
    filter: v.union(
      v.literal('Хиты продаж'),
      v.literal('Новинки'),
      v.literal('Скидки'),
    ),
  },
  handler: async (ctx, { filter }) => {
    let items

    // Apply filter-specific queries
    if (filter === 'Хиты продаж') {
      // Use orders count index for popular items
      items = await ctx.db
        .query('items')
        .withIndex('by_orders', (q) => q.eq('status', 'active'))
        .filter((q) => q.eq(q.field('inStock'), true))
        .order('desc')
        .take(4)
    } else if (filter === 'Скидки') {
      // Filter for items with discount
      items = await ctx.db
        .query('items')
        .withIndex('by_status', (q) => q.eq('status', 'active'))
        .filter((q) => q.eq(q.field('inStock'), true))
        .filter((q) => q.gt(q.field('discountAmount'), 0))
        .order('desc')
        .take(4)
    } else {
      // "Новинки" - newest items by _creationTime
      items = await ctx.db
        .query('items')
        .withIndex('by_status', (q) => q.eq('status', 'active'))
        .filter((q) => q.eq(q.field('inStock'), true))
        .order('desc')
        .take(4)
    }

    // For "Хиты продаж", sort by ordersCount (already indexed)
    if (filter === 'Хиты продаж') {
      // The by_orders index sorts by ordersCount descending when we order("desc")
      // No need to re-sort
    }

    // Fetch brand names for each item
    const itemsWithBrands = await Promise.all(
      items.map(async (item) => {
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
      }),
    )

    return {
      items: itemsWithBrands,
      filter,
      count: itemsWithBrands.length,
    }
  },
})

export const top_items_by_orders = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 3 }) => {
    validateLimit(limit, 50)

    // Get top items by orders count
    const items = await ctx.db
      .query('items')
      .withIndex('by_orders', (q) => q.eq('status', 'active'))
      .filter((q) => q.eq(q.field('inStock'), true))
      .order('desc')
      .take(limit)

    // Fetch brand names for each item
    const itemsWithBrands = await Promise.all(
      items.map(async (item) => {
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
      }),
    )

    return itemsWithBrands
  },
})
