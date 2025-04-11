import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get monthly intentions for a user
export const getMonthlyIntentions = query({
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
      .query("monthlyIntentions")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});

// Get weekly intentions for a user
export const getWeeklyIntentions = query({
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
      .query("weeklyIntentions")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});

// Add a new monthly intention
export const addMonthlyIntention = mutation({
  args: {
    text: v.string(),
    color: v.string(),
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
    return await ctx.db.insert("monthlyIntentions", {
      userId: user._id,
      text: args.text,
      color: args.color,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Add a new weekly intention
export const addWeeklyIntention = mutation({
  args: {
    text: v.string(),
    color: v.string(),
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
    return await ctx.db.insert("weeklyIntentions", {
      userId: user._id,
      text: args.text,
      color: args.color,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a monthly intention
export const updateMonthlyIntention = mutation({
  args: {
    id: v.id("monthlyIntentions"),
    text: v.string(),
    color: v.string(),
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

    const intention = await ctx.db.get(args.id);
    if (!intention || intention.userId !== user._id) {
      throw new Error("Intention not found or access denied");
    }

    return await ctx.db.patch(args.id, {
      text: args.text,
      color: args.color,
      updatedAt: Date.now(),
    });
  },
});

// Update a weekly intention
export const updateWeeklyIntention = mutation({
  args: {
    id: v.id("weeklyIntentions"),
    text: v.string(),
    color: v.string(),
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

    const intention = await ctx.db.get(args.id);
    if (!intention || intention.userId !== user._id) {
      throw new Error("Intention not found or access denied");
    }

    return await ctx.db.patch(args.id, {
      text: args.text,
      color: args.color,
      updatedAt: Date.now(),
    });
  },
});

// Delete a monthly intention
export const deleteMonthlyIntention = mutation({
  args: {
    id: v.id("monthlyIntentions"),
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

    const intention = await ctx.db.get(args.id);
    if (!intention || intention.userId !== user._id) {
      throw new Error("Intention not found or access denied");
    }

    await ctx.db.delete(args.id);
    return true;
  },
});

// Delete a weekly intention
export const deleteWeeklyIntention = mutation({
  args: {
    id: v.id("weeklyIntentions"),
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

    const intention = await ctx.db.get(args.id);
    if (!intention || intention.userId !== user._id) {
      throw new Error("Intention not found or access denied");
    }

    await ctx.db.delete(args.id);
    return true;
  },
}); 