/**
 * Post-Import Mutations for EfimKlimat22
 *
 * Copy this file to EfimKlimat22/convex/migrations.ts and deploy.
 * Then run the mutations to resolve ID references.
 */

import { v } from 'convex/values'
import { Id } from './_generated/dataModel'
import { internalMutation, mutation } from './_generated/server'
import { requireRole } from './authHelpers'

// ============================================================
// Add Missing Brands
// ============================================================
export const addMissingBrands = mutation({
  args: {
    brands: v.array(
      v.object({
        name: v.string(),
        slug: v.string(),
        status: v.union(v.literal('active'), v.literal('hidden')),
        legacyId: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const existing = await ctx.db.query('brands').collect()
    const existingNames = new Set(
      existing.map((b) => b.name.toLowerCase().trim()),
    )

    let added = 0
    for (const brand of args.brands) {
      if (!existingNames.has(brand.name.toLowerCase().trim())) {
        await ctx.db.insert('brands', brand)
        added++
      }
    }
    return { added }
  },
})

// ============================================================
// Resolve All Items (brand by name, category by legacyId)
// ============================================================
export const resolveItemsByNameLookup = mutation({
  args: {
    items: v.array(
      v.object({
        legacyId: v.string(),
        brandName: v.optional(v.string()),
        categoryLegacyId: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const items = await ctx.db.query('items').collect()
    const brands = await ctx.db.query('brands').collect()
    const categories = await ctx.db.query('categories').collect()

    const itemByLegacy = new Map(items.map((i) => [i.legacyId, i._id]))
    const brandByName = new Map(
      brands.map((b) => [b.name.toLowerCase().trim(), b._id]),
    )
    const categoryByLegacy = new Map(categories.map((c) => [c.legacyId, c._id]))

    let updated = 0
    const brandMissing: string[] = []
    const catMissing: string[] = []

    for (const item of args.items) {
      const itemId = itemByLegacy.get(item.legacyId)
      if (!itemId) continue

      const patch: any = {}

      if (item.brandName) {
        const brandId = brandByName.get(item.brandName.toLowerCase().trim())
        if (brandId) {
          patch.brandId = brandId
        } else if (!brandMissing.includes(item.brandName)) {
          brandMissing.push(item.brandName)
        }
      }

      if (item.categoryLegacyId) {
        const categoryId = categoryByLegacy.get(item.categoryLegacyId)
        if (categoryId) {
          patch.categoryId = categoryId
        } else if (!catMissing.includes(item.categoryLegacyId)) {
          catMissing.push(item.categoryLegacyId)
        }
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(itemId, patch)
        updated++
      }
    }

    return {
      updated,
      brandMissing: brandMissing.slice(0, 10),
      catMissing: catMissing.slice(0, 10),
    }
  },
})

// ============================================================
// Resolve Category Parent References
// ============================================================
export const resolveCategoryParents = mutation({
  args: {
    parentMap: v.array(
      v.object({
        legacyId: v.string(),
        parentLegacyId: v.union(v.string(), v.null()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const categories = await ctx.db.query('categories').collect()
    const byLegacy = new Map(categories.map((c) => [c.legacyId, c._id]))

    let updated = 0
    for (const { legacyId, parentLegacyId } of args.parentMap) {
      if (!parentLegacyId) continue

      const catId = byLegacy.get(legacyId)
      const parentId = byLegacy.get(parentLegacyId)

      if (catId && parentId) {
        await ctx.db.patch(catId, { parentId, level: 1 })
        updated++
      }
    }

    return { updated, total: args.parentMap.length }
  },
})

// ============================================================
// Resolve Item References (brandId, categoryId) - DB Lookup Version
// ============================================================
export const resolveAllItemReferences = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    // Get all brands and categories
    const brands = await ctx.db.query('brands').collect()
    const categories = await ctx.db.query('categories').collect()
    const items = await ctx.db.query('items').collect()

    // Build lookup maps
    const brandByName = new Map(
      brands.map((b) => [b.name.trim().toLowerCase(), b._id]),
    )
    const categoryByLegacy = new Map(categories.map((c) => [c.legacyId, c._id]))

    const brandErrors: string[] = []
    const catErrors: string[] = []

    for (const item of items) {
      if (item.brandId && item.categoryId) continue // Already resolved

      const updates: any = {}

      // Get the reference data from item_references.json - but since we can't
      // read files, we'll need to handle this differently
      // For now, just count items needing updates
    }

    return {
      totalItems: items.length,
      brandsAvailable: brands.length,
      categoriesAvailable: categories.length,
      itemsNeedingBrand: items.filter((i) => !i.brandId).length,
      itemsNeedingCategory: items.filter((i) => !i.categoryId).length,
      brandErrors,
      catErrors,
    }
  },
})

// Batch update items with brand and category by legacyId mapping
export const batchResolveItemRefs = mutation({
  args: {
    updates: v.array(
      v.object({
        itemLegacyId: v.string(),
        brandLegacyId: v.optional(v.string()),
        categoryLegacyId: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const items = await ctx.db.query('items').collect()
    const brands = await ctx.db.query('brands').collect()
    const categories = await ctx.db.query('categories').collect()

    const itemByLegacy = new Map(items.map((i) => [i.legacyId, i._id]))
    const brandByLegacy = new Map(brands.map((b) => [b.legacyId, b._id]))
    const categoryByLegacy = new Map(categories.map((c) => [c.legacyId, c._id]))

    let updated = 0
    for (const u of args.updates) {
      const itemId = itemByLegacy.get(u.itemLegacyId)
      if (!itemId) continue

      const patch: any = {}
      if (u.brandLegacyId) {
        const brandId = brandByLegacy.get(u.brandLegacyId)
        if (brandId) patch.brandId = brandId
      }
      if (u.categoryLegacyId) {
        const categoryId = categoryByLegacy.get(u.categoryLegacyId)
        if (categoryId) patch.categoryId = categoryId
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(itemId, patch)
        updated++
      }
    }

    return { updated }
  },
})

// ============================================================
// Resolve Cart User References
// ============================================================
export const resolveCartReferences = mutation({
  args: {
    references: v.array(
      v.object({
        legacyId: v.string(),
        userLegacyId: v.optional(v.string()),
      }),
    ),
    userMapping: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const carts = await ctx.db.query('carts').collect()
    const byLegacy = new Map(carts.map((c) => [c.legacyId, c._id]))

    let updated = 0
    for (const ref of args.references) {
      if (!ref.userLegacyId) continue

      const cartId = byLegacy.get(ref.legacyId)
      const userId = args.userMapping[ref.userLegacyId]

      if (cartId && userId) {
        await ctx.db.patch(cartId, { userId: userId as Id<'users'> })
        updated++
      }
    }

    return { updated }
  },
})

// ============================================================
// Resolve CartItem References
// ============================================================
export const resolveCartItemReferences = mutation({
  args: {
    references: v.array(
      v.object({
        legacyId: v.string(),
        cartLegacyId: v.optional(v.string()),
        itemLegacyId: v.optional(v.string()),
      }),
    ),
    cartMapping: v.record(v.string(), v.string()),
    itemMapping: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const cartItems = await ctx.db.query('cartItems').collect()
    const byLegacy = new Map(cartItems.map((ci) => [ci.legacyId, ci._id]))

    let updated = 0
    for (const ref of args.references) {
      const ciId = byLegacy.get(ref.legacyId)
      if (!ciId) continue

      const updates: any = {}

      if (ref.cartLegacyId) {
        const cartId = args.cartMapping[ref.cartLegacyId]
        if (cartId) updates.cartId = cartId as Id<'carts'>
      }

      if (ref.itemLegacyId) {
        const itemId = args.itemMapping[ref.itemLegacyId]
        if (itemId) updates.itemId = itemId as Id<'items'>
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(ciId, updates)
        updated++
      }
    }

    return { updated }
  },
})

// ============================================================
// Resolve Order References
// ============================================================
export const resolveOrderReferences = mutation({
  args: {
    references: v.array(
      v.object({
        legacyId: v.string(),
        userLegacyId: v.optional(v.string()),
        cartLegacyId: v.optional(v.string()),
        managerLegacyId: v.optional(v.string()),
      }),
    ),
    userMapping: v.record(v.string(), v.string()),
    cartMapping: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const orders = await ctx.db.query('orders').collect()
    const byLegacy = new Map(orders.map((o) => [o.legacyId, o._id]))

    let updated = 0
    for (const ref of args.references) {
      const orderId = byLegacy.get(ref.legacyId)
      if (!orderId) continue

      const updates: any = {}

      if (ref.userLegacyId) {
        const userId = args.userMapping[ref.userLegacyId]
        if (userId) updates.userId = userId as Id<'users'>
      }

      if (ref.cartLegacyId) {
        const cartId = args.cartMapping[ref.cartLegacyId]
        if (cartId) updates.cartId = cartId as Id<'carts'>
      }

      if (ref.managerLegacyId) {
        const managerId = args.userMapping[ref.managerLegacyId]
        if (managerId) updates.managerId = managerId as Id<'users'>
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(orderId, updates)
        updated++
      }
    }

    return { updated }
  },
})

// ============================================================
// Resolve Lead References
// ============================================================
export const resolveLeadReferences = mutation({
  args: {
    references: v.array(
      v.object({
        legacyId: v.string(),
        itemLegacyId: v.optional(v.string()),
        managerLegacyId: v.optional(v.string()),
      }),
    ),
    itemMapping: v.record(v.string(), v.string()),
    userMapping: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const leads = await ctx.db.query('leads').collect()
    const byLegacy = new Map(leads.map((l) => [l.legacyId, l._id]))

    let updated = 0
    for (const ref of args.references) {
      const leadId = byLegacy.get(ref.legacyId)
      if (!leadId) continue

      const updates: any = {}

      if (ref.itemLegacyId) {
        const itemId = args.itemMapping[ref.itemLegacyId]
        if (itemId) updates.relatedItemId = itemId as Id<'items'>
      }

      if (ref.managerLegacyId) {
        const managerId = args.userMapping[ref.managerLegacyId]
        if (managerId) updates.assignedManagerId = managerId as Id<'users'>
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(leadId, updates)
        updated++
      }
    }

    return { updated }
  },
})

// ============================================================
// Resolve Review References
// ============================================================
export const resolveReviewReferences = mutation({
  args: {
    references: v.array(
      v.object({
        legacyId: v.string(),
        itemLegacyId: v.optional(v.string()),
        userLegacyId: v.optional(v.string()),
      }),
    ),
    itemMapping: v.record(v.string(), v.string()),
    userMapping: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    const reviews = await ctx.db.query('reviews').collect()
    const byLegacy = new Map(reviews.map((r) => [r.legacyId, r._id]))

    let updated = 0
    for (const ref of args.references) {
      const reviewId = byLegacy.get(ref.legacyId)
      if (!reviewId) continue

      const updates: any = {}

      if (ref.itemLegacyId) {
        const itemId = args.itemMapping[ref.itemLegacyId]
        if (itemId) updates.itemId = itemId as Id<'items'>
      }

      if (ref.userLegacyId) {
        const userId = args.userMapping[ref.userLegacyId]
        if (userId) updates.userId = userId as Id<'users'>
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(reviewId, updates)
        updated++
      }
    }

    return { updated }
  },
})
