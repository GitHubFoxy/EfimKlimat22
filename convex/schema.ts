import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    phone: v.string(),
    password: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("manager"), v.literal("admin")),
  })
    .index("by_role", ["role"])
    .index("by_phone", ["phone"]),
  brands: defineTable({
    name: v.string(),
  }),
  items: defineTable({
    partNumber: v.optional(v.string()),
    brand: v.optional(v.string()),
    name: v.string(),
    lowerCaseName: v.string(),
    imagesUrls: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    quantity: v.number(),
    description: v.string(),
    price: v.number(),
    rating: v.optional(v.number()),
    orders: v.optional(v.number()),
    category: v.optional(v.id("categorys")),
    sale: v.optional(v.number()),
    variant: v.string(),
    subcategory: v.optional(v.string()),
    color: v.optional(v.string()),
    collection: v.optional(v.string()),
  })
    .index("by_orders", ["orders"])
    .index("by_category", ["category"])
    .index("by_sale", ["sale"])
    .index("by_category_orders", ["category", "orders"])
    .index("by_category_sale", ["category", "sale"])
    .index("by_lowercase_name", ["lowerCaseName"]),
  categorys: defineTable({
    name: v.string(),
  }),
  subcategorys: defineTable({
    parent: v.id("categorys"),
    name: v.string(),
  }).index("by_parent", ["parent"]),

  carts: defineTable({
    owner: v.optional(v.id("users")),
    sessionId: v.optional(v.string()),
    currency: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("ordered"),
      v.literal("abandoned"),
    ),
    updatedAt: v.optional(v.number()),
  })
    .index("by_owner", ["owner"])
    .index("by_sessionId", ["sessionId"]),
  cart_items: defineTable({
    cartId: v.id("carts"),
    itemId: v.id("items"),
    name: v.string(),
    image: v.optional(v.string()),
    price: v.number(),
    quantity: v.number(),
    variant: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }).index("by_cartId", ["cartId"]),
  // Bridge table for fast reads: items linked to category and its ancestors
  category_items: defineTable({
    categoryId: v.id("categorys"),
    itemId: v.id("items"),
  })
    .index("by_category", ["categoryId"])
    .index("by_item", ["itemId"]),
  orders: defineTable({
    userId: v.id("users"),
    updatedAt: v.optional(v.number()),
    assignedManager: v.optional(v.id("users")),
    itemId: v.array(v.id("items")),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
    ),
    total: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_status_and_updatedAt", ["status", "updatedAt"])
    .index("by_assignedManager", ["assignedManager"])
    .index("by_assignedManager_status_updatedAt", [
      "assignedManager",
      "status",
      "updatedAt",
    ]),
  consultants: defineTable({
    name: v.string(),
    phone: v.string(),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("processing"),
      v.literal("done"),
    ),
    assignedManager: v.optional(v.id("users")),
    updatedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_assignedManager", ["assignedManager"])
    .index("by_assignedManager_status_updatedAt", [
      "assignedManager",
      "status",
      "updatedAt",
    ]),
});
