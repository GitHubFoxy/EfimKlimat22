import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const usersTable = defineTable({
  // 1. Идентификация
  email: v.optional(v.string()),
  phone: v.optional(v.string()), // Сделал optional, т.к. при регистрации через соцсети его может не быть
  password: v.optional(v.string()),

  // 2. Личные данные
  name: v.optional(v.string()), 
  surname: v.optional(v.string()),
  
  imagesUrl: v.optional(v.string()),
  imageStorageIds: v.optional(v.id("_storage")),

  // 3. Роли
  role: v.union(
    v.literal("user"),
    v.literal("manager"),
    v.literal("admin")
  ),

  // 4. B2B
  isWholesale: v.optional(v.boolean()),

  // 5. Адрес
  defaultAddress: v.optional(v.object({
    city: v.string(),
    street: v.string(),
    details: v.string()
  })),
  
  status: v.optional(v.union(v.literal("active"), v.literal("blocked"))),
});

const brandTable = defineTable({
  name: v.string(),
  slug: v.string(),
  logo: v.optional(v.string()),
  description: v.optional(v.string()),
  country: v.optional(v.string()),
  status: v.union(v.literal("active"), v.literal("hidden")),
  sortOrder: v.optional(v.number()),
}).index("by_status_sort", ["status", "sortOrder"]);

const itemsTable = defineTable({
  name: v.string(),
  slug: v.string(),
  sku: v.string(),
  description: v.string(),

  brandId: v.id("brands"),
  categoryId: v.id("categories"), // Исправлено на categories

  status: v.union(
    v.literal("active"),
    v.literal("draft"),
    v.literal("archived"),
    v.literal("preorder")
  ),

  price: v.number(),
  oldPrice: v.optional(v.number()),
  discountAmount: v.optional(v.number()),
  quantity: v.number(),
  
  imagesUrl: v.optional(v.array(v.string())),
  imageStorageIds: v.optional(v.array(v.id("_storage"))),

  documents: v.optional(v.array(v.object({
    name: v.string(),
    url: v.string(),
  }))),
  
  inStock: v.boolean(),
  specifications: v.optional(
    v.record(
      v.string(),
      v.union(v.string(), v.number(), v.boolean())
    )
  ),
  ordersCount: v.number(),
  labels: v.optional(v.array(v.string())),
  searchText: v.string(),
})
  .searchIndex("search_main", {
    searchField: "searchText",
    filterFields: ["categoryId", "brandId", "status", "inStock"],
  })
  .index("by_orders", ["status", "ordersCount"])
  .index("by_category_price", ["categoryId", "status", "price"])
  .index("by_category_orders", ["categoryId", "status", "ordersCount"])
  // Сортировка по времени создания (by creation time) работает автоматически
  .index("by_category_created", ["categoryId", "status"]) 
  .index("by_category_discount", ["categoryId", "status", "discountAmount"])
  .index("by_slug", ["slug"])
  .index("by_brand_status", ["status", "brandId"])
  .index("by_status", ["status"]);

const categoryTable = defineTable({
  name: v.string(),
  slug: v.string(),
  parentId: v.optional(v.id("categories")),
  level: v.number(),
  order: v.number(),

  icon: v.optional(v.string()),
  imagesUrl: v.optional(v.string()),
  imageStorageIds: v.optional(v.id("_storage")),
  description: v.optional(v.string()),

  isVisible: v.boolean()
})
  .searchIndex("search_name", { searchField: "name" })
  .index("by_parent_order", ["parentId", "order"])
  .index("by_slug", ["slug"]);

const cartsTable = defineTable({
  userId: v.optional(v.id("users")),
  sessionId: v.optional(v.string()),

  status: v.union(
    v.literal("active"),
    v.literal("checkout"),
    v.literal("locked"),
    v.literal("completed"),
    v.literal("merged"),
    v.literal("archived")
  ),

  updatedAt: v.number(),
})
  .index("by_status_time", ["status", "updatedAt"])
  .index("by_sessionId", ["sessionId", "status"])
  .index("by_userId", ["userId", "status"]);

const cartItemsTable = defineTable({
  cartId: v.id("carts"),
  itemId: v.id("items"),
  quantity: v.number(),
})
  .index("by_cart_added", ["cartId"]) // Сортировка по порядку добавления (_creationTime)
  .index("by_cart_item", ["cartId", "itemId"]);

const ordersTable = defineTable({
  userId: v.optional(v.id("users")), // Сделал optional (заказ без регистрации)
  cartId: v.optional(v.id("carts")),

  publicNumber: v.number(),

  clientName: v.string(),
  clientPhone: v.string(),
  clientEmail: v.optional(v.string()),

  deliveryType: v.union(
    v.literal("pickup"),
    v.literal("courier"),
    v.literal("transport")
  ),
  address: v.optional(v.object({
    city: v.string(),
    street: v.string(),
    details: v.optional(v.string()),
  })),
  deliveryPrice: v.number(),

  paymentMethod: v.union(
    v.literal("card_online"),
    v.literal("cash_on_delivery"),
    v.literal("card_on_delivery"),
    v.literal("b2b_invoice")
  ),
  paymentStatus: v.union(
    v.literal("pending"),
    v.literal("paid"),
    v.literal("failed"),
    v.literal("refunded")
  ),

  itemsTotal: v.number(),
  totalAmount: v.number(),

  status: v.union(
    v.literal("new"),
    v.literal("confirmed"),
    v.literal("processing"),
    v.literal("shipping"),
    v.literal("done"),
    v.literal("canceled")
  ),

  managerId: v.optional(v.id("users")),
  comment: v.optional(v.string()),
  managerNote: v.optional(v.string()),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_status_date", ["status"])
  .index("by_publicNumber", ["publicNumber"])
  .index("by_manager", ["managerId", "status"]);

const orderItemsTable = defineTable({
  orderId: v.id("orders"),
  itemId: v.optional(v.id("items")),
  name: v.string(),
  sku: v.string(),
  price: v.number(),
  quantity: v.number(),
})
  .index("by_order", ["orderId"]);

const leadsTable = defineTable({
  name: v.string(),
  phone: v.string(),
  email: v.optional(v.string()),

  type: v.union(
    v.literal("callback"),
    v.literal("product_question"),
    v.literal("project_calculation"),
    v.literal("installation")
  ),

  relatedItemId: v.optional(v.id("items")),
  message: v.optional(v.string()),

  status: v.union(
    v.literal("new"),
    v.literal("processing"),
    v.literal("success"),
    v.literal("failed")
  ),
  
  publicAnswer: v.optional(v.string()),
  isPublished: v.optional(v.boolean()),
  publicQuestion: v.optional(v.string()),
  
  assignedManagerId: v.optional(v.id("users")),
  managerNote: v.optional(v.string()),
  updatedAt: v.number(),
})
  .index("by_status_date", ["status"])
  .index("by_manager_status", ["assignedManagerId", "status"])
  .index("by_item", ["relatedItemId"]);

const reviewsTable = defineTable({
  itemId: v.id("items"),
  userId: v.optional(v.id("users")), // Optional для гостей

  authorName: v.string(), // Имя автора (или "Аноним")

  rating: v.number(),
  text: v.optional(v.string()),
  pros: v.optional(v.string()),
  cons: v.optional(v.string()),

  imagesUrl: v.optional(v.array(v.string())),
  imageStorageIds: v.optional(v.array(v.id("_storage"))),

  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  ),

  reply: v.optional(v.string()),
  replyDate: v.optional(v.number()),
})
  .index("by_item_status", ["itemId", "status"]) // Сортировка по _creationTime автоматическая
  .index("by_status", ["status"])
  .index("by_user", ["userId"]);

export default defineSchema({
  users: usersTable,
  brands: brandTable,
  items: itemsTable,
  categories: categoryTable, // Исправлено название таблицы на categories
  carts: cartsTable,
  cartItems: cartItemsTable,
  orders: ordersTable,
  orderItems: orderItemsTable,
  leads: leadsTable,
  reviews: reviewsTable
}, {
  schemaValidation: false
});