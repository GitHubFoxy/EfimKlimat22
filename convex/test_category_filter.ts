import { v } from 'convex/values'
import { query } from './_generated/server'

/**
 * Test query to debug category filter issues
 * Run in Convex console to diagnose if items are assigned to correct category IDs
 */
export const diagnose_category_items = query({
  args: {
    categorySlug: v.string(),
  },
  handler: async (ctx, { categorySlug }) => {
    // 1. Find the category by slug
    const topLevelCategory = await ctx.db
      .query('categories')
      .filter((q) =>
        q.and(
          q.eq(q.field('slug'), categorySlug),
          q.eq(q.field('isVisible'), true),
        ),
      )
      .first()

    if (!topLevelCategory) {
      return {
        error: `Category with slug "${categorySlug}" not found (visible only)`,
      }
    }

    console.log('Top-level category:', {
      _id: topLevelCategory._id,
      name: topLevelCategory.name,
      slug: topLevelCategory.slug,
      parentId: topLevelCategory.parentId,
    })

    // 2. Get all subcategories
    const subcategories = await ctx.db
      .query('categories')
      .withIndex('by_parent_order', (q) =>
        q.eq('parentId', topLevelCategory._id),
      )
      .collect()

    console.log(
      `Found ${subcategories.length} subcategories:`,
      subcategories.map((s) => ({ _id: s._id, name: s.name, slug: s.slug })),
    )

    // 3. Check items directly assigned to top-level category
    const directItems = await ctx.db
      .query('items')
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'active'),
          q.eq(q.field('inStock'), true),
          q.eq(q.field('categoryId'), topLevelCategory._id),
        ),
      )
      .take(5)

    console.log(
      `Items directly assigned to ${topLevelCategory.name} (${topLevelCategory._id}):`,
      directItems.length,
    )
    if (directItems.length > 0) {
      console.log(
        'Sample:',
        directItems.map((i) => ({ name: i.name, categoryId: i.categoryId })),
      )
    }

    // 4. Check items assigned to subcategories
    let itemsInSubcategories = 0
    const subcategoryItemExamples: any[] = []

    for (const sub of subcategories) {
      const items = await ctx.db
        .query('items')
        .filter((q) =>
          q.and(
            q.eq(q.field('status'), 'active'),
            q.eq(q.field('inStock'), true),
            q.eq(q.field('categoryId'), sub._id),
          ),
        )
        .take(100)

      itemsInSubcategories += items.length
      if (items.length > 0 && subcategoryItemExamples.length < 3) {
        subcategoryItemExamples.push({
          subcategory: sub.name,
          count: items.length,
          sample: items.slice(0, 2).map((i) => i.name),
        })
      }
    }

    console.log(`Items in subcategories: ${itemsInSubcategories}`)
    if (subcategoryItemExamples.length > 0) {
      console.log('Examples:', subcategoryItemExamples)
    }

    // 5. Check items with undefined categoryId
    const unassignedItems = await ctx.db
      .query('items')
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'active'),
          q.eq(q.field('inStock'), true),
        ),
      )
      .take(100)

    const withoutCategory = unassignedItems.filter((i) => !i.categoryId)
    console.log(`Items with undefined categoryId: ${withoutCategory.length}`)

    // 6. Return summary
    return {
      category: {
        _id: topLevelCategory._id,
        name: topLevelCategory.name,
        slug: topLevelCategory.slug,
      },
      subcategoryCount: subcategories.length,
      subcategories: subcategories.map((s) => ({ _id: s._id, name: s.name })),
      directItemsCount: directItems.length,
      itemsInSubcategoriesCount: itemsInSubcategories,
      itemsWithoutCategoryCount: withoutCategory.length,
      diagnosis:
        directItems.length === 0 && itemsInSubcategories > 0
          ? 'ISSUE FOUND: Items are assigned to subcategories, not the top-level category. Query filters by top-level ID, so no items show up.'
          : directItems.length > 0
            ? 'OK: Items are assigned to the top-level category.'
            : itemsInSubcategories === 0 && withoutCategory.length > 0
              ? 'ISSUE: Items have no category assigned.'
              : 'UNKNOWN: No items found in any form.',
    }
  },
})

/**
 * Fix helper: Get all descendant category IDs for hierarchical filtering
 */
export const get_descendant_category_ids = query({
  args: {
    categoryId: v.id('categories'),
  },
  handler: async (ctx, { categoryId }) => {
    // Fetch all categories once
    const allCategories = await ctx.db.query('categories').collect()

    // Build descendant set recursively
    const descendants = new Set<string>([categoryId])
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
  },
})
