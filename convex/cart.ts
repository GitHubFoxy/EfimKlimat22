import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helpers
// Write-capable helper: ONLY use inside mutations
async function getOrCreateActiveCartBySession(ctx: any, sessionId: string) {
  const now = Date.now();
  let cart = await ctx.db
    .query("carts")
    .withIndex("by_sessionId", (q: any) => q.eq("sessionId", sessionId))
    .first();
  if (!cart) {
    const cartId = await ctx.db.insert("carts", {
      owner: undefined,
      sessionId,
      currency: "RUB",
      status: "active",
      updatedAt: now,
    });
    cart = await ctx.db.get(cartId);
  }
  return cart;
}

// Read-only helper: safe to use inside queries
async function getActiveCartBySession(ctx: any, sessionId: string) {
  return await ctx.db
    .query("carts")
    .withIndex("by_sessionId", (q: any) => q.eq("sessionId", sessionId))
    .first();
}

async function getActiveCartByOwner(ctx: any, owner: string) {
  return await ctx.db
    .query("carts")
    .withIndex("by_owner", (q: any) => q.eq("owner", owner))
    .first();
}

export const createIfMissing = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const cart = await getOrCreateActiveCartBySession(ctx, sessionId);
    return cart?._id;
  },
});

export const addItem = mutation({
  args: {
    sessionId: v.string(),
    itemId: v.id("items"),
    quantity: v.optional(v.number()),
    variant: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, itemId, quantity = 1, variant }) => {
    const now = Date.now();
    const cart = await getOrCreateActiveCartBySession(ctx, sessionId);
    if (!cart) throw new Error("Failed to create cart");

    // Fetch item details
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Item not found");

    // Check if item already exists in cart
    const existingItems = await ctx.db
      .query("cart_items")
      .withIndex("by_cartId", (q: any) => q.eq("cartId", cart._id))
      .collect();

    const existingItem = existingItems.find(
      (ci: any) =>
        ci.itemId === itemId &&
        (variant ? ci.variant === variant : !ci.variant),
    );

    if (existingItem) {
      // Update quantity
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + quantity,
        updatedAt: now,
      });
      return { status: 200, cartItemId: existingItem._id };
    } else {
      // Create new cart item
      const cartItemId = await ctx.db.insert("cart_items", {
        cartId: cart._id,
        itemId,
        name: item.name || "",
        image: item.imagesUrls?.[0] || undefined,
        price: item.price || 0,
        quantity,
        variant,
        updatedAt: now,
      });
      return { status: 200, cartItemId };
    }
  },
});

export const listItems = query({
  args: { sessionId: v.optional(v.string()), owner: v.optional(v.id("users")) },
  handler: async (ctx, { sessionId, owner }) => {
    let cart: any | null = null;
    if (owner) {
      cart = await getActiveCartByOwner(ctx, owner);
    } else if (sessionId) {
      cart = await getActiveCartBySession(ctx, sessionId);
    }
    if (!cart) return { items: [], subtotal: 0, count: 0 };
    const items = await ctx.db
      .query("cart_items")
      .withIndex("by_cartId", (q: any) => q.eq("cartId", cart._id))
      .collect();
    const subtotal = items.reduce(
      (sum: number, it: any) => sum + it.price * it.quantity,
      0,
    );
    const count = items.reduce((sum: number, it: any) => sum + it.quantity, 0);
    return { items, subtotal, count, currency: cart.currency };
  },
});

export const get = query({
  args: { sessionId: v.optional(v.string()), owner: v.optional(v.id("users")) },
  handler: async (ctx, { sessionId, owner }) => {
    let cart: any | null = null;
    if (owner) {
      cart = await getActiveCartByOwner(ctx, owner);
    } else if (sessionId) {
      cart = await getActiveCartBySession(ctx, sessionId);
    }
    if (!cart)
      return {
        subtotal: 0,
        total: 0,
        discounts: 0,
        shipping: 0,
        tax: 0,
        currency: "RUB",
      };
    const items = await ctx.db
      .query("cart_items")
      .withIndex("by_cartId", (q: any) => q.eq("cartId", cart._id))
      .collect();
    const subtotal = items.reduce(
      (sum: number, it: any) => sum + it.price * it.quantity,
      0,
    );
    const discounts = 0;
    const shipping = 0;
    const tax = 0;
    const total = subtotal - discounts + shipping + tax;
    return {
      subtotal,
      total,
      discounts,
      shipping,
      tax,
      currency: cart.currency,
    };
  },
});

export const updateQty = mutation({
  args: { cartItemId: v.id("cart_items"), quantity: v.number() },
  handler: async (ctx, { cartItemId, quantity }) => {
    if (quantity <= 0) {
      await ctx.db.delete(cartItemId);
      return { status: 200 };
    }
    await ctx.db.patch(cartItemId, { quantity, updatedAt: Date.now() });
    return { status: 200 };
  },
});

export const removeItem = mutation({
  args: { cartItemId: v.id("cart_items") },
  handler: async (ctx, { cartItemId }) => {
    await ctx.db.delete(cartItemId);
    return { status: 200 };
  },
});

export const clear = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const cart = await getOrCreateActiveCartBySession(ctx, sessionId);
    const items = await ctx.db
      .query("cart_items")
      .withIndex("by_cartId", (q: any) => q.eq("cartId", cart._id))
      .collect();
    for (const it of items) {
      await ctx.db.delete(it._id);
    }
    await ctx.db.patch(cart._id, { updatedAt: Date.now() });
    return { status: 200 };
  },
});

// Create an order from the current cart (by sessionId) and clear the cart
export const createOrder = mutation({
  args: {
    sessionId: v.string(),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    comment: v.optional(v.string()),
  },
  returns: v.object({ orderId: v.id("orders") }),
  handler: async (ctx, { sessionId, name, phone }) => {
    const now = Date.now();
    // Ensure cart exists and load items
    const cart = await getOrCreateActiveCartBySession(ctx, sessionId);
    const items = await ctx.db
      .query("cart_items")
      .withIndex("by_cartId", (q: any) => q.eq("cartId", cart._id))
      .collect();

    if (!items || items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Find or create user by phone
    let user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q: any) => q.eq("phone", phone))
      .first();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        name,
        phone,
        password: undefined,
        role: "user",
      });
      user = await ctx.db.get(userId);
    }

    // Compute total and item ids
    const itemIds = items.map((it: any) => it.itemId);
    const total = items.reduce(
      (sum: number, it: any) => sum + it.price * it.quantity,
      0,
    );

    // Create order in "pending" status
    const orderId = await ctx.db.insert("orders", {
      userId: user!._id,
      updatedAt: now,
      assignedManager: undefined,
      itemId: itemIds,
      status: "pending",
      total,
    });

    // Clear cart items and mark cart as ordered
    for (const it of items) {
      await ctx.db.delete(it._id);
    }
    await ctx.db.patch(cart._id, { status: "ordered", updatedAt: now });

    return { orderId };
  },
});

export const mergeAnonymousIntoUserCart = mutation({
  args: { sessionId: v.string(), userId: v.id("users") },
  handler: async (ctx, { sessionId, userId }) => {
    // Load anonymous cart or create
    const anonCartDoc = await getOrCreateActiveCartBySession(ctx, sessionId);
    // Load or create user cart
    let userCart = await getActiveCartByOwner(ctx, userId);
    const now = Date.now();
    if (!userCart) {
      const id = await ctx.db.insert("carts", {
        owner: userId,
        sessionId: undefined,
        currency: "RUB",
        status: "active",
        updatedAt: now,
      });
      userCart = await ctx.db.get(id);
    }
    if (anonCartDoc) {
      const anonItems = await ctx.db
        .query("cart_items")
        .withIndex("by_cartId", (q: any) => q.eq("cartId", anonCartDoc._id))
        .collect();
      const userItems = await ctx.db
        .query("cart_items")
        .withIndex("by_cartId", (q: any) => q.eq("cartId", userCart._id))
        .collect();
      for (const it of anonItems) {
        const match = userItems.find(
          (ui: any) => ui.itemId === it.itemId && ui.variant === it.variant,
        );
        if (match) {
          await ctx.db.patch(match._id, {
            quantity: match.quantity + it.quantity,
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("cart_items", {
            cartId: userCart._id,
            itemId: it.itemId,
            name: it.name,
            image: it.image,
            price: it.price,
            quantity: it.quantity,
            variant: it.variant,
            updatedAt: now,
          });
        }
        await ctx.db.delete(it._id);
      }
      await ctx.db.patch(userCart._id, { updatedAt: now });
      await ctx.db.patch(anonCartDoc._id, {
        status: "abandoned",
        updatedAt: now,
      });
    }
    return { status: 200 };
  },
});

export const reprice = mutation({
  args: { cartId: v.id("carts") },
  handler: async (ctx, { cartId }) => {
    const cart = await ctx.db.get(cartId);
    if (!cart) throw new Error("Cart not found");
    const items = await ctx.db
      .query("cart_items")
      .withIndex("by_cartId", (q: any) => q.eq("cartId", cartId))
      .collect();
    // For each item, re-sync price from current catalog
    for (const it of items) {
      const product = await ctx.db.get(it.itemId);
      if (product) {
        await ctx.db.patch(it._id, {
          price: product.price,
          updatedAt: Date.now(),
        });
      }
    }
    return { status: 200 };
  },
});