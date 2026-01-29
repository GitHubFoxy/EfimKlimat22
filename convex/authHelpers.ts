import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError } from 'convex/values'
import { api } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'

/**
 * Shared authentication helper: Requires a permanent password (no temp password set)
 * Returns authenticated user or throws error
 */
type UserAuthRecord = Omit<Doc<'users'>, 'tempPassword'> & {
  tempPassword?: string
  mustChangePassword?: boolean
  role?: string
}

export async function requirePermanentPassword(
  ctx: any,
): Promise<UserAuthRecord> {
  const userId = await getAuthUserId(ctx)
  if (!userId) {
    throw new ConvexError('Not authenticated')
  }

  const user = (
    ctx.db?.get
      ? await ctx.db.get(userId)
      : await ctx.runQuery(api.users.getCurrentUserWithTempPassword)
  ) as UserAuthRecord | null
  if (!user) {
    throw new ConvexError('User not found')
  }

  const mustChangePassword =
    typeof user.mustChangePassword === 'boolean'
      ? user.mustChangePassword
      : Boolean(user.tempPassword)

  if (mustChangePassword) {
    throw new ConvexError(
      'You must change your password before using the system',
    )
  }

  return user
}

/**
 * Shared authorization helper: Requires permanent password AND specific role(s)
 * Returns authenticated user or throws error
 */
export async function requireRole(
  ctx: any,
  allowedRoles: string[],
): Promise<UserAuthRecord> {
  const user = await requirePermanentPassword(ctx)

  const role = user.role ?? 'guest'
  if (!allowedRoles.includes(role)) {
    throw new ConvexError(
      `Unauthorized. Required role(s): ${allowedRoles.join(', ')}`,
    )
  }

  return user
}

/**
 * Get current authenticated user ID (optional - returns null if not authenticated)
 * Use for operations that may work for both anonymous and authenticated users
 */
export async function getOptionalUserId(ctx: any): Promise<Id<'users'> | null> {
  return await getAuthUserId(ctx)
}

/**
 * Verify cart ownership: ensures the cart belongs to the current session or authenticated user
 * Returns the cart if ownership is valid, throws error otherwise
 */
export async function verifyCartOwnership(
  ctx: any,
  cartId: Id<'carts'>,
  sessionId: string,
): Promise<any> {
  const cart = await ctx.db.get(cartId)
  if (!cart) {
    throw new ConvexError('Cart not found')
  }

  const userId = await getAuthUserId(ctx)

  if (userId) {
    if (cart.userId === userId) return cart
    if (cart.sessionId === sessionId && !cart.userId) return cart
  } else {
    if (cart.sessionId === sessionId) return cart
  }

  throw new ConvexError('Forbidden: cannot access this cart')
}

/**
 * Verify cart item ownership: ensures the cart item belongs to a cart owned by current session/user
 * Returns the cart item and its cart if ownership is valid, throws error otherwise
 */
export async function verifyCartItemOwnership(
  ctx: any,
  cartItemId: Id<'cartItems'>,
  sessionId?: string,
): Promise<{ cartItem: any; cart: any }> {
  const cartItem = await ctx.db.get(cartItemId)
  if (!cartItem) {
    throw new ConvexError('Cart item not found')
  }

  if (!cartItem.cartId) {
    throw new ConvexError('Cart item has no associated cart')
  }

  const cart = await ctx.db.get(cartItem.cartId)
  if (!cart) {
    throw new ConvexError('Cart not found')
  }

  const userId = await getAuthUserId(ctx)

  if (userId) {
    if (cart.userId === userId) return { cartItem, cart }
    if (sessionId && cart.sessionId === sessionId && !cart.userId)
      return { cartItem, cart }
  } else if (sessionId) {
    if (cart.sessionId === sessionId) return { cartItem, cart }
  }

  throw new ConvexError('Forbidden: cannot access this cart item')
}

/**
 * Verify order ownership: ensures order belongs to current user or session's cart
 * For public order confirmation, also checks if order was created from session's cart
 * Returns the order if ownership is valid, throws error otherwise
 */
export async function verifyOrderOwnership(
  ctx: any,
  orderId: Id<'orders'>,
  sessionId?: string,
): Promise<any> {
  const order = await ctx.db.get(orderId)
  if (!order) {
    throw new ConvexError('Order not found')
  }

  const userId = await getAuthUserId(ctx)

  if (userId && order.userId === userId) {
    return order
  }

  if (sessionId && order.cartId) {
    const cart = await ctx.db.get(order.cartId)
    if (cart && cart.sessionId === sessionId) {
      return order
    }
  }

  throw new ConvexError('Forbidden: cannot access this order')
}
