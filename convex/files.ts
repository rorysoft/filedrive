import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createFile = mutation({
	args: {
		name: v.string(),
		orgId: v.string(),
	},
	async handler(ctx, args) {
		const identity = await ctx.auth.getUserIdentity();
		console.log(identity);

		if (!identity) {
			throw new Error('Not authenticated');
		}
		await ctx.db.insert('files', {
			name: args.name,
			orgId: args.orgId,
		});
	},
});

export const getFiles = query({
	args: {
		orgId: v.string(),
	},
	async handler(ctx, args) {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			return [];
		}
		return await ctx.db
			.query('files')
			.withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
			.collect();
	},
});

export const deleteFile = mutation({
	args: { id: v.id('files') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});
