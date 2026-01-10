import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get list of available consultants
export const listAvailable = query({
  args: {},
  handler: async (ctx) => {
    // Return empty array for now - implement when consultants table is added
    // This is a placeholder for FreeConsultant component
    return [];
  },
});

// Submit a consultant request (creates a lead)
export const submit_consultant_request = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, { name, phone, message }) => {
    const leadId = await ctx.db.insert("leads", {
      name,
      phone,
      type: "callback",
      message,
      status: "new",
      updatedAt: Date.now(),
    });
    return { leadId };
  },
});
