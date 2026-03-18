import { paginationOptsValidator } from 'convex/server'
import { ConvexError, v } from 'convex/values'
import { api } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'
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

const specificationValueValidator = v.union(v.string(), v.number(), v.boolean())
const specificationsValidator = v.record(
  v.string(),
  specificationValueValidator,
)
const documentsValidator = v.array(
  v.object({
    name: v.string(),
    url: v.string(),
  }),
)

type SpecificationValue = string | number | boolean
type SpecificationsInput = Record<string, SpecificationValue> | null | undefined
type DocumentsInput = Array<{ name: string; url: string }> | null | undefined

function normalizeOptionalString(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined || value === null) {
    return value
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeLabels(
  labels: string[] | null | undefined,
): string[] | null | undefined {
  if (labels === undefined || labels === null) {
    return labels
  }

  const next = labels.map((label) => label.trim()).filter(Boolean)
  return next.length > 0 ? next : null
}

function normalizeDocuments(
  documents: DocumentsInput,
): Array<{ name: string; url: string }> | null | undefined {
  if (documents === undefined || documents === null) {
    return documents
  }

  const next = documents
    .map((document) => ({
      name: document.name.trim(),
      url: document.url.trim(),
    }))
    .filter((document) => document.name.length > 0 && document.url.length > 0)

  return next.length > 0 ? next : null
}

function normalizeSpecifications(
  specifications: SpecificationsInput,
): Record<string, SpecificationValue> | null | undefined {
  if (specifications === undefined || specifications === null) {
    return specifications
  }

  const normalized: Record<string, SpecificationValue> = {}

  for (const [key, value] of Object.entries(specifications)) {
    const normalizedKey = key.trim()
    if (
      normalizedKey.length === 0 ||
      normalizedKey.toLowerCase() === 'collection'
    ) {
      continue
    }

    if (typeof value === 'string') {
      const normalizedValue = value.trim()
      if (normalizedValue.length === 0) {
        continue
      }
      normalized[normalizedKey] = normalizedValue
      continue
    }

    normalized[normalizedKey] = value
  }

  return Object.keys(normalized).length > 0 ? normalized : null
}

async function resolveImageUrls(
  ctx: {
    storage: { getUrl: (storageId: Id<'_storage'>) => Promise<string | null> }
  },
  imageStorageIds: Id<'_storage'>[],
) {
  const urls = await Promise.all(
    imageStorageIds.map((storageId) => ctx.storage.getUrl(storageId)),
  )

  return urls.filter((url): url is string => typeof url === 'string')
}

function normalizeCategoryOrder(order: number) {
  const normalizedOrder = Math.trunc(order)
  if (!Number.isFinite(normalizedOrder) || normalizedOrder < 0) {
    throw new Error('Порядок должен быть неотрицательным числом')
  }

  return normalizedOrder
}

function slugifyCategoryName(name: string) {
  const baseSlug = name
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'e')
    .replace(/\s+/g, '-')
    .replace(/[^a-zа-я0-9-]/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return baseSlug || 'category'
}

function slugifyBrandName(name: string) {
  const baseSlug = name
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'e')
    .replace(/\s+/g, '-')
    .replace(/[^a-zа-я0-9-]/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return baseSlug || 'brand'
}

async function buildUniqueCategorySlug(
  ctx: any,
  name: string,
  excludeId?: Id<'categories'>,
) {
  const baseSlug = slugifyCategoryName(name)
  let slug = baseSlug
  let counter = 2

  while (true) {
    const existing = await ctx.db
      .query('categories')
      .withIndex('by_slug', (q: any) => q.eq('slug', slug))
      .collect()

    const hasConflict = existing.some(
      (category: Doc<'categories'>) => category._id !== excludeId,
    )

    if (!hasConflict) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter += 1
  }
}

async function buildUniqueBrandSlug(
  ctx: any,
  name: string,
  excludeId?: Id<'brands'>,
) {
  const baseSlug = slugifyBrandName(name)
  let slug = baseSlug
  let counter = 2

  while (true) {
    const existing = await ctx.db
      .query('brands')
      .withIndex('by_slug', (q: any) => q.eq('slug', slug))
      .collect()

    const hasConflict = existing.some(
      (brand: Doc<'brands'>) => brand._id !== excludeId,
    )

    if (!hasConflict) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter += 1
  }
}

async function resolveCategoryParent(
  ctx: any,
  parentId?: Id<'categories'> | null,
) {
  if (!parentId) {
    return null
  }

  const parent = (await ctx.db.get(parentId)) as Doc<'categories'> | null
  if (!parent) {
    throw new Error('Родительская категория не найдена')
  }

  if (parent.parentId) {
    throw new Error(
      'Подкатегории можно создавать только внутри верхней категории',
    )
  }

  return parent
}

function sortCategoriesForOrder(a: Doc<'categories'>, b: Doc<'categories'>) {
  const orderDiff = a.order - b.order
  if (orderDiff !== 0) {
    return orderDiff
  }

  const nameDiff = a.name.localeCompare(b.name, 'ru')
  if (nameDiff !== 0) {
    return nameDiff
  }

  return a._creationTime - b._creationTime
}

function getCategoryInsertIndex(order: number, siblingCount: number) {
  return Math.max(0, Math.min(Math.trunc(order) - 1, siblingCount))
}

async function listCategorySiblings(ctx: any, parentId?: Id<'categories'>) {
  const categories = (await ctx.db
    .query('categories')
    .collect()) as Doc<'categories'>[]

  return categories
    .filter((category) => category.parentId === parentId)
    .sort(sortCategoriesForOrder)
}

async function assignSequentialCategoryOrders(
  ctx: any,
  categories: Doc<'categories'>[],
) {
  await Promise.all(
    categories.map((category, index) => {
      const nextOrder = index + 1

      if (category.order === nextOrder) {
        return Promise.resolve()
      }

      return ctx.db.patch(category._id, { order: nextOrder })
    }),
  )
}

async function normalizeCategorySiblingOrders(
  ctx: any,
  parentId?: Id<'categories'>,
) {
  const siblings = await listCategorySiblings(ctx, parentId)
  await assignSequentialCategoryOrders(ctx, siblings)
}

async function getNextCategoryOrder(ctx: any, parentId?: Id<'categories'>) {
  const siblings = await listCategorySiblings(ctx, parentId)
  return siblings.length + 1
}

async function moveCategoryToOrder(
  ctx: any,
  parentId: Id<'categories'> | undefined,
  categoryId: Id<'categories'>,
  order: number,
) {
  const siblings = await listCategorySiblings(ctx, parentId)
  const currentIndex = siblings.findIndex(
    (category) => category._id === categoryId,
  )

  if (currentIndex === -1) {
    throw new Error('Категория не найдена в своей группе')
  }

  const [movingCategory] = siblings.splice(currentIndex, 1)
  siblings.splice(
    getCategoryInsertIndex(order, siblings.length),
    0,
    movingCategory,
  )

  await assignSequentialCategoryOrders(ctx, siblings)
}

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
      .withIndex('by_manager', (q) =>
        q.eq('managerId', managerId).eq('status', status),
      )
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

    const ordersWithItems = await Promise.all(
      orders.page.map(async (order) => {
        const items = await ctx.db
          .query('orderItems')
          .withIndex('by_order', (q) => q.eq('orderId', order._id))
          .collect()

        return {
          ...order,
          items: items.map((item) => ({
            _id: item._id,
            itemId: item.itemId,
            name: item.name,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
          })),
        }
      }),
    )

    return {
      ...orders,
      page: ordersWithItems,
    }
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
    brandId: v.optional(v.id('brands')),
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
    oldPrice: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    imageStorageIds: v.optional(v.array(v.id('_storage'))),
    documents: v.optional(documentsValidator),
    labels: v.optional(v.array(v.string())),
    specifications: v.optional(specificationsValidator),
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
    if (args.oldPrice !== undefined) validatePrice(args.oldPrice, 'Old price')
    if (args.discountAmount !== undefined) {
      validatePrice(args.discountAmount, 'Discount amount')
    }
    validateCollection(args.collection)

    const slug = args.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')

    const normalizedSpecifications = normalizeSpecifications(
      args.specifications,
    )
    const normalizedDocuments = normalizeDocuments(args.documents)
    const normalizedLabels = normalizeLabels(args.labels)
    const normalizedCollection =
      normalizeOptionalString(args.collection) ??
      normalizeOptionalString(
        typeof args.specifications?.collection === 'string'
          ? args.specifications.collection
          : undefined,
      ) ??
      undefined
    const imageStorageIds =
      args.imageStorageIds && args.imageStorageIds.length > 0
        ? args.imageStorageIds
        : undefined
    const imagesUrl = imageStorageIds
      ? await resolveImageUrls(ctx, imageStorageIds)
      : undefined

    const itemData: any = {
      name: args.name,
      slug,
      sku: args.sku,
      description: args.description,
      categoryId: args.categoryId,
      status: args.status,
      price: args.price,
      quantity: args.quantity,
      inStock: args.inStock,
      ordersCount: 0,
      searchText: `${args.name} ${args.sku}`.toLowerCase(),
    }

    if (args.brandId !== undefined) {
      itemData.brandId = args.brandId
    }

    if (args.oldPrice !== undefined) {
      itemData.oldPrice = args.oldPrice
    }
    if (args.discountAmount !== undefined) {
      itemData.discountAmount = args.discountAmount
    }
    if (imageStorageIds) {
      itemData.imageStorageIds = imageStorageIds
      itemData.imagesUrl = imagesUrl
    }
    if (normalizedDocuments) {
      itemData.documents = normalizedDocuments
    }
    if (normalizedLabels) {
      itemData.labels = normalizedLabels
    }
    if (normalizedSpecifications) {
      itemData.specifications = normalizedSpecifications
    }
    if (normalizedCollection) {
      itemData.collection = normalizedCollection
    }

    const itemId = await ctx.db.insert('items', itemData)

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
    brandId: v.optional(v.union(v.id('brands'), v.null())),
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
    oldPrice: v.optional(v.union(v.number(), v.null())),
    discountAmount: v.optional(v.union(v.number(), v.null())),
    imageStorageIds: v.optional(v.union(v.array(v.id('_storage')), v.null())),
    documents: v.optional(v.union(documentsValidator, v.null())),
    labels: v.optional(v.union(v.array(v.string()), v.null())),
    specifications: v.optional(v.union(specificationsValidator, v.null())),
    collection: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { id, ...args }) => {
    await requireRole(ctx, ['manager', 'admin'])

    // Input validation
    if (args.name !== undefined) validateName(args.name)
    if (args.sku !== undefined) validateSku(args.sku)
    if (args.description !== undefined) validateDescription(args.description)
    if (args.price !== undefined) validatePrice(args.price)
    if (args.quantity !== undefined) validateQuantity(args.quantity)
    if (args.oldPrice !== undefined && args.oldPrice !== null) {
      validatePrice(args.oldPrice, 'Old price')
    }
    if (args.discountAmount !== undefined && args.discountAmount !== null) {
      validatePrice(args.discountAmount, 'Discount amount')
    }
    if (args.collection !== undefined && args.collection !== null) {
      validateCollection(args.collection)
    }

    const existing = await ctx.db.get(id)
    if (!existing) throw new Error('Item not found')

    const { _id, _creationTime, ...existingFields } = existing as any
    const next: any = { ...existingFields }

    if (args.name !== undefined) {
      next.name = args.name
      next.slug = args.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
    }
    if (args.sku !== undefined) next.sku = args.sku
    if (args.description !== undefined) next.description = args.description
    if (args.brandId !== undefined) {
      if (args.brandId === null) {
        delete next.brandId
      } else {
        next.brandId = args.brandId
      }
    }
    if (args.categoryId !== undefined) next.categoryId = args.categoryId
    if (args.price !== undefined) next.price = args.price
    if (args.quantity !== undefined) next.quantity = args.quantity
    if (args.status !== undefined) next.status = args.status
    if (args.inStock !== undefined) next.inStock = args.inStock

    if (args.name || args.sku) {
      const name = args.name ?? existing.name
      const sku = args.sku ?? existing.sku
      next.searchText = `${name} ${sku}`.toLowerCase()
    }

    if (args.oldPrice !== undefined) {
      if (args.oldPrice === null) {
        delete next.oldPrice
      } else {
        next.oldPrice = args.oldPrice
      }
    }

    if (args.discountAmount !== undefined) {
      if (args.discountAmount === null) {
        delete next.discountAmount
      } else {
        next.discountAmount = args.discountAmount
      }
    }

    if (args.specifications !== undefined) {
      const normalizedSpecifications = normalizeSpecifications(
        args.specifications,
      )
      if (normalizedSpecifications === null) {
        delete next.specifications
      } else {
        next.specifications = normalizedSpecifications
      }
    }

    if (args.collection !== undefined) {
      const normalizedCollection = normalizeOptionalString(args.collection)
      if (normalizedCollection === null) {
        delete next.collection
      } else {
        next.collection = normalizedCollection
      }
    } else if (
      args.specifications !== undefined &&
      args.specifications !== null &&
      typeof args.specifications.collection === 'string'
    ) {
      const normalizedCollection = normalizeOptionalString(
        args.specifications.collection,
      )
      if (normalizedCollection) {
        next.collection = normalizedCollection
      }
    }

    if (args.labels !== undefined) {
      const normalizedLabels = normalizeLabels(args.labels)
      if (normalizedLabels === null) {
        delete next.labels
      } else {
        next.labels = normalizedLabels
      }
    }

    if (args.documents !== undefined) {
      const normalizedDocuments = normalizeDocuments(args.documents)
      if (normalizedDocuments === null) {
        delete next.documents
      } else {
        next.documents = normalizedDocuments
      }
    }

    if (args.imageStorageIds !== undefined) {
      if (args.imageStorageIds === null || args.imageStorageIds.length === 0) {
        delete next.imageStorageIds
        delete next.imagesUrl
      } else {
        next.imageStorageIds = args.imageStorageIds
        next.imagesUrl = await resolveImageUrls(ctx, args.imageStorageIds)
      }
    }

    await ctx.db.replace(id, next)

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

export const generate_upload_url = mutation({
  returns: v.string(),
  handler: async (ctx) => {
    await requireRole(ctx, ['manager', 'admin'])
    return await ctx.storage.generateUploadUrl()
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

export const update_category_order = mutation({
  args: {
    id: v.id('categories'),
    order: v.number(),
  },
  handler: async (ctx, { id, order }) => {
    await requireRole(ctx, ['manager', 'admin'])
    const normalizedOrder = normalizeCategoryOrder(order)
    const existing = (await ctx.db.get(id)) as Doc<'categories'> | null
    if (!existing) throw new Error('Category not found')

    await moveCategoryToOrder(ctx, existing.parentId, id, normalizedOrder)
    return { status: 200 }
  },
})

export const create_category = mutation({
  args: {
    name: v.string(),
    order: v.optional(v.number()),
    parentId: v.optional(v.union(v.id('categories'), v.null())),
    isVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, { name, order, parentId, isVisible }) => {
    await requireRole(ctx, ['manager', 'admin'])

    const trimmedName = name.trim()
    validateName(trimmedName, 'Название категории')
    const parent = await resolveCategoryParent(ctx, parentId)
    const normalizedOrder =
      order === undefined
        ? await getNextCategoryOrder(ctx, parent?._id)
        : normalizeCategoryOrder(order)
    const slug = await buildUniqueCategorySlug(ctx, trimmedName)

    const createdId = await ctx.db.insert('categories', {
      name: trimmedName,
      slug,
      order: normalizedOrder,
      level: parent ? parent.level + 1 : 0,
      isVisible: isVisible ?? true,
      ...(parent ? { parentId: parent._id } : {}),
    })

    await moveCategoryToOrder(ctx, parent?._id, createdId, normalizedOrder)

    return createdId
  },
})

export const update_category = mutation({
  args: {
    id: v.id('categories'),
    name: v.string(),
    order: v.optional(v.number()),
    parentId: v.optional(v.union(v.id('categories'), v.null())),
    isVisible: v.boolean(),
  },
  handler: async (ctx, { id, name, order, parentId, isVisible }) => {
    await requireRole(ctx, ['manager', 'admin'])

    const existing = (await ctx.db.get(id)) as Doc<'categories'> | null
    if (!existing) {
      throw new Error('Категория не найдена')
    }

    const trimmedName = name.trim()
    validateName(trimmedName, 'Название категории')
    const previousParentId = existing.parentId
    const nextParentId = parentId === null ? undefined : parentId

    if (nextParentId === id) {
      throw new Error('Категория не может быть родителем самой себя')
    }

    const parent = await resolveCategoryParent(ctx, nextParentId)
    const hasChildren = await ctx.db
      .query('categories')
      .withIndex('by_parent_order', (q: any) => q.eq('parentId', id))
      .first()

    if (parent && hasChildren) {
      throw new Error(
        'Нельзя сделать подкатегорией категорию, у которой есть подкатегории',
      )
    }

    const normalizedOrder =
      order === undefined
        ? previousParentId === nextParentId
          ? existing.order
          : await getNextCategoryOrder(ctx, nextParentId)
        : normalizeCategoryOrder(order)

    const slug =
      existing.name.trim() === trimmedName
        ? existing.slug
        : await buildUniqueCategorySlug(ctx, trimmedName, id)

    const { _id, _creationTime, ...existingFields } = existing
    const next: Doc<'categories'> | any = {
      ...existingFields,
      name: trimmedName,
      slug,
      order: normalizedOrder,
      level: parent ? parent.level + 1 : 0,
      isVisible,
    }

    if (parent) {
      next.parentId = parent._id
    } else {
      delete next.parentId
    }

    await ctx.db.replace(id, next)
    if (previousParentId !== nextParentId) {
      await normalizeCategorySiblingOrders(ctx, previousParentId)
    }
    await moveCategoryToOrder(ctx, nextParentId, id, normalizedOrder)

    return id
  },
})

export const reorder_categories = mutation({
  args: {
    parentId: v.optional(v.union(v.id('categories'), v.null())),
    orderedIds: v.array(v.id('categories')),
  },
  handler: async (ctx, { parentId, orderedIds }) => {
    await requireRole(ctx, ['manager', 'admin'])

    const normalizedParentId = parentId ?? undefined
    const siblings = await listCategorySiblings(ctx, normalizedParentId)

    if (siblings.length !== orderedIds.length) {
      throw new Error('Неполный список категорий для изменения порядка')
    }

    const uniqueIds = new Set(orderedIds.map((id) => id.toString()))
    if (uniqueIds.size !== orderedIds.length) {
      throw new Error('Список категорий содержит дубликаты')
    }

    const siblingsById = new Map(
      siblings.map((category) => [category._id.toString(), category] as const),
    )
    const orderedCategories = orderedIds.map((id) => {
      const category = siblingsById.get(id.toString())
      if (!category) {
        throw new Error('Найдена категория из другой группы')
      }

      return category
    })

    await assignSequentialCategoryOrders(ctx, orderedCategories)

    return { status: 200 }
  },
})

export const delete_category = mutation({
  args: {
    id: v.id('categories'),
  },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ['manager', 'admin'])

    const existing = (await ctx.db.get(id)) as Doc<'categories'> | null
    if (!existing) {
      throw new Error('Категория не найдена')
    }

    const childCategory = await ctx.db
      .query('categories')
      .withIndex('by_parent_order', (q: any) => q.eq('parentId', id))
      .first()

    if (childCategory) {
      throw new Error('Нельзя удалить категорию, пока у нее есть подкатегории')
    }

    const attachedItem = await ctx.db
      .query('items')
      .withIndex('by_category_no_status', (q: any) => q.eq('categoryId', id))
      .first()

    if (attachedItem) {
      throw new Error('Нельзя удалить категорию, к которой привязаны товары')
    }

    const attachedCollectionGroup = await ctx.db
      .query('collectionGroups')
      .withIndex('by_category', (q: any) => q.eq('categoryId', id))
      .first()

    if (attachedCollectionGroup) {
      throw new Error(
        'Нельзя удалить категорию, пока для нее существуют группы вариантов',
      )
    }

    await ctx.db.delete(id)
    await normalizeCategorySiblingOrders(ctx, existing.parentId)

    return { status: 200 }
  },
})

export const create_brand = mutation({
  args: {
    name: v.string(),
    country: v.optional(v.union(v.string(), v.null())),
    status: v.optional(v.union(v.literal('active'), v.literal('hidden'))),
  },
  handler: async (ctx, { name, country, status }) => {
    await requireRole(ctx, ['manager', 'admin'])

    const trimmedName = name.trim()
    validateName(trimmedName, 'Название бренда')
    const slug = await buildUniqueBrandSlug(ctx, trimmedName)
    const normalizedCountry = normalizeOptionalString(country)

    return await ctx.db.insert('brands', {
      name: trimmedName,
      slug,
      status: status ?? 'active',
      ...(normalizedCountry ? { country: normalizedCountry } : {}),
    })
  },
})

export const update_brand = mutation({
  args: {
    id: v.id('brands'),
    name: v.string(),
    country: v.optional(v.union(v.string(), v.null())),
    status: v.union(v.literal('active'), v.literal('hidden')),
  },
  handler: async (ctx, { id, name, country, status }) => {
    await requireRole(ctx, ['manager', 'admin'])

    const existing = (await ctx.db.get(id)) as Doc<'brands'> | null
    if (!existing) {
      throw new Error('Бренд не найден')
    }

    const trimmedName = name.trim()
    validateName(trimmedName, 'Название бренда')
    const normalizedCountry = normalizeOptionalString(country)
    const slug =
      existing.name.trim() === trimmedName
        ? existing.slug
        : await buildUniqueBrandSlug(ctx, trimmedName, id)

    const { _id, _creationTime, ...existingFields } = existing
    const next: Doc<'brands'> | any = {
      ...existingFields,
      name: trimmedName,
      slug,
      status,
    }

    if (normalizedCountry) {
      next.country = normalizedCountry
    } else {
      delete next.country
    }

    await ctx.db.replace(id, next)
    return id
  },
})

export const delete_brand = mutation({
  args: {
    id: v.id('brands'),
  },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ['manager', 'admin'])

    const existing = (await ctx.db.get(id)) as Doc<'brands'> | null
    if (!existing) {
      throw new Error('Бренд не найден')
    }

    const attachedItem = await ctx.db
      .query('items')
      .withIndex('by_brand_no_status', (q: any) => q.eq('brandId', id))
      .first()

    if (attachedItem) {
      throw new Error('Нельзя удалить бренд, к которому привязаны товары')
    }

    const attachedCollectionGroup = (await ctx.db
      .query('collectionGroups')
      .collect()) as Doc<'collectionGroups'>[]

    if (attachedCollectionGroup.some((group) => group.brandId === id)) {
      throw new Error(
        'Нельзя удалить бренд, пока для него существуют группы вариантов',
      )
    }

    await ctx.db.delete(id)
    return { status: 200 }
  },
})

export const list_brands_all = query({
  handler: async (ctx) => {
    await requireRole(ctx, ['manager', 'admin'])
    return (await ctx.db.query('brands').collect()).sort((a, b) => {
      const sortOrderA =
        typeof a.sortOrder === 'number' && Number.isFinite(a.sortOrder)
          ? a.sortOrder
          : Number.MAX_SAFE_INTEGER
      const sortOrderB =
        typeof b.sortOrder === 'number' && Number.isFinite(b.sortOrder)
          ? b.sortOrder
          : Number.MAX_SAFE_INTEGER

      const sortDiff = sortOrderA - sortOrderB
      if (sortDiff !== 0) {
        return sortDiff
      }

      return a.name.localeCompare(b.name, 'ru')
    })
  },
})

export const list_categories_all = query({
  handler: async (ctx) => {
    await requireRole(ctx, ['manager', 'admin'])
    return await ctx.db.query('categories').collect()
  },
})

export const list_categories_hierarchy = query({
  handler: async (ctx) => {
    await requireRole(ctx, ['manager', 'admin'])
    const categories = await ctx.db.query('categories').collect()

    const parents = categories
      .filter((c) => !c.parentId)
      .sort((a, b) => {
        const orderDiff = a.order - b.order
        if (orderDiff !== 0) return orderDiff
        return a.name.localeCompare(b.name)
      })
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

    for (const [parentId, children] of childrenMap.entries()) {
      children.sort((a, b) => {
        const orderDiff = a.order - b.order
        if (orderDiff !== 0) return orderDiff
        return a.name.localeCompare(b.name)
      })
      childrenMap.set(parentId, children)
    }

    return {
      parents,
      childrenMap: Object.fromEntries(childrenMap),
    }
  },
})
