import { v } from 'convex/values'
import { query } from './_generated/server'
import { verifyOrderOwnership } from './authHelpers'

// Get order by ID for public confirmation page
// Requires ownership verification: user must own the order OR order was created from their session
export const get_order_by_id = query({
  args: {
    id: v.id('orders'),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { id, sessionId }) => {
    const order = await verifyOrderOwnership(ctx, id, sessionId)

    const items = await ctx.db
      .query('orderItems')
      .withIndex('by_order', (q) => q.eq('orderId', id))
      .collect()

    return {
      _id: order._id,
      publicNumber: order.publicNumber,
      clientPhone: order.clientPhone,
      deliveryType: order.deliveryType,
      address: order.address,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      items: items.map((item) => ({
        _id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }
  },
})
