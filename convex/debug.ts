import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireRole } from './authHelpers'

export const getMappings = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    const brands = await ctx.db.query('brands').collect()
    const categories = await ctx.db.query('categories').collect()
    const users = await ctx.db.query('users').collect()

    const brandsMap: Record<string, string> = {}
    for (const b of brands) if (b.legacyId) brandsMap[b.legacyId] = b._id

    const categoriesMap: Record<string, string> = {}
    for (const c of categories)
      if (c.legacyId) categoriesMap[c.legacyId] = c._id

    const usersMap: Record<string, string> = {}
    for (const u of users) if (u.legacyId) usersMap[u.legacyId] = u._id

    return {
      brands: brandsMap,
      categorys: categoriesMap,
      users: usersMap,
    }
  },
})

export const getPrefixes = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    const tables = [
      'users',
      'brands',
      'items',
      'categories',
      'carts',
      'cartItems',
      'orders',
      'orderItems',
      'leads',
      'reviews',
    ] as const
    const results: Record<string, string | undefined> = {}
    for (const table of tables) {
      results[table] = (await ctx.db.query(table).first())?._id
    }
    return results
  },
})

export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    const tables = [
      'users',
      'brands',
      'items',
      'categories',
      'carts',
      'cartItems',
      'orders',
      'orderItems',
      'leads',
      'reviews',
    ] as const
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect()
      for (const doc of docs) {
        await ctx.db.delete(doc._id)
      }
    }
  },
})

export const createDummyData = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    await ctx.db.insert('users', { name: 'test' })
    await ctx.db.insert('brands', {
      name: 'test',
      slug: 'test',
      status: 'active',
    })
    await ctx.db.insert('categories', {
      name: 'test',
      slug: 'test',
      level: 1,
      order: 1,
      isVisible: true,
    })
    await ctx.db.insert('carts', { updatedAt: Date.now(), status: 'active' })
  },
})

export const checkId = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['admin'])
    try {
      const doc = await ctx.db.get(args.id as any)
      return { doc, error: null }
    } catch (e: any) {
      return { doc: null, error: e.message }
    }
  },
})
