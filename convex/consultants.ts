import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit_consultant_request = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    message: v.optional(v.string()),
  },
  returns: v.object({ status: v.number(), consultantId: v.id("consultants") }),
  handler: async (ctx, { name, phone, message }) => {
    const consultantId = await ctx.db.insert("consultants", {
      name,
      phone,
      message,
      status: "new",
      updatedAt: Date.now(),
    });
    return { status: 200, consultantId };
  },
});

export const list_consultants_by_status = query({
  args: {
    status: v.union(v.literal("new"), v.literal("processing"), v.literal("done")),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("consultants"),
        _creationTime: v.number(),
        name: v.string(),
        phone: v.string(),
        message: v.optional(v.string()),
        status: v.union(v.literal("new"), v.literal("processing"), v.literal("done")),
        assignedManager: v.optional(v.id("users")),
        updatedAt: v.optional(v.number()),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.union(v.string(), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, { status, paginationOpts }) => {
    return await ctx.db
      .query("consultants")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .paginate(paginationOpts);
  },
});

export const list_my_consultants_by_status = query({
  args: {
    managerId: v.id("users"),
    status: v.union(v.literal("new"), v.literal("processing"), v.literal("done")),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.id("consultants"),
        _creationTime: v.number(),
        name: v.string(),
        phone: v.string(),
        message: v.optional(v.string()),
        status: v.union(v.literal("new"), v.literal("processing"), v.literal("done")),
        assignedManager: v.optional(v.id("users")),
        updatedAt: v.optional(v.number()),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    pageStatus: v.optional(v.union(v.string(), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, { managerId, status, paginationOpts }) => {
    return await ctx.db
      .query("consultants")
      .withIndex("by_assignedManager_status_updatedAt", (q) =>
        q.eq("assignedManager", managerId).eq("status", status),
      )
      .order("desc")
      .paginate(paginationOpts);
  },
});

export const update_consultant_status = mutation({
  args: {
    consultantId: v.id("consultants"),
    status: v.union(v.literal("new"), v.literal("processing"), v.literal("done")),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { consultantId, status }) => {
    const existing = await ctx.db.get(consultantId);
    if (!existing) throw new Error("Consultant request not found");
    await ctx.db.patch(consultantId, { status, updatedAt: Date.now() });
    return { status: 200 };
  },
});

export const claim_consultant = mutation({
  args: {
    consultantId: v.id("consultants"),
    managerId: v.id("users"),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { consultantId, managerId }) => {
    const existing = await ctx.db.get(consultantId);
    if (!existing) throw new Error("Consultant request not found");
    await ctx.db.patch(consultantId, {
      assignedManager: managerId,
      updatedAt: Date.now(),
    });
    return { status: 200 };
  },
});

export const unclaim_consultant = mutation({
  args: {
    consultantId: v.id("consultants"),
  },
  returns: v.object({ status: v.number() }),
  handler: async (ctx, { consultantId }) => {
    const existing = await ctx.db.get(consultantId);
    if (!existing) throw new Error("Consultant request not found");
    const { assignedManager, _id, _creationTime, ...rest } = existing as any;
    await ctx.db.replace(consultantId, { ...rest, updatedAt: Date.now() });
    return { status: 200 };
  },
});