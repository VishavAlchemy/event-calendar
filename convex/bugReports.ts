import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./utils";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const bugReport = await ctx.db.insert("bugReports", {
      userId: user._id,
      title: args.title,
      description: args.description,
      priority: args.priority,
      status: args.status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return bugReport;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const bugReports = await ctx.db
      .query("bugReports")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .collect();

    return bugReports;
  },
}); 