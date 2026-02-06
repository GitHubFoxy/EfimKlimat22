import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const usersTable = defineTable({
  // Convex Auth required fields
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),

  // Custom fields
  surname: v.optional(v.string()),

  imagesUrl: v.optional(v.string()),
  imageStorageIds: v.optional(v.id('_storage')),

  // Role: user, manager, or admin
  role: v.optional(
    v.union(v.literal('user'), v.literal('manager'), v.literal('admin')),
  ),

  // Temp password for first-login password change detection
  tempPassword: v.optional(v.string()),

  // B2B
  isWholesale: v.optional(v.boolean()),

  // Address
  defaultAddress: v.optional(
    v.object({
      city: v.string(),
      street: v.string(),
      details: v.string(),
    }),
  ),

  status: v.optional(v.union(v.literal('active'), v.literal('blocked'))),
  legacyId: v.optional(v.string()),
})
  .index('email', ['email'])
  .index('phone', ['phone'])
  .index('by_legacyId', ['legacyId'])

// Auth tables defined inline to avoid TypeScript spread incompatibility
const authSessionsTable = defineTable({
  userId: v.id('users'),
  expirationTime: v.number(),
}).index('userId', ['userId'])

const authAccountsTable = defineTable({
  userId: v.id('users'),
  provider: v.string(),
  providerAccountId: v.string(),
  secret: v.optional(v.string()),
  emailVerified: v.optional(v.string()),
  phoneVerified: v.optional(v.string()),
})
  .index('userIdAndProvider', ['userId', 'provider'])
  .index('providerAndAccountId', ['provider', 'providerAccountId'])

const authRateLimitsTable = defineTable({
  identifier: v.string(),
  lastAttemptTime: v.number(),
  attemptsLeft: v.number(),
}).index('identifier', ['identifier'])

const authRefreshTokensTable = defineTable({
  sessionId: v.id('authSessions'),
  expirationTime: v.number(),
  parentRefreshTokenId: v.optional(v.id('authRefreshTokens')),
  firstUsedTime: v.optional(v.number()),
}).index('sessionId', ['sessionId'])

const brandTable = defineTable({
  name: v.string(),
  slug: v.string(),
  logo: v.optional(v.string()),
  description: v.optional(v.string()),
  country: v.optional(v.string()),
  status: v.union(v.literal('active'), v.literal('hidden')),
  sortOrder: v.optional(v.number()),
  legacyId: v.optional(v.string()),
})
  .index('by_status_sort', ['status', 'sortOrder'])
  .index('by_slug', ['slug'])
  .index('by_legacyId', ['legacyId'])

const itemsTable = defineTable({
  name: v.string(),
  slug: v.string(),
  sku: v.string(),
  description: v.string(),

  brandId: v.optional(v.id('brands')), // Optional during migration, make required after
  categoryId: v.optional(v.id('categories')), // Optional during migration, make required after

  status: v.union(
    v.literal('active'),
    v.literal('draft'),
    v.literal('archived'),
    v.literal('preorder'),
  ),

  price: v.number(),
  oldPrice: v.optional(v.number()),
  discountAmount: v.optional(v.number()),
  quantity: v.number(),

  imagesUrl: v.optional(v.array(v.string())),
  imageStorageIds: v.optional(v.array(v.id('_storage'))),

  documents: v.optional(
    v.array(
      v.object({
        name: v.string(),
        url: v.string(),
      }),
    ),
  ),

  inStock: v.boolean(),
  specifications: v.optional(
    v.record(v.string(), v.union(v.string(), v.number(), v.boolean())),
    // Examples: { "power": 5.5 }, { "powerKW": 5.5 }, { "sectionCount": 12 }
  ),
  // Denormalized collection field for grouping (synced from specifications.collection)
  collection: v.optional(v.string()),
  ordersCount: v.number(),
  labels: v.optional(v.array(v.string())),
  searchText: v.string(),
  legacyId: v.optional(v.string()),
})
  .searchIndex('search_main', {
    searchField: 'searchText',
    filterFields: ['categoryId', 'brandId', 'status', 'inStock'],
  })
  .index('by_orders', ['status', 'ordersCount'])
  .index('by_category_price', ['categoryId', 'status', 'price'])
  .index('by_category_orders', ['categoryId', 'status', 'ordersCount'])
  .index('by_category_created', ['categoryId', 'status'])
  .index('by_category_discount', ['categoryId', 'status', 'discountAmount'])
  .index('by_slug', ['slug'])
  .index('by_brand_status', ['status', 'brandId'])
  .index('by_status', ['status'])
  .index('by_category_no_status', ['categoryId'])
  .index('by_brand_no_status', ['brandId'])
  .index('by_category_brand_collection', [
    'categoryId',
    'brandId',
    'status',
    'collection',
  ])
  .index('by_legacyId', ['legacyId'])

const categoryTable = defineTable({
  name: v.string(),
  slug: v.string(),
  parentId: v.optional(v.id('categories')),
  level: v.number(),
  order: v.number(),

  icon: v.optional(v.string()),
  imagesUrl: v.optional(v.string()),
  imageStorageIds: v.optional(v.id('_storage')),
  description: v.optional(v.string()),

  isVisible: v.boolean(),
  legacyId: v.optional(v.string()),
})
  .searchIndex('search_name', { searchField: 'name' })
  .index('by_parent_order', ['parentId', 'order'])
  .index('by_slug', ['slug'])
  .index('by_legacyId', ['legacyId'])

const cartsTable = defineTable({
  userId: v.optional(v.id('users')),
  sessionId: v.optional(v.string()),

  status: v.union(
    v.literal('active'),
    v.literal('checkout'),
    v.literal('locked'),
    v.literal('completed'),
    v.literal('merged'),
    v.literal('archived'),
  ),

  updatedAt: v.number(),

  // Migration tracking
  legacyId: v.optional(v.string()),
})
  .index('by_status_time', ['status', 'updatedAt'])
  .index('by_sessionId', ['sessionId', 'status'])
  .index('by_userId', ['userId', 'status'])

const cartItemsTable = defineTable({
  cartId: v.optional(v.id('carts')), // Optional during migration
  itemId: v.optional(v.id('items')), // Optional during migration
  quantity: v.number(),
  legacyId: v.optional(v.string()),
})
  .index('by_cart_added', ['cartId'])
  .index('by_cart_item', ['cartId', 'itemId'])

const ordersTable = defineTable({
  userId: v.optional(v.id('users')),
  cartId: v.optional(v.id('carts')),

  publicNumber: v.number(),

  clientName: v.string(),
  clientPhone: v.string(),
  clientEmail: v.optional(v.string()),

  deliveryType: v.union(
    v.literal('pickup'),
    v.literal('courier'),
    v.literal('transport'),
  ),
  address: v.optional(
    v.object({
      city: v.string(),
      street: v.string(),
      details: v.optional(v.string()),
    }),
  ),
  deliveryPrice: v.number(),

  paymentMethod: v.union(
    v.literal('cash_on_delivery'),
    v.literal('card_on_delivery'),
    v.literal('b2b_invoice'),
  ),
  paymentStatus: v.union(
    v.literal('pending'),
    v.literal('paid'),
    v.literal('failed'),
    v.literal('refunded'),
  ),

  itemsTotal: v.number(),
  totalAmount: v.number(),

  status: v.union(
    v.literal('new'),
    v.literal('confirmed'),
    v.literal('processing'),
    v.literal('shipping'),
    v.literal('done'),
    v.literal('canceled'),
  ),

  managerId: v.optional(v.id('users')),
  comment: v.optional(v.string()),
  managerNote: v.optional(v.string()),
  updatedAt: v.number(),

  // Migration tracking
  legacyId: v.optional(v.string()),
})
  .index('by_user', ['userId'])
  .index('by_cartId', ['cartId'])
  .index('by_status_date', ['status'])
  .index('by_publicNumber', ['publicNumber'])
  .index('by_manager', ['managerId', 'status'])
  .index('by_legacyId', ['legacyId'])

const orderItemsTable = defineTable({
  orderId: v.optional(v.id('orders')), // Optional during migration
  itemId: v.optional(v.id('items')),
  name: v.string(),
  sku: v.string(),
  price: v.number(),
  quantity: v.number(),
  legacyId: v.optional(v.string()),
}).index('by_order', ['orderId'])

const leadsTable = defineTable({
  name: v.string(),
  phone: v.string(),
  email: v.optional(v.string()),

  type: v.union(
    v.literal('callback'),
    v.literal('product_question'),
    v.literal('project_calculation'),
    v.literal('installation'),
  ),

  relatedItemId: v.optional(v.id('items')),
  message: v.optional(v.string()),

  status: v.union(
    v.literal('new'),
    v.literal('processing'),
    v.literal('success'),
    v.literal('failed'),
  ),

  publicAnswer: v.optional(v.string()),
  isPublished: v.optional(v.boolean()),
  publicQuestion: v.optional(v.string()),

  assignedManagerId: v.optional(v.id('users')),
  managerNote: v.optional(v.string()),
  updatedAt: v.number(),
  legacyId: v.optional(v.string()),
})
  .index('by_status_date', ['status'])
  .index('by_manager_status', ['assignedManagerId', 'status'])
  .index('by_item', ['relatedItemId'])
  .index('by_legacyId', ['legacyId'])

const reviewsTable = defineTable({
  itemId: v.optional(v.id('items')), // Optional during migration
  userId: v.optional(v.id('users')),
  legacyId: v.optional(v.string()),

  authorName: v.string(),

  rating: v.number(),
  text: v.optional(v.string()),
  pros: v.optional(v.string()),
  cons: v.optional(v.string()),

  imagesUrl: v.optional(v.array(v.string())),
  imageStorageIds: v.optional(v.array(v.id('_storage'))),

  status: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('rejected'),
  ),

  reply: v.optional(v.string()),
  replyDate: v.optional(v.number()),
})
  .index('by_item_status', ['itemId', 'status'])
  .index('by_status', ['status'])
  .index('by_user', ['userId'])

const collectionGroupsTable = defineTable({
  categoryId: v.id('categories'),
  brandId: v.id('brands'),
  collection: v.string(),
  representativeItemId: v.id('items'),

  variantsCount: v.number(),
  priceMin: v.number(),
  priceMax: v.number(),
  hasDiscount: v.boolean(),

  primaryImageUrl: v.optional(v.string()),
  representativeSlug: v.optional(v.string()),
})
  .index('by_category_brand', ['categoryId', 'brandId'])
  .index('by_category', ['categoryId'])

export default defineSchema({
  users: usersTable,
  authSessions: authSessionsTable,
  authAccounts: authAccountsTable,
  authRateLimits: authRateLimitsTable,
  authRefreshTokens: authRefreshTokensTable,
  brands: brandTable,
  items: itemsTable,
  categories: categoryTable,
  carts: cartsTable,
  cartItems: cartItemsTable,
  orders: ordersTable,
  orderItems: orderItemsTable,
  leads: leadsTable,
  reviews: reviewsTable,
  collectionGroups: collectionGroupsTable,
})
