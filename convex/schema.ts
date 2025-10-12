import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    phone: v.string(),
  }),
  items: defineTable({
    name: v.string(),
    image: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    quantity: v.number(),
    price: v.number(),
    description: v.string(),
    rating: v.optional(v.number()),
    orders: v.optional(v.number()),
    category: v.optional(v.id("categorys")),
    sale: v.optional(v.number()),
  })
    .index("by_orders", ["orders"])
    .index("by_category", ["category"])
    .index("by_sale", ["sale"])
    .index("by_category_orders", ["category", "orders"])
    .index("by_category_sale", ["category", "sale"]),
  categorys: defineTable({
    name: v.string(),
  }),
  cart: defineTable({
    userId: v.id("users"),
    itemId: v.id("items"),
    quantity: v.number(),
  }),
  orders: defineTable({
    userId: v.id("users"),
    itemId: v.array(v.id("items")),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
    ),
    total: v.number(),
  }),
});
