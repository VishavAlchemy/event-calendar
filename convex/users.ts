import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./utils";

export const store = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatarUrl: v.string(),
    clerkId: v.string(),
    preferences: v.optional(v.object({
      theme: v.union(v.literal("light"), v.literal("dark")),
      notifications: v.boolean(),
      emailNotifications: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }
    
    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      clerkId: args.clerkId,
      preferences: args.preferences,
    });
  },
});

export const checkUser = query({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getUserIdByClerkId = query({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    return user?._id; // Return the _id if user exists, otherwise undefined
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), identity.tokenIdentifier))
      .unique();
  },
});

export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), userId))
      .first();
    
    return user?.preferences;
  },
});

export const updateUserPreferences = mutation({
  args: {
    preferences: v.object({
      theme: v.union(v.literal("light"), v.literal("dark")),
      notifications: v.boolean(),
      emailNotifications: v.boolean(),
      timezone: v.optional(v.string()),
    }),
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

    // Merge new preferences with existing ones
    const updatedPreferences = {
      ...user.preferences,
      ...args.preferences,
    };

    await ctx.db.patch(user._id, {
      preferences: updatedPreferences,
    });

    return updatedPreferences;
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const getUser = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.clerkId) return null;
    
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), args.clerkId))
      .first();
  },
}); 