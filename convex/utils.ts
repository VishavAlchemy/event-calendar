import { DatabaseReader, DatabaseWriter, MutationCtx, QueryCtx } from "./_generated/server";

export async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
} 