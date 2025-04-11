import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { type Id } from "./_generated/dataModel";

export default defineSchema({
  users: defineTable({
        // Basic user info from auth provider
        email: v.string(),
        name: v.string(),
        avatarUrl: v.string(),
        clerkId: v.string(),
        // User preferences
        preferences: v.optional(v.object({
            theme: v.union(v.literal("light"), v.literal("dark")),
            notifications: v.boolean(),
            emailNotifications: v.boolean(),
        })),
    }).index("by_clerk_id", ["clerkId"]),
    
  monthlyIntentions: defineTable({
    userId: v.id("users"),
    text: v.string(),
    color: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  
  weeklyIntentions: defineTable({
    userId: v.id("users"),
    text: v.string(),
    color: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    start: v.number(), // Store as Unix timestamp
    end: v.number(), // Store as Unix timestamp
    allDay: v.optional(v.boolean()),
    color: v.string(),
    location: v.optional(v.string()),
    userId: v.string(), // Store the clerk ID for direct auth integration
    ownerId: v.optional(v.id("users")), // Optional reference to our users table
  })
    .index("by_user", ["userId"])
    .index("by_user_and_time", ["userId", "start"]),
});
