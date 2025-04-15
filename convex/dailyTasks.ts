import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get daily tasks for a user
export const getDailyTasks = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("dailyTasks")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});

// Add a new daily task
export const addDailyTask = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    return await ctx.db.insert("dailyTasks", {
      userId: user._id,
      text: args.text,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Toggle task completion status
export const toggleTaskCompletion = mutation({
  args: {
    id: v.id("dailyTasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== user._id) {
      throw new Error("Task not found or access denied");
    }

    return await ctx.db.patch(args.id, {
      completed: !task.completed,
      updatedAt: Date.now(),
    });
  },
});

// Delete a task
export const deleteTask = mutation({
  args: {
    id: v.id("dailyTasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== user._id) {
      throw new Error("Task not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
}); 