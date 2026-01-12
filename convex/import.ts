import { mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * Generic insert mutation for importing documents
 * Used by the import driver to insert documents with resolved foreign keys
 * Returns {ok: true, id} on success or {ok: false, error: string} on failure
 */
export const insertDoc = mutation({
  args: {
    collection: v.string(),
    doc: v.any(),
  },
  handler: async (ctx, { collection, doc }) => {
    try {
      const id = await ctx.db.insert(collection as any, doc);
      return { ok: true, id: id.toString() };
    } catch (error: any) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Import Error] ${collection}:`, message);
      console.error(`[Import Doc] ${JSON.stringify(doc).substring(0, 500)}`);
      // Return error instead of throwing so client can see it
      return {
        ok: false,
        error: message,
        collection,
      };
    }
  },
});

/**
 * Batch insert for performance (up to 100 docs at a time)
 */
export const insertBatch = mutation({
  args: {
    collection: v.string(),
    docs: v.array(v.any()),
  },
  handler: async (ctx, { collection, docs }) => {
    const ids: string[] = [];
    for (const doc of docs) {
      const id = await ctx.db.insert(collection as any, doc);
      ids.push(id.toString());
    }
    return ids;
  },
});
