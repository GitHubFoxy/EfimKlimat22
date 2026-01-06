import { v } from "convex/values";
import { query } from "./_generated/server";

// Get list of available consultants
export const listAvailable = query({
  args: {},
  handler: async (ctx) => {
    // Return empty array for now - implement when consultants table is added
    // This is a placeholder for FreeConsultant component
    return [];
  },
});
