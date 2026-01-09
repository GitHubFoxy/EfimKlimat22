import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get or create cart for session
export const getOrCreateCart = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    // Look for active cart for this session
    const existingCart = await ctx.db
      .query("carts")
      .withIndex("by_sessionId", (q) =>
        q.eq("sessionId", sessionId).eq("status", "active"),
      )
      .first();

    if (existingCart) {
      return existingCart._id;
    }

    // Create new cart
    const cartId = await ctx.db.insert("carts", {
      sessionId,
      status: "active",
      updatedAt: Date.now(),
    });
    return cartId;
  },
});

// Add item to cart
export const addItem = mutation({
  args: {
    sessionId: v.string(),
    itemId: v.id("items"),
    quantity: v.number(),
  },
  handler: async (ctx, { sessionId, itemId, quantity }) => {
    // Get or create cart
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_sessionId", (q) =>
        q.eq("sessionId", sessionId).eq("status", "active"),
      )
      .first();

    let cartId;
    if (!cart) {
      cartId = await ctx.db.insert("carts", {
        sessionId,
        status: "active",
        updatedAt: Date.now(),
      });
    } else {
      cartId = cart._id;
    }

    // Check if item already in cart
    const existingCartItem = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_item", (q) =>
        q.eq("cartId", cartId).eq("itemId", itemId),
      )
      .first();

    if (existingCartItem) {
      // Update quantity
      await ctx.db.patch(existingCartItem._id, {
        quantity: existingCartItem.quantity + quantity,
      });
    } else {
      // Add new item
      await ctx.db.insert("cartItems", {
        cartId,
        itemId,
        quantity,
      });
    }

    // Update cart timestamp
    await ctx.db.patch(cartId, { updatedAt: Date.now() });

    return { success: true };
  },
});

// Get cart items for session (used by HeaderCart.tsx)
export const listItems = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_sessionId", (q) =>
        q.eq("sessionId", sessionId).eq("status", "active"),
      )
      .first();

    if (!cart) {
      return {
        items: [],
        count: 0,
        subtotal: 0,
      };
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_added", (q) => q.eq("cartId", cart._id))
      .collect();

    // Fetch item details for each cart item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (cartItem) => {
        const item = await ctx.db.get(cartItem.itemId);
        if (!item) {
          return null;
        }
        return {
          _id: cartItem._id,
          cartId: cartItem.cartId,
          itemId: cartItem.itemId,
          quantity: cartItem.quantity,
          name: item.name,
          price: item.price,
          image: item.imagesUrl?.[0],
          sku: item.sku,
        };
      }),
    );

    const items = itemsWithDetails.filter((item) => item !== null);
    const subtotal = items.reduce(
      (sum, item) => sum + (item?.price || 0) * (item?.quantity || 0),
      0,
    );

    return {
      items,
      count: items.length,
      subtotal,
    };
  },
});

// Get legacy function for backward compatibility
export const getCartItems = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_sessionId", (q) =>
        q.eq("sessionId", sessionId).eq("status", "active"),
      )
      .first();

    if (!cart) {
      return [];
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_added", (q) => q.eq("cartId", cart._id))
      .collect();

    const itemsWithDetails = await Promise.all(
      cartItems.map(async (cartItem) => {
        const item = await ctx.db.get(cartItem.itemId);
        if (!item) {
          return null;
        }
        return {
          _id: cartItem._id,
          cartId: cartItem.cartId,
          itemId: cartItem.itemId,
          quantity: cartItem.quantity,
          name: item.name,
          price: item.price,
          image: item.imagesUrl?.[0],
          sku: item.sku,
        };
      }),
    );

    return itemsWithDetails.filter((item) => item !== null);
  },
});

// Remove item from cart
export const removeCartItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
  },
  handler: async (ctx, { cartItemId }) => {
    const cartItem = await ctx.db.get(cartItemId);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    await ctx.db.delete(cartItemId);

    // Update cart timestamp
    await ctx.db.patch(cartItem.cartId, { updatedAt: Date.now() });

    return { success: true };
  },
});

// Remove item from cart (API name used by HeaderCart.tsx)
export const removeItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
  },
  handler: async (ctx, { cartItemId }) => {
    const cartItem = await ctx.db.get(cartItemId);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    await ctx.db.delete(cartItemId);

    // Update cart timestamp
    await ctx.db.patch(cartItem.cartId, { updatedAt: Date.now() });

    return { success: true };
  },
});

// Update cart item quantity
export const updateCartItemQuantity = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, { cartItemId, quantity }) => {
    if (quantity <= 0) {
      // Delete instead
      await ctx.db.delete(cartItemId);
    } else {
      await ctx.db.patch(cartItemId, { quantity });
    }

    // Update cart timestamp
    const cartItem = await ctx.db.get(cartItemId);
    if (cartItem) {
      await ctx.db.patch(cartItem.cartId, { updatedAt: Date.now() });
    }

    return { success: true };
  },
});

// Update quantity (API name used by HeaderCart.tsx)
export const updateQty = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, { cartItemId, quantity }) => {
    if (quantity <= 0) {
      // Delete instead
      await ctx.db.delete(cartItemId);
    } else {
      await ctx.db.patch(cartItemId, { quantity });
    }

    // Update cart timestamp
    const cartItem = await ctx.db.get(cartItemId);
    if (cartItem) {
      await ctx.db.patch(cartItem.cartId, { updatedAt: Date.now() });
    }

    return { success: true };
  },
});

// Clear cart
export const clear = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_sessionId", (q) =>
        q.eq("sessionId", sessionId).eq("status", "active"),
      )
      .first();

    if (!cart) {
      return { success: true };
    }

    // Delete all cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_added", (q) => q.eq("cartId", cart._id))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    // Update cart timestamp
    await ctx.db.patch(cart._id, { updatedAt: Date.now() });

    return { success: true };
  },
});

// Get cart summary
export const get = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_sessionId", (q) =>
        q.eq("sessionId", sessionId).eq("status", "active"),
      )
      .first();

    if (!cart) {
      return null;
    }

    return {
      _id: cart._id,
      sessionId: cart.sessionId,
      userId: cart.userId,
      status: cart.status,
      updatedAt: cart.updatedAt,
    };
  },
});

// Merge anonymous session cart to authenticated user
export const mergeSessionCartToUser = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get session cart
    const sessionCart = await ctx.db
      .query("carts")
      .withIndex("by_sessionId", (q) =>
        q.eq("sessionId", sessionId).eq("status", "active"),
      )
      .first();

    if (!sessionCart) {
      return { success: true, merged: false };
    }

    // Get or create user cart
    let userCart = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .first();

    if (!userCart) {
      const userCartId = await ctx.db.insert("carts", {
        userId,
        status: "active",
        updatedAt: Date.now(),
      });
      userCart = await ctx.db.get(userCartId);
    }

    if (!userCart) {
      throw new Error("Failed to create user cart");
    }

    // Get session cart items
    const sessionCartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_added", (q) => q.eq("cartId", sessionCart._id))
      .collect();

    // Merge items into user cart
    for (const sessionItem of sessionCartItems) {
      const existingUserItem = await ctx.db
        .query("cartItems")
        .withIndex("by_cart_item", (q) =>
          q.eq("cartId", userCart!._id).eq("itemId", sessionItem.itemId),
        )
        .first();

      if (existingUserItem) {
        await ctx.db.patch(existingUserItem._id, {
          quantity: existingUserItem.quantity + sessionItem.quantity,
        });
      } else {
        await ctx.db.insert("cartItems", {
          cartId: userCart._id,
          itemId: sessionItem.itemId,
          quantity: sessionItem.quantity,
        });
      }

      await ctx.db.delete(sessionItem._id);
    }

    // Mark session cart as merged
    await ctx.db.patch(sessionCart._id, {
      status: "merged",
      updatedAt: Date.now(),
    });

    await ctx.db.patch(userCart._id, { updatedAt: Date.now() });

    return { success: true, merged: true };
  },
});

// Create order from cart
export const createOrder = mutation({
  args: {
    sessionId: v.string(),
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
    paymentMethod: v.union(
      v.literal("card_online"),
      v.literal("cash_on_delivery"),
      v.literal("card_on_delivery"),
      v.literal("b2b_invoice"),
    ),
    deliveryPrice: v.number(),
  },
  handler: async (
    ctx,
    {
      sessionId,
      clientName,
      clientPhone,
      clientEmail,
      deliveryType,
      address,
      paymentMethod,
      deliveryPrice,
    },
  ) => {
    // Get active cart for this session
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_sessionId", (q) =>
        q.eq("sessionId", sessionId).eq("status", "active"),
      )
      .first();

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Get all cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_added", (q) => q.eq("cartId", cart._id))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate totals
    let itemsTotal = 0;
    const orderItems: Array<{
      itemId: string;
      name: string;
      sku: string;
      price: number;
      quantity: number;
    }> = [];

    for (const cartItem of cartItems) {
      const item = await ctx.db.get(cartItem.itemId);
      if (!item) {
        throw new Error(`Item ${cartItem.itemId} not found`);
      }

      const itemTotal = (item as any).price * cartItem.quantity;
      itemsTotal += itemTotal;

      orderItems.push({
        itemId: String(cartItem.itemId),
        name: (item as any).name,
        sku: (item as any).sku,
        price: (item as any).price,
        quantity: cartItem.quantity,
      });
    }

    // Get next order number
    const lastOrder = await ctx.db.query("orders").order("desc").first();
    const nextPublicNumber = (lastOrder?.publicNumber ?? 0) + 1;

    // Create the order
    const orderId = await ctx.db.insert("orders", {
      cartId: cart._id,
      publicNumber: nextPublicNumber,
      clientName,
      clientPhone,
      clientEmail,
      deliveryType,
      address,
      paymentMethod,
      paymentStatus: "pending",
      itemsTotal,
      totalAmount: itemsTotal + deliveryPrice,
      deliveryPrice,
      status: "new",
      updatedAt: Date.now(),
    });

    // Create order items
    for (const item of orderItems) {
      await ctx.db.insert("orderItems", {
        orderId,
        itemId: item.itemId as any,
        name: item.name,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
      });
    }

    // Mark cart as completed
    await ctx.db.patch(cart._id, {
      status: "completed",
      updatedAt: Date.now(),
    });

    return {
      orderId,
      publicNumber: nextPublicNumber,
      totalAmount: itemsTotal + deliveryPrice,
    };
  },
});
