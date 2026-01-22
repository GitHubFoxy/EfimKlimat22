import {
  createAccount,
  getAuthUserId,
  modifyAccountCredentials,
} from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'
import { api, internal } from './_generated/api'
import { action, internalMutation, mutation, query } from './_generated/server'
import { normalizePhone } from './auth'
import { requirePermanentPassword, requireRole } from './authHelpers'
import { validateName, validatePassword, validatePhone } from './validation'

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const length = 8
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length]
  }
  return result
}

/**
 * Get current user's role from database (server-side authority)
 * Used by useRole hook for client-side role display
 * CRITICAL: Server validates authorization, not client
 */
export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)

    // No auth = guest role
    if (!userId) {
      return 'guest'
    }

    // Fetch user from database
    const user = await ctx.db.get(userId)

    // Return role from database, default to guest
    return user?.role ?? 'guest'
  },
})

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    const users = await ctx.db.query('users').collect()
    return users.map(({ tempPassword, ...u }: any) => u)
  },
})

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    const users = await ctx.db
      .query('users')
      .filter((q) => q.neq(q.field('status'), 'blocked'))
      .collect()
    return users.map(({ tempPassword, ...u }: any) => u)
  },
})

export const listBlocked = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ['admin'])
    const users = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('status'), 'blocked'))
      .collect()
    return users.map(({ tempPassword, ...u }: any) => u)
  },
})

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const user = await ctx.db.get(userId)
    if (!user) return null
    // Don't expose tempPassword to client
    const { tempPassword, ...safeUser } = user
    return safeUser
  },
})

export const getCurrentUserWithTempPassword = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const user = await ctx.db.get(userId)
    if (!user) return null
    // Return flag instead of raw tempPassword
    const { tempPassword, ...safeUser } = user
    return {
      ...safeUser,
      mustChangePassword: !!tempPassword,
    }
  },
})

export const clearTempPasswordInternal = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { tempPassword: undefined })
  },
})

export const createManager = action({
  args: {
    phone: v.string(),
    name: v.string(),
    surname: v.optional(v.string()),
  },
  handler: async (ctx, { phone, name, surname }) => {
    await requireRole(ctx, ['admin'])

    // Input validation
    validatePhone(phone)
    validateName(name)
    if (surname) validateName(surname, 'Surname')

    const normalizedPhone = normalizePhone(phone)
    const tempPassword = generateTempPassword()

    try {
      await createAccount(ctx, {
        provider: 'phone',
        account: { id: normalizedPhone, secret: tempPassword },
        profile: {
          phone: normalizedPhone,
          name,
          surname,
          role: 'manager',
          tempPassword,
          status: 'active',
        },
      })
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      console.error('[createManager] Error:', errorMsg, e)
      throw new ConvexError(`Failed to create manager account: ${errorMsg}`)
    }

    return { phone: normalizedPhone, tempPassword }
  },
})

export const changePassword = action({
  args: {
    newPassword: v.string(),
  },
  handler: async (ctx, { newPassword }) => {
    // Input validation
    validatePassword(newPassword)

    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Not authenticated')
    }

    const userResult = await ctx.runQuery(
      api.users.getCurrentUserWithTempPassword,
    )
    if (!userResult) {
      throw new ConvexError('User not found')
    }

    const user = userResult as any
    if (!user.mustChangePassword) {
      throw new ConvexError('No temporary password set for this user')
    }

    if (!user.phone) {
      throw new ConvexError('User phone not found')
    }

    const normalizedPhone = normalizePhone(user.phone)
    await modifyAccountCredentials(ctx, {
      provider: 'phone',
      account: { id: normalizedPhone, secret: newPassword },
    })

    await ctx.runMutation(internal.users.clearTempPasswordInternal, {
      userId: user._id,
    })

    return { success: true }
  },
})

// Create a user with role (for admin panel)
export const create_user_with_role = action({
  args: {
    name: v.string(),
    phone: v.string(),
    role: v.union(v.literal('user'), v.literal('manager'), v.literal('admin')),
  },
  handler: async (ctx, { name, phone, role }) => {
    await requireRole(ctx, ['admin'])

    // Input validation
    validateName(name)
    validatePhone(phone)

    const normalizedPhone = normalizePhone(phone)
    const tempPassword = generateTempPassword()

    try {
      await createAccount(ctx, {
        provider: 'phone',
        account: { id: normalizedPhone, secret: tempPassword },
        profile: {
          phone: normalizedPhone,
          name,
          role,
          tempPassword,
          status: 'active',
        },
      })
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      console.error('[create_user_with_role] Error:', errorMsg, e)
      throw new ConvexError(`Failed to create user account: ${errorMsg}`)
    }

    return { phone: normalizedPhone, tempPassword }
  },
})

// Update user (for admin panel)
export const update_user = mutation({
  args: {
    id: v.id('users'),
    name: v.string(),
    phone: v.string(),
    role: v.union(v.literal('user'), v.literal('manager'), v.literal('admin')),
  },
  handler: async (ctx, { id, name, phone, role }) => {
    await requireRole(ctx, ['admin'])

    // Input validation
    validateName(name)
    validatePhone(phone)

    await ctx.db.patch(id, { name, phone, role })
    return { success: true }
  },
})

// Delete user (for admin panel)
export const delete_user = mutation({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ['admin'])
    await ctx.db.delete(id)
    return { success: true }
  },
})

// List users by role (for admin panel)
export const list_users_by_role = query({
  args: {
    role: v.union(v.literal('user'), v.literal('manager'), v.literal('admin')),
  },
  handler: async (ctx, { role }) => {
    await requireRole(ctx, ['admin'])
    const users = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('role'), role))
      .collect()
    return users.map(({ tempPassword, ...u }: any) => u)
  },
})

// Get user by ID
export const get_user_by_id = query({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ['admin'])
    const user = await ctx.db.get(id)
    if (!user) return null
    const { tempPassword, ...safeUser } = user as any
    return safeUser
  },
})

// Test helper: Create a test user (admin only)
export const createTestUser = action({
  args: {
    phone: v.string(),
    name: v.string(),
    role: v.union(v.literal('user'), v.literal('manager'), v.literal('admin')),
  },
  handler: async (ctx, { phone, name, role }) => {
    await requireRole(ctx, ['admin'])

    // Input validation
    validatePhone(phone)
    validateName(name)

    const normalizedPhone = normalizePhone(phone)
    const tempPassword = generateTempPassword()

    try {
      await createAccount(ctx, {
        provider: 'phone',
        account: { id: normalizedPhone, secret: tempPassword },
        profile: {
          phone: normalizedPhone,
          name,
          role,
          tempPassword,
          status: 'active',
        },
      })

      return {
        success: true,
        phone: normalizedPhone,
        tempPassword,
        message: `✅ User created!\nPhone: ${normalizedPhone}\nTemp password: ${tempPassword}`,
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      console.error('[createTestUser] Error:', errorMsg, e)
      throw new ConvexError(`Failed to create test user: ${errorMsg}`)
    }
  },
})
