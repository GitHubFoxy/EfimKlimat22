import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// export default defineSchema({
//   users: defineTable({
//     name: v.string(),
//     phone: v.string(),
//     password: v.optional(v.string()),
//     role: v.union(v.literal("user"), v.literal("manager"), v.literal("admin")),
//   })
//     .index("by_role", ["role"])
//     .index("by_phone", ["phone"]),
//   brands: defineTable({
//     name: v.string(),
//   }),
//   items: defineTable({
//     partNumber: v.optional(v.string()),
//     brand: v.optional(v.string()),
//     name: v.string(),
//     lowerCaseName: v.string(),
//     imagesUrls: v.optional(v.array(v.string())),
//     imageStorageIds: v.optional(v.array(v.id("_storage"))),
//     quantity: v.number(),
//     description: v.string(),
//     price: v.number(),
//     rating: v.optional(v.number()),
//     orders: v.optional(v.number()),
//     category: v.optional(v.id("categorys")),
//     sale: v.optional(v.number()),
//     variant: v.string(),
//     subcategory: v.optional(v.id("subcategorys")),
//     color: v.optional(v.string()),
//     collection: v.optional(v.string()),
//     tags: v.optional(v.array(v.string())),
//   })
//     .index("by_orders", ["orders"])
//     .index("by_category", ["category"])
//     .index("by_sale", ["sale"])
//     .index("by_category_orders", ["category", "orders"])
//     .index("by_category_sale", ["category", "sale"])
//     .index("by_lowercase_name", ["lowerCaseName"]),

//   categorys: defineTable({
//     name: v.string(),
//     order: v.number()
//   }),
//   subcategorys: defineTable({
//     parent: v.id("categorys"),
//     order: v.number(),
//     name: v.string(),
//   }).index("by_parent", ["parent"]),

//   carts: defineTable({
//     owner: v.optional(v.id("users")),
//     sessionId: v.optional(v.string()),
//     currency: v.string(),
//     status: v.union(
//       v.literal("active"),
//       v.literal("ordered"),
//       v.literal("abandoned"),
//     ),
//     updatedAt: v.optional(v.number()),
//   })
//     .index("by_owner", ["owner"])
//     .index("by_sessionId", ["sessionId"]),
//   cart_items: defineTable({
//     cartId: v.id("carts"),
//     itemId: v.id("items"),
//     name: v.string(),
//     image: v.optional(v.string()),
//     price: v.number(),
//     quantity: v.number(),
//     variant: v.optional(v.string()),
//     updatedAt: v.optional(v.number()),
//   }).index("by_cartId", ["cartId"]),
//   // Bridge table for fast reads: items linked to category and its ancestors
//   category_items: defineTable({
//     categoryId: v.id("categorys"),
//     itemId: v.id("items"),
//   })
//     .index("by_category", ["categoryId"])
//     .index("by_item", ["itemId"]),
//   orders: defineTable({
//     userId: v.id("users"),
//     updatedAt: v.optional(v.number()),
//     assignedManager: v.optional(v.id("users")),
//     itemId: v.array(v.id("items")),
//     status: v.union(
//       v.literal("pending"),
//       v.literal("processing"),
//       v.literal("done"),
//     ),
//     total: v.number(),
//   })
//     .index("by_status", ["status"])
//     .index("by_status_and_updatedAt", ["status", "updatedAt"])
//     .index("by_assignedManager", ["assignedManager"])
//     .index("by_assignedManager_status_updatedAt", [
//       "assignedManager",
//       "status",
//       "updatedAt",
//     ]),
//   consultants: defineTable({
//     name: v.string(),
//     phone: v.string(),
//     message: v.optional(v.string()),
//     status: v.union(
//       v.literal("new"),
//       v.literal("processing"),
//       v.literal("done"),
//     ),
//     assignedManager: v.optional(v.id("users")),
//     updatedAt: v.optional(v.number()),
//   })
//     .index("by_status", ["status"])
//     .index("by_assignedManager", ["assignedManager"])
//     .index("by_assignedManager_status_updatedAt", [
//       "assignedManager",
//       "status",
//       "updatedAt",
//     ]),
// });

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
    imageStorageIds: v.optional(v.id("_storage")),
  
    // Role: user, manager, or admin
    role: v.optional(
      v.union(v.literal("user"), v.literal("manager"), v.literal("admin")),
    ),
  
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
  
    status: v.optional(v.union(v.literal("active"), v.literal("blocked"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]);
  
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
    categoryId: v.id("categories"),
  
    status: v.union(
      v.literal("active"),
      v.literal("draft"),
      v.literal("archived"),
      v.literal("preorder"),
    ),
  
    price: v.number(),
    oldPrice: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    quantity: v.number(),
  
    imagesUrl: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
  
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
  
    isVisible: v.boolean(),
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
      v.literal("archived"),
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
    .index("by_cart_added", ["cartId"])
    .index("by_cart_item", ["cartId", "itemId"]);
  
  const ordersTable = defineTable({
    userId: v.optional(v.id("users")),
    cartId: v.optional(v.id("carts")),
  
    publicNumber: v.number(),
  
    clientName: v.string(),
    clientPhone: v.string(),
    clientEmail: v.optional(v.string()),
  
    deliveryType: v.union(
      v.literal("pickup"),
      v.literal("courier"),
      v.literal("transport"),
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
      v.literal("card_online"),
      v.literal("cash_on_delivery"),
      v.literal("card_on_delivery"),
      v.literal("b2b_invoice"),
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
  
    itemsTotal: v.number(),
    totalAmount: v.number(),
  
    status: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipping"),
      v.literal("done"),
      v.literal("canceled"),
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
  }).index("by_order", ["orderId"]);
  
  const leadsTable = defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
  
    type: v.union(
      v.literal("callback"),
      v.literal("product_question"),
      v.literal("project_calculation"),
      v.literal("installation"),
    ),
  
    relatedItemId: v.optional(v.id("items")),
    message: v.optional(v.string()),
  
    status: v.union(
      v.literal("new"),
      v.literal("processing"),
      v.literal("success"),
      v.literal("failed"),
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
    userId: v.optional(v.id("users")),
  
    authorName: v.string(),
  
    rating: v.number(),
    text: v.optional(v.string()),
    pros: v.optional(v.string()),
    cons: v.optional(v.string()),
  
    imagesUrl: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
  
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  
    reply: v.optional(v.string()),
    replyDate: v.optional(v.number()),
  })
    .index("by_item_status", ["itemId", "status"])
    .index("by_status", ["status"])
    .index("by_user", ["userId"]);
  
  export default defineSchema(
    {
      ...authTables,
      users: usersTable,
      brands: brandTable,
      items: itemsTable,
      categories: categoryTable,
      carts: cartsTable,
      cartItems: cartItemsTable,
      orders: ordersTable,
      orderItems: orderItemsTable,
      leads: leadsTable,
      reviews: reviewsTable,
    },
    {
      schemaValidation: false,
    },
  );
  