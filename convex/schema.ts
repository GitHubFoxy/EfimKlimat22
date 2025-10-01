import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    phone: v.string(),
  }),
  items: defineTable({
    name: v.string(),
    quantity: v.number(),
    price: v.number(),
    description: v.string(),
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
