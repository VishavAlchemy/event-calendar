import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const get = query({
  args: {
    userId: v.string(),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, startTime, endTime } = args;

    // Get the base query for user's events using the by_user index for performance
    let eventQuery = ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    // If time range is specified, filter by it
    // Use the by_user_and_time index for even faster retrieval when filtering by time
    if (startTime !== undefined && endTime !== undefined) {
      eventQuery = ctx.db
        .query("events")
        .withIndex("by_user_and_time", (q) => 
          q.eq("userId", userId).gte("start", startTime)
        )
        .filter((q) => q.lte(q.field("end"), endTime));
    }

    // Limit the number of returned events for better performance
    const events = await eventQuery.collect();
    return events;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    start: v.number(),
    end: v.number(),
    allDay: v.optional(v.boolean()),
    color: v.string(),
    location: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", args);
    return eventId;
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.string(),
    description: v.optional(v.string()),
    start: v.number(),
    end: v.number(),
    allDay: v.optional(v.boolean()),
    color: v.string(),
    location: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...eventData } = args;
    
    // Verify the event belongs to the user
    const existingEvent = await ctx.db.get(id);
    if (!existingEvent || existingEvent.userId !== eventData.userId) {
      throw new Error("Unauthorized or event not found");
    }

    await ctx.db.replace(id, eventData);
    return id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, userId } = args;
    
    // Verify the event belongs to the user
    const existingEvent = await ctx.db.get(id);
    if (!existingEvent || existingEvent.userId !== userId) {
      throw new Error("Unauthorized or event not found");
    }

    await ctx.db.delete(id);
    return id;
  },
}); 