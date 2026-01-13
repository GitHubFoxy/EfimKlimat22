import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Shared authentication helper: Requires a permanent password (no temp password set)
 * Returns authenticated user or throws error
 */
export async function requirePermanentPassword(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("Not authenticated");
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new ConvexError("User not found");
  }

  if (user.tempPassword) {
    throw new ConvexError("You must change your password before using the system");
  }

  return user;
}

/**
 * Shared authorization helper: Requires permanent password AND specific role(s)
 * Returns authenticated user or throws error
 */
export async function requireRole(ctx: any, allowedRoles: string[]) {
  const user = await requirePermanentPassword(ctx);

  if (!allowedRoles.includes(user.role)) {
    throw new ConvexError(
      `Unauthorized. Required role(s): ${allowedRoles.join(", ")}`
    );
  }

  return user;
}
