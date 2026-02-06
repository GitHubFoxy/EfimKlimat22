import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { type MutationCtx, mutation, query } from './_generated/server'
import { verifyCartItemOwnership } from './authHelpers'
import {
  validateAddress,
  validateCartQuantity,
  validateCartQuantityUpdate,
  validateDeliveryPrice,
  validateEmail,
  validateMessage,
  validateName,
  validatePhone,
  validateSessionId,
} from './validation'

type DeliveryType = 'pickup' | 'courier' | 'transport'

const DELIVERY_PRICE_BY_TYPE: Record<DeliveryType, number> = {
  pickup: 0,
  courier: 0,
  transport: 0,
}

const ORDER_RECOVERY_CART_STATUSES = [
  'checkout',
  'locked',
  'completed',
] as const
const ORDER_IDEMPOTENCY_WINDOW_MS = 10 * 60 * 1000

function computeDeliveryPrice(deliveryType: DeliveryType): number {
  return DELIVERY_PRICE_BY_TYPE[deliveryType]
}

function toCreateOrderResult(order: Doc<'orders'>) {
  return {
    orderId: order._id,
    publicNumber: order.publicNumber,
    totalAmount: order.totalAmount,
  }
}

async function getSessionCartByStatus(
  ctx: MutationCtx,
  sessionId: string,
  status: Doc<'carts'>['status'],
): Promise<Doc<'carts'> | null> {
  return await ctx.db
    .query('carts')
    .withIndex('by_sessionId', (q) =>
      q.eq('sessionId', sessionId).eq('status', status),
    )
    .order('desc')
    .first()
}

async function findOrderByCartId(
  ctx: MutationCtx,
  cartId: Id<'carts'>,
): Promise<Doc<'orders'> | null> {
  return await ctx.db
    .query('orders')
    .withIndex('by_cartId', (q) => q.eq('cartId', cartId))
    .order('desc')
    .first()
}

async function findRecoverableOrderForSession(
  ctx: MutationCtx,
  sessionId: string,
): Promise<Doc<'orders'> | null> {
  for (const status of ORDER_RECOVERY_CART_STATUSES) {
    const cart = await getSessionCartByStatus(ctx, sessionId, status)
    if (!cart) {
      continue
    }
    if (Date.now() - cart.updatedAt > ORDER_IDEMPOTENCY_WINDOW_MS) {
      continue
    }

    const existingOrder = await findOrderByCartId(ctx, cart._id)
    if (existingOrder) {
      return existingOrder
    }
  }

  return null
}

async function generatePublicOrderNumber(ctx: MutationCtx): Promise<number> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate =
      Date.now() * 4096 + Math.floor(Math.random() * 4096) + attempt
    const existing = await ctx.db
      .query('orders')
      .withIndex('by_publicNumber', (q) => q.eq('publicNumber', candidate))
      .first()

    if (!existing) {
      return candidate
    }
  }

  throw new Error('Failed to generate unique order number')
}

// Get or create cart for session
export const getOrCreateCart = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    validateSessionId(sessionId)

    // Look for active cart for this session
    const existingCart = await ctx.db
      .query('carts')
      .withIndex('by_sessionId', (q) =>
        q.eq('sessionId', sessionId).eq('status', 'active'),
      )
      .first()

    if (existingCart) {
      return existingCart._id
    }

    // Create new cart
    const cartId = await ctx.db.insert('carts', {
      sessionId,
      status: 'active',
      updatedAt: Date.now(),
    })
    return cartId
  },
})

// Add item to cart
export const addItem = mutation({
  args: {
    sessionId: v.string(),
    itemId: v.id('items'),
    quantity: v.number(),
  },
  handler: async (ctx, { sessionId, itemId, quantity }) => {
    validateSessionId(sessionId)
    validateCartQuantity(quantity)

    const item = await ctx.db.get(itemId)
    if (!item) {
      throw new Error('Item not found')
    }
    if (item.status !== 'active' || !item.inStock) {
      throw new Error('Item is not orderable')
    }
    if (item.quantity >= 0 && quantity > item.quantity) {
      throw new Error('Requested quantity exceeds available stock')
    }

    // Get or create cart
    const cart = await ctx.db
      .query('carts')
      .withIndex('by_sessionId', (q) =>
        q.eq('sessionId', sessionId).eq('status', 'active'),
      )
      .first()

    let cartId
    if (!cart) {
      cartId = await ctx.db.insert('carts', {
        sessionId,
        status: 'active',
        updatedAt: Date.now(),
      })
    } else {
      cartId = cart._id
    }

    // Check if item already in cart
    const existingCartItem = await ctx.db
      .query('cartItems')
      .withIndex('by_cart_item', (q) =>
        q.eq('cartId', cartId).eq('itemId', itemId),
      )
      .first()

    if (existingCartItem) {
      // Update quantity
      const nextQuantity = existingCartItem.quantity + quantity
      validateCartQuantity(nextQuantity)
      if (item.quantity >= 0 && nextQuantity > item.quantity) {
        throw new Error('Requested quantity exceeds available stock')
      }
      await ctx.db.patch(existingCartItem._id, {
        quantity: nextQuantity,
      })
    } else {
      // Add new item
      await ctx.db.insert('cartItems', {
        cartId,
        itemId,
        quantity,
      })
    }

    // Update cart timestamp
    await ctx.db.patch(cartId, { updatedAt: Date.now() })

    return { success: true }
  },
})

// Get cart items for session (used by HeaderCart.tsx)
export const listItems = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const cart = await ctx.db
      .query('carts')
      .withIndex('by_sessionId', (q) =>
        q.eq('sessionId', sessionId).eq('status', 'active'),
      )
      .first()

    if (!cart) {
      return {
        items: [],
        count: 0,
        subtotal: 0,
      }
    }

    const cartItems = await ctx.db
      .query('cartItems')
      .withIndex('by_cart_added', (q) => q.eq('cartId', cart._id))
      .collect()

    // Fetch item details for each cart item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (cartItem) => {
        if (!cartItem.itemId) {
          return null
        }
        const item = await ctx.db.get(cartItem.itemId)
        if (!item) {
          return null
        }
        if (!('name' in item) || !('price' in item) || !('sku' in item)) {
          return null
        }
        return {
          _id: cartItem._id,
          cartId: cartItem.cartId,
          itemId: cartItem.itemId,
          quantity: cartItem.quantity,
          name: item.name as string,
          price: item.price as number,
          image: ('imagesUrl' in item && item.imagesUrl?.[0]) || undefined,
          sku: item.sku as string,
        }
      }),
    )

    const items = itemsWithDetails.filter((item) => item !== null)
    const subtotal = items.reduce(
      (sum, item) => sum + (item?.price || 0) * (item?.quantity || 0),
      0,
    )

    return {
      items,
      count: items.length,
      subtotal,
    }
  },
})

// Get legacy function for backward compatibility
export const getCartItems = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const cart = await ctx.db
      .query('carts')
      .withIndex('by_sessionId', (q) =>
        q.eq('sessionId', sessionId).eq('status', 'active'),
      )
      .first()

    if (!cart) {
      return []
    }

    const cartItems = await ctx.db
      .query('cartItems')
      .withIndex('by_cart_added', (q) => q.eq('cartId', cart._id))
      .collect()

    const itemsWithDetails = await Promise.all(
      cartItems.map(async (cartItem) => {
        if (!cartItem.itemId) {
          return null
        }
        const item = await ctx.db.get(cartItem.itemId)
        if (!item) {
          return null
        }
        if (!('name' in item) || !('price' in item) || !('sku' in item)) {
          return null
        }
        return {
          _id: cartItem._id,
          cartId: cartItem.cartId,
          itemId: cartItem.itemId,
          quantity: cartItem.quantity,
          name: item.name as string,
          price: item.price as number,
          image: ('imagesUrl' in item && item.imagesUrl?.[0]) || undefined,
          sku: item.sku as string,
        }
      }),
    )

    return itemsWithDetails.filter((item) => item !== null)
  },
})

// Remove item from cart
export const removeCartItem = mutation({
  args: {
    cartItemId: v.id('cartItems'),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { cartItemId, sessionId }) => {
    const { cartItem, cart } = await verifyCartItemOwnership(
      ctx,
      cartItemId,
      sessionId,
    )

    await ctx.db.delete(cartItemId)

    if (cart._id) {
      await ctx.db.patch(cart._id, { updatedAt: Date.now() })
    }

    return { success: true }
  },
})

// Remove item from cart (API name used by HeaderCart.tsx)
export const removeItem = mutation({
  args: {
    cartItemId: v.id('cartItems'),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { cartItemId, sessionId }) => {
    const { cartItem, cart } = await verifyCartItemOwnership(
      ctx,
      cartItemId,
      sessionId,
    )

    await ctx.db.delete(cartItemId)

    if (cart._id) {
      await ctx.db.patch(cart._id, { updatedAt: Date.now() })
    }

    return { success: true }
  },
})

// Update cart item quantity
export const updateCartItemQuantity = mutation({
  args: {
    cartItemId: v.id('cartItems'),
    quantity: v.number(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { cartItemId, quantity, sessionId }) => {
    validateCartQuantityUpdate(quantity)

    const { cartItem, cart } = await verifyCartItemOwnership(
      ctx,
      cartItemId,
      sessionId,
    )

    if (quantity === 0) {
      await ctx.db.delete(cartItemId)
    } else {
      await ctx.db.patch(cartItemId, { quantity })
    }

    if (cart._id) {
      await ctx.db.patch(cart._id, { updatedAt: Date.now() })
    }

    return { success: true }
  },
})

// Update quantity (API name used by HeaderCart.tsx)
export const updateQty = mutation({
  args: {
    cartItemId: v.id('cartItems'),
    quantity: v.number(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { cartItemId, quantity, sessionId }) => {
    validateCartQuantityUpdate(quantity)

    const { cartItem, cart } = await verifyCartItemOwnership(
      ctx,
      cartItemId,
      sessionId,
    )

    if (quantity === 0) {
      await ctx.db.delete(cartItemId)
    } else {
      await ctx.db.patch(cartItemId, { quantity })
    }

    if (cart._id) {
      await ctx.db.patch(cart._id, { updatedAt: Date.now() })
    }

    return { success: true }
  },
})

// Clear cart
export const clear = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    validateSessionId(sessionId)

    const cart = await ctx.db
      .query('carts')
      .withIndex('by_sessionId', (q) =>
        q.eq('sessionId', sessionId).eq('status', 'active'),
      )
      .first()

    if (!cart) {
      return { success: true }
    }

    // Delete all cart items
    const cartItems = await ctx.db
      .query('cartItems')
      .withIndex('by_cart_added', (q) => q.eq('cartId', cart._id))
      .collect()

    for (const item of cartItems) {
      await ctx.db.delete(item._id)
    }

    // Update cart timestamp
    await ctx.db.patch(cart._id, { updatedAt: Date.now() })

    return { success: true }
  },
})

// Get cart summary
export const get = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const cart = await ctx.db
      .query('carts')
      .withIndex('by_sessionId', (q) =>
        q.eq('sessionId', sessionId).eq('status', 'active'),
      )
      .first()

    if (!cart) {
      return null
    }

    return {
      _id: cart._id,
      sessionId: cart.sessionId,
      userId: cart.userId,
      status: cart.status,
      updatedAt: cart.updatedAt,
    }
  },
})

// Merge anonymous session cart to authenticated user
export const mergeSessionCartToUser = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    validateSessionId(sessionId)

    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    // Get session cart
    const sessionCart = await ctx.db
      .query('carts')
      .withIndex('by_sessionId', (q) =>
        q.eq('sessionId', sessionId).eq('status', 'active'),
      )
      .first()

    if (!sessionCart) {
      return { success: true, merged: false }
    }

    // Get or create user cart
    let userCart = await ctx.db
      .query('carts')
      .withIndex('by_userId', (q) =>
        q.eq('userId', userId).eq('status', 'active'),
      )
      .first()

    if (!userCart) {
      const userCartId = await ctx.db.insert('carts', {
        userId,
        status: 'active',
        updatedAt: Date.now(),
      })
      userCart = await ctx.db.get(userCartId)
    }

    if (!userCart) {
      throw new Error('Failed to create user cart')
    }

    // Get session cart items
    const sessionCartItems = await ctx.db
      .query('cartItems')
      .withIndex('by_cart_added', (q) => q.eq('cartId', sessionCart._id))
      .collect()

    // Merge items into user cart
    for (const sessionItem of sessionCartItems) {
      const existingUserItem = await ctx.db
        .query('cartItems')
        .withIndex('by_cart_item', (q) =>
          q.eq('cartId', userCart!._id).eq('itemId', sessionItem.itemId),
        )
        .first()

      if (existingUserItem) {
        const mergedQuantity = existingUserItem.quantity + sessionItem.quantity
        validateCartQuantity(mergedQuantity)
        await ctx.db.patch(existingUserItem._id, {
          quantity: mergedQuantity,
        })
      } else {
        validateCartQuantity(sessionItem.quantity)
        await ctx.db.insert('cartItems', {
          cartId: userCart._id,
          itemId: sessionItem.itemId,
          quantity: sessionItem.quantity,
        })
      }

      await ctx.db.delete(sessionItem._id)
    }

    // Mark session cart as merged
    await ctx.db.patch(sessionCart._id, {
      status: 'merged',
      updatedAt: Date.now(),
    })

    if (userCart._id) {
      await ctx.db.patch(userCart._id, { updatedAt: Date.now() })
    }

    return { success: true, merged: true }
  },
})

// Create order from cart
export const createOrder = mutation({
  args: {
    sessionId: v.string(),
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
    paymentMethod: v.union(
      v.literal('cash_on_delivery'),
      v.literal('card_on_delivery'),
      v.literal('b2b_invoice'),
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
    // Input validation
    validateSessionId(sessionId)
    validateName(clientName, 'Client name')
    validatePhone(clientPhone)
    validateEmail(clientEmail)

    // Kept for API compatibility; delivery price is computed server-side.
    void deliveryPrice

    // Validate address is provided for delivery types that require it
    if (deliveryType === 'courier' || deliveryType === 'transport') {
      validateAddress(address, true)
    } else {
      validateAddress(address, false)
    }

    const activeCart = await getSessionCartByStatus(ctx, sessionId, 'active')
    if (!activeCart) {
      const existingOrder = await findRecoverableOrderForSession(ctx, sessionId)
      if (existingOrder) {
        return toCreateOrderResult(existingOrder)
      }

      throw new Error('Cart not found')
    }
    const cart = activeCart

    // Mark cart as checkout to make duplicate submits return same existing order.
    await ctx.db.patch(cart._id, {
      status: 'checkout',
      updatedAt: Date.now(),
    })

    try {
      const existingOrder = await findOrderByCartId(ctx, cart._id)
      if (existingOrder) {
        await ctx.db.patch(cart._id, {
          status: 'completed',
          updatedAt: Date.now(),
        })
        return toCreateOrderResult(existingOrder)
      }

      // Get all cart items
      const cartItems = await ctx.db
        .query('cartItems')
        .withIndex('by_cart_added', (q) => q.eq('cartId', cart._id))
        .collect()

      if (cartItems.length === 0) {
        throw new Error('Cart is empty')
      }

      const computedDeliveryPrice = computeDeliveryPrice(deliveryType)
      validateDeliveryPrice(computedDeliveryPrice)

      // Calculate totals
      let itemsTotal = 0
      const orderItems: Array<{
        itemId: Id<'items'>
        name: string
        sku: string
        price: number
        quantity: number
      }> = []

      for (const cartItem of cartItems) {
        if (!cartItem.itemId) {
          throw new Error('Cart item missing itemId')
        }
        validateCartQuantity(cartItem.quantity, 'Cart item quantity')

        const item = await ctx.db.get(cartItem.itemId)
        if (!item) {
          throw new Error(`Item ${cartItem.itemId} not found`)
        }
        if (item.status !== 'active') {
          throw new Error(`Item ${cartItem.itemId} is not orderable`)
        }
        if (!item.inStock) {
          throw new Error(`Item ${cartItem.itemId} is out of stock`)
        }
        if (item.quantity >= 0 && cartItem.quantity > item.quantity) {
          throw new Error(`Item ${cartItem.itemId} exceeds available stock`)
        }

        const itemTotal = item.price * cartItem.quantity
        itemsTotal += itemTotal

        orderItems.push({
          itemId: cartItem.itemId,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: cartItem.quantity,
        })
      }

      const nextPublicNumber = await generatePublicOrderNumber(ctx)

      // Get authenticated user ID if available (for order ownership)
      const userId = await getAuthUserId(ctx)

      // Create the order
      const orderId = await ctx.db.insert('orders', {
        cartId: cart._id,
        userId: userId ?? undefined,
        publicNumber: nextPublicNumber,
        clientName,
        clientPhone,
        clientEmail,
        deliveryType,
        address,
        paymentMethod,
        paymentStatus: 'pending',
        itemsTotal,
        totalAmount: itemsTotal + computedDeliveryPrice,
        deliveryPrice: computedDeliveryPrice,
        status: 'new',
        updatedAt: Date.now(),
      })

      // Create order items
      for (const item of orderItems) {
        await ctx.db.insert('orderItems', {
          orderId,
          itemId: item.itemId,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
        })
      }

      // Mark cart as completed
      await ctx.db.patch(cart._id, {
        status: 'completed',
        updatedAt: Date.now(),
      })

      return {
        orderId,
        publicNumber: nextPublicNumber,
        totalAmount: itemsTotal + computedDeliveryPrice,
      }
    } catch (error) {
      const persistedOrder = await findOrderByCartId(ctx, cart._id)
      await ctx.db.patch(cart._id, {
        status: persistedOrder ? 'completed' : 'active',
        updatedAt: Date.now(),
      })
      throw error
    }
  },
})
