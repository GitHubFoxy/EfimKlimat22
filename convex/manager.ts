import { paginationOptsValidator } from 'convex/server'
import { ConvexError, v } from 'convex/values'
import { api } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import { requirePermanentPassword, requireRole } from './authHelpers'
import {
  deleteCollectionGroupIfEmpty,
  upsertCollectionGroup,
} from './collection_groups_manager'
import {
  validateCollection,
  validateDescription,
  validateName,
  validatePageNumber,
  validatePageSize,
  validatePrice,
  validateQuantity,
  validateSearchQuery,
  validateSku,
} from './validation'

// List orders for managers by status, newest first by updatedAt/_creationTime
export const list_orders_by_status = query({
  args: {
    status: v.union(
      v.literal('new'),
      v.literal('confirmed'),
      v.literal('processing'),
      v.literal('shipping'),
      v.literal('done'),
      v.literal('canceled'),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { status, paginationOpts }) => {
    await requireRole(ctx, ['manager', 'admin'])
    return await ctx.db
      .query('orders')
      .withIndex('by_status_date', (q) => q.eq('status', status))
      .order('desc')
      .paginate(paginationOpts)
  },
})

// Update order status (manager/admin)
export const update_order_status = mutation({
  args: {
    orderId: v.id('orders'),
    status: v.union(
      v.literal('new'),
      v.literal('confirmed'),
      v.literal('processing'),
      v.literal('shipping'),
      v.literal('done'),
      v.literal('canceled'),
    ),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { orderId, status }) => {
    await requireRole(ctx, ['manager', 'admin'])
    const existing = await ctx.db.get(orderId)
    if (!existing) throw new Error('Order not found')
    await ctx.db.patch(orderId, { status, updatedAt: Date.now() })
    return { status: 200 }
  },
})

// List only orders assigned to a specific manager by status
export const list_my_orders_by_status = query({
  args: {
    status: v.union(
      v.literal('new'),
      v.literal('confirmed'),
      v.literal('processing'),
      v.literal('shipping'),
      v.literal('done'),
      v.literal('canceled'),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { status, paginationOpts }) => {
    const user = await requireRole(ctx, ['manager', 'admin'])
    const managerId = user._id
    return await ctx.db
      .query('orders')
      .withIndex('by_manager', (q) => q.eq('managerId', managerId))
      .order('desc')
      .paginate(paginationOpts)
  },
})

// Claim an order to a manager (set managerId)
export const claim_order = mutation({
  args: {
    orderId: v.id('orders'),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { orderId }) => {
    const user = await requireRole(ctx, ['manager', 'admin'])
    const managerId = user._id
    const existing = await ctx.db.get(orderId)
    if (!existing) throw new Error('Order not found')
    await ctx.db.patch(orderId, {
      managerId,
      updatedAt: Date.now(),
    })
    return { status: 200 }
  },
})

// Unclaim an order (remove managerId)
export const unclaim_order = mutation({
  args: {
    orderId: v.id('orders'),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { orderId }) => {
    await requireRole(ctx, ['manager', 'admin'])
    const existing = await ctx.db.get(orderId)
    if (!existing) throw new Error('Order not found')
    // Remove managerId by replacing document without the field
    const { managerId, _id, _creationTime, ...rest } = existing as any
    await ctx.db.replace(orderId, { ...rest, updatedAt: Date.now() })
    return { status: 200 }
  },
})

// UTILITY: Get all descendant category IDs (for hierarchical filtering)
async function getDescendantCategoryIds(
  ctx: any,
  rootId: Id<'categories'>,
): Promise<Id<'categories'>[]> {
  const allCategories = await ctx.db.query('categories').collect()

  const descendants = new Set<Id<'categories'>>([rootId])
  let changed = true

  while (changed) {
    changed = false
    for (const cat of allCategories) {
      if (
        cat.parentId &&
        descendants.has(cat.parentId) &&
        !descendants.has(cat._id)
      ) {
        descendants.add(cat._id)
        changed = true
      }
    }
  }

  return Array.from(descendants)
}

// List all items for inventory management
export const list_items = query({
  args: {
    paginationOpts: paginationOptsValidator,
    sortBy: v.optional(
      v.union(
        v.literal('name'),
        v.literal('price'),
        v.literal('quantity'),
        v.literal('ordersCount'),
        v.literal('createdAt'),
      ),
    ),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
    // Filter arguments
    brandId: v.optional(v.id('brands')),
    categoryId: v.optional(v.id('categories')),
    status: v.optional(
      v.union(v.literal('active'), v.literal('draft'), v.literal('preorder')),
    ),
  },
  handler: async (
    ctx,
    {
      paginationOpts,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      brandId,
      categoryId,
      status,
    },
  ) => {
    await requireRole(ctx, ['manager', 'admin'])
    let itemsQuery
    const hasCategoryFilter = Boolean(categoryId)

    if (hasCategoryFilter) {
      const categoryIds = await getDescendantCategoryIds(
        ctx,
        categoryId as Id<'categories'>,
      )
      const items = await ctx.db
        .query('items')
        .filter((q) => {
          const conditions = [q.neq(q.field('status'), 'archived')]
          const categoryConditions = categoryIds.map((catId) =>
            q.eq(q.field('categoryId'), catId),
          )

          if (categoryConditions.length === 1) {
            conditions.push(categoryConditions[0])
          } else if (categoryConditions.length > 1) {
            conditions.push(q.or(...categoryConditions))
          }

          if (brandId) {
            conditions.push(q.eq(q.field('brandId'), brandId))
          }

          if (status) {
            conditions.push(q.eq(q.field('status'), status))
          }

          return q.and(...conditions)
        })
        .order(sortOrder === 'asc' ? 'asc' : 'desc')
        .paginate(paginationOpts)

      itemsQuery = items
    } else {
      // Choose index based on filters - prioritize composite indexes for better performance
      if (brandId && status) {
        itemsQuery = ctx.db
          .query('items')
          .withIndex('by_brand_status', (q) =>
            q.eq('status', status).eq('brandId', brandId),
          )
      } else if (brandId) {
        itemsQuery = ctx.db
          .query('items')
          .withIndex('by_brand_no_status', (q) => q.eq('brandId', brandId))
          .filter((q) => q.neq(q.field('status'), 'archived'))
      } else if (status) {
        itemsQuery = ctx.db
          .query('items')
          .withIndex('by_status', (q) => q.eq('status', status))
      } else {
        itemsQuery = ctx.db
          .query('items')
          .filter((q) => q.neq(q.field('status'), 'archived'))
      }
    }

    const items =
      'page' in itemsQuery
        ? itemsQuery
        : await (sortOrder === 'asc'
            ? itemsQuery.order('asc')
            : itemsQuery.order('desc')
          ).paginate(paginationOpts)

    // Enrich with brand and category names
    const itemsWithDetails = await Promise.all(
      items.page.map(async (item: any) => {
        const [brand, category] = await Promise.all([
          ctx.db.get(item.brandId),
          ctx.db.get(item.categoryId),
        ])
        return {
          ...item,
          brandName: (brand as any)?.name || 'Неизвестно',
          categoryName: (category as any)?.name || 'Без категории',
        }
      }),
    )

    let page = itemsWithDetails
    if (sortBy !== 'createdAt') {
      page = [...itemsWithDetails].sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        if (aVal === bVal) return 0
        const comparison = aVal < bVal ? -1 : 1
        return sortOrder === 'asc' ? comparison : -comparison
      })
    }

    return {
      ...items,
      page,
    }
  },
})

// Get item with brand details
export const get_item_with_brand = query({
  args: {
    itemId: v.id('items'),
  },
  handler: async (ctx, { itemId }) => {
    await requireRole(ctx, ['manager', 'admin'])
    const item = await ctx.db.get(itemId)
    if (!item) throw new Error('Item not found')

    const brand = await ctx.db.get((item as any).brandId as any)
    if (!brand) throw new Error('Brand not found')

    return {
      _id: item._id,
      name: (item as any).name,
      sku: (item as any).sku,
      price: (item as any).price,
      quantity: (item as any).quantity,
      status: (item as any).status,
      inStock: (item as any).inStock,
      brand: {
        _id: brand._id,
        name: (brand as any).name,
      },
    }
  },
})

// List leads with pagination
export const list_leads = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    await requireRole(ctx, ['manager', 'admin'])
    const leads = await ctx.db
      .query('leads')
      .order('desc')
      .paginate(paginationOpts)

    return leads
  },
})

// Search items for inventory management
export const search_items = query({
  args: {
    query: v.string(),
    paginationOpts: paginationOptsValidator,
    sortBy: v.optional(
      v.union(
        v.literal('name'),
        v.literal('price'),
        v.literal('quantity'),
        v.literal('ordersCount'),
        v.literal('createdAt'),
      ),
    ),
    sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
    brandId: v.optional(v.id('brands')),
    categoryId: v.optional(v.id('categories')),
    status: v.optional(
      v.union(v.literal('active'), v.literal('draft'), v.literal('preorder')),
    ),
  },
  handler: async (
    ctx,
    {
      query,
      paginationOpts,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      brandId,
      categoryId,
      status,
    },
  ) => {
    await requireRole(ctx, ['manager', 'admin'])
    const normalizedQuery = query.trim().toLowerCase()
    const categoryIds = categoryId
      ? await getDescendantCategoryIds(ctx, categoryId as Id<'categories'>)
      : undefined

    const searchResults = await ctx.db
      .query('items')
      .withSearchIndex('search_main', (q) =>
        q.search('searchText', normalizedQuery),
      )
      .collect()

    const filteredResults = searchResults.filter((item) => {
      if (status) {
        if (item.status !== status) return false
      } else if (item.status === 'archived') {
        return false
      }

      if (brandId && item.brandId !== brandId) return false

      if (categoryIds && categoryIds.length > 0) {
        if (!item.categoryId) return false
        if (!categoryIds.includes(item.categoryId as Id<'categories'>)) {
          return false
        }
      }

      return true
    })

    let sortedResults = filteredResults
    if (sortBy !== 'createdAt') {
      sortedResults = [...filteredResults].sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        if (aVal === bVal) return 0
        const comparison = aVal < bVal ? -1 : 1
        return sortOrder === 'asc' ? comparison : -comparison
      })
    }

    const startIndex = paginationOpts.cursor ? Number(paginationOpts.cursor) : 0
    const endIndex = startIndex + paginationOpts.numItems
    const pagedResults = sortedResults.slice(startIndex, endIndex)

    const itemsWithDetails = await Promise.all(
      pagedResults.map(async (item) => {
        const [brand, category] = await Promise.all([
          item.brandId ? ctx.db.get(item.brandId) : null,
          item.categoryId ? ctx.db.get(item.categoryId) : null,
        ])
        return {
          ...item,
          brandName: (brand as any)?.name || 'Неизвестно',
          categoryName: (category as any)?.name || 'Без категории',
        }
      }),
    )

    return {
      page: itemsWithDetails,
      isDone: endIndex >= sortedResults.length,
      continueCursor:
        endIndex >= sortedResults.length ? null : String(endIndex),
    }
  },
})

// List leads by status with pagination
export const list_leads_by_status = query({
  args: {
    status: v.union(
      v.literal('new'),
      v.literal('processing'),
      v.literal('success'),
      v.literal('failed'),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { status, paginationOpts }) => {
    await requireRole(ctx, ['manager', 'admin'])
    return await ctx.db
      .query('leads')
      .withIndex('by_status_date', (q) => q.eq('status', status))
      .order('desc')
      .paginate(paginationOpts)
  },
})

// List orders with pagination
export const list_orders = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    await requireRole(ctx, ['manager', 'admin'])
    const orders = await ctx.db
      .query('orders')
      .order('desc')
      .paginate(paginationOpts)

    return orders
  },
})

// Global search across all tables
export const global_search = query({
  args: {
    searchText: v.string(),
    paginationOpts: v.object({
      pageNum: v.number(),
      pageSize: v.number(),
    }),
  },
  handler: async (ctx, { searchText, paginationOpts }) => {
    await requireRole(ctx, ['manager', 'admin'])

    // Input validation
    validateSearchQuery(searchText)
    validatePageNumber(paginationOpts.pageNum)
    validatePageSize(paginationOpts.pageSize)

    const query = searchText.trim().toLowerCase()
    if (!query) {
      return { page: [], isDone: true, continueCursor: null }
    }

    const results: Array<{
      type: 'item' | 'order' | 'lead' | 'category'
      data: any
      relevance: number
    }> = []

    // Search items using full-text search
    try {
      const itemsResult = await ctx.db
        .query('items')
        .withSearchIndex('search_main', (q) => q.search('searchText', query))
        .collect()

      itemsResult.forEach((item) => {
        results.push({
          type: 'item',
          data: item,
          relevance: 1.0, // Full-text search already ranks by relevance
        })
      })
    } catch (e) {
      // Search index might not be ready, continue with other searches
    }

    // Search categories by name
    try {
      const categoriesResult = await ctx.db
        .query('categories')
        .withSearchIndex('search_name', (q) => q.search('name', query))
        .collect()

      categoriesResult.forEach((category) => {
        results.push({
          type: 'category',
          data: category,
          relevance: 0.9,
        })
      })
    } catch (e) {
      // Continue
    }

    // Search orders by client info (manual filtering since no search index)
    const allOrders = await ctx.db.query('orders').collect()
    allOrders.forEach((order) => {
      const searchText =
        `${order.clientName} ${order.clientPhone} ${order.clientEmail || ''} ${order.publicNumber}`.toLowerCase()
      if (searchText.includes(query)) {
        results.push({
          type: 'order',
          data: order,
          relevance: 0.7,
        })
      }
    })

    // Search leads by name/phone/email (manual filtering)
    const allLeads = await ctx.db.query('leads').collect()
    allLeads.forEach((lead) => {
      const searchText =
        `${lead.name} ${lead.phone} ${lead.email || ''}`.toLowerCase()
      if (searchText.includes(query)) {
        results.push({
          type: 'lead',
          data: lead,
          relevance: 0.7,
        })
      }
    })

    // Sort by relevance and apply pagination
    results.sort((a, b) => b.relevance - a.relevance)

    const start = (paginationOpts.pageNum - 1) * paginationOpts.pageSize
    const end = start + paginationOpts.pageSize
    const paginatedResults = results.slice(start, end)
    const isDone = end >= results.length

    // Format results for return
    const formattedResults = paginatedResults.map((result) => ({
      type: result.type,
      item: result.data,
      relevance: result.relevance,
    }))

    return {
      page: formattedResults,
      isDone: isDone,
      continueCursor: isDone ? null : start + paginationOpts.pageSize,
    }
  },
})

// Type-specific search for filtered results
export const search_by_type = query({
  args: {
    searchText: v.string(),
    type: v.union(
      v.literal('item'),
      v.literal('order'),
      v.literal('lead'),
      v.literal('category'),
    ),
    paginationOpts: v.object({
      pageNum: v.number(),
      pageSize: v.number(),
    }),
  },
  handler: async (ctx, { searchText, type, paginationOpts }) => {
    await requireRole(ctx, ['manager', 'admin'])

    // Input validation
    validateSearchQuery(searchText)
    validatePageNumber(paginationOpts.pageNum)
    validatePageSize(paginationOpts.pageSize)

    const query = searchText.trim().toLowerCase()
    if (!query) {
      return { page: [], isDone: true, continueCursor: null }
    }

    let results: any[] = []

    if (type === 'item') {
      try {
        results = await ctx.db
          .query('items')
          .withSearchIndex('search_main', (q) => q.search('searchText', query))
          .collect()
      } catch (e) {
        results = []
      }
    } else if (type === 'category') {
      try {
        results = await ctx.db
          .query('categories')
          .withSearchIndex('search_name', (q) => q.search('name', query))
          .collect()
      } catch (e) {
        results = []
      }
    } else if (type === 'order') {
      const allOrders = await ctx.db.query('orders').collect()
      results = allOrders.filter((order) => {
        const searchText =
          `${order.clientName} ${order.clientPhone} ${order.clientEmail || ''} ${order.publicNumber}`.toLowerCase()
        return searchText.includes(query)
      })
    } else if (type === 'lead') {
      const allLeads = await ctx.db.query('leads').collect()
      results = allLeads.filter((lead) => {
        const searchText =
          `${lead.name} ${lead.phone} ${lead.email || ''}`.toLowerCase()
        return searchText.includes(query)
      })
    }

    // Apply pagination
    const start = (paginationOpts.pageNum - 1) * paginationOpts.pageSize
    const end = start + paginationOpts.pageSize
    const paginatedResults = results.slice(start, end)
    const isDone = end >= results.length

    return {
      page: paginatedResults,
      isDone: isDone,
      continueCursor: isDone ? null : start + paginationOpts.pageSize,
    }
  },
})

export const create_item = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    description: v.string(),
    brandId: v.id('brands'),
    categoryId: v.id('categories'),
    price: v.number(),
    quantity: v.number(),
    status: v.union(
      v.literal('active'),
      v.literal('draft'),
      v.literal('archived'),
      v.literal('preorder'),
    ),
    inStock: v.boolean(),
    specifications: v.optional(
      v.record(v.string(), v.union(v.string(), v.number(), v.boolean())),
    ),
    collection: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['manager', 'admin'])

    // Input validation
    validateName(args.name)
    validateSku(args.sku)
    validateDescription(args.description)
    validatePrice(args.price)
    validateQuantity(args.quantity)
    validateCollection(args.collection)

    const slug = args.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')

    // Extract collection from specifications if not provided
    const collection =
      args.collection || (args.specifications?.collection as string | undefined)

    const itemId = await ctx.db.insert('items', {
      ...args,
      slug,
      collection,
      ordersCount: 0,
      searchText: `${args.name} ${args.sku}`.toLowerCase(),
    })

    // Update collection group after item is created
    const newItem = await ctx.db.get(itemId)
    if (newItem) {
      await upsertCollectionGroup(ctx, newItem)
    }

    return itemId
  },
})

export const update_item = mutation({
  args: {
    id: v.id('items'),
    name: v.optional(v.string()),
    sku: v.optional(v.string()),
    description: v.optional(v.string()),
    brandId: v.optional(v.id('brands')),
    categoryId: v.optional(v.id('categories')),
    price: v.optional(v.number()),
    quantity: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal('active'),
        v.literal('draft'),
        v.literal('archived'),
        v.literal('preorder'),
      ),
    ),
    inStock: v.optional(v.boolean()),
    specifications: v.optional(
      v.record(v.string(), v.union(v.string(), v.number(), v.boolean())),
    ),
    collection: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...args }) => {
    await requireRole(ctx, ['manager', 'admin'])

    // Input validation
    if (args.name !== undefined) validateName(args.name)
    if (args.sku !== undefined) validateSku(args.sku)
    if (args.description !== undefined) validateDescription(args.description)
    if (args.price !== undefined) validatePrice(args.price)
    if (args.quantity !== undefined) validateQuantity(args.quantity)
    validateCollection(args.collection)

    const existing = await ctx.db.get(id)
    if (!existing) throw new Error('Item not found')

    const patch: any = { ...args }
    if (args.name) {
      patch.slug = args.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
    }

    if (args.name || args.sku) {
      const name = args.name ?? existing.name
      const sku = args.sku ?? existing.sku
      patch.searchText = `${name} ${sku}`.toLowerCase()
    }

    // Handle collection: extract from specifications if present, or use provided value
    if (args.specifications) {
      const collection =
        args.collection ||
        (args.specifications.collection as string | undefined)
      if (collection) {
        patch.collection = collection
      }
    } else if (args.collection !== undefined) {
      patch.collection = args.collection
    }

    await ctx.db.patch(id, patch)

    // Update collection group after item is updated
    const updatedItem = await ctx.db.get(id)
    if (updatedItem) {
      await upsertCollectionGroup(ctx, updatedItem)
    }

    return id
  },
})

export const delete_item = mutation({
  args: { id: v.id('items') },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ['manager', 'admin'])
    const existing = await ctx.db.get(id)
    if (!existing) throw new Error('Item not found')

    await ctx.db.patch(id, { status: 'archived' })

    // Clean up collection group if no active items remain
    await deleteCollectionGroupIfEmpty(ctx, existing)
  },
})

export const delete_order = mutation({
  args: { id: v.id('orders') },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ['manager', 'admin'])
    const existing = await ctx.db.get(id)
    if (!existing) throw new Error('Order not found')

    // Hard delete the order
    await ctx.db.delete(id)
  },
})

export const list_brands_all = query({
  handler: async (ctx) => {
    return await ctx.db.query('brands').collect()
  },
})

export const list_categories_all = query({
  handler: async (ctx) => {
    return await ctx.db.query('categories').collect()
  },
})

export const list_categories_hierarchy = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query('categories').collect()

    const parents = categories.filter((c) => !c.parentId)
    const childrenMap = new Map<string, typeof categories>()

    categories.forEach((cat) => {
      if (cat.parentId) {
        const parentId = cat.parentId.toString()
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, [])
        }
        childrenMap.get(parentId)!.push(cat)
      }
    })

    return {
      parents,
      childrenMap: Object.fromEntries(childrenMap),
    }
  },
})
