import { ConvexError, v } from 'convex/values';
import { mutation, MutationCtx, query, QueryCtx } from './_generated/server';
import { getUser } from './users';

export async function hasAcessToOrg(
	ctx: QueryCtx | MutationCtx,
	orgId: string
) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		return null;
	}

	const user = await ctx.db
		.query('users')
		.withIndex('by_tokenIdentifier', (q) =>
			q.eq('tokenIdentifier', identity.tokenIdentifier)
		)
		.first();

	if (!user) return null;

	const hasAccess =
		user.orgIds.some((item) => item === orgId) ||
		user.tokenIdentifier.includes(orgId);

	if (!hasAccess) return null;

	return { user };
}
export const createFile = mutation({
	args: {
		name: v.string(),
		orgId: v.string(),
	},
	async handler(ctx, args) {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new ConvexError('Unauthorized');
		}

		const user = await getUser(ctx, identity.tokenIdentifier);

		if (!user) return null;

		if (
			!user.orgIds?.includes(args.orgId) &&
			user.tokenIdentifier !== identity.tokenIdentifier
		) {
			throw new ConvexError('You do not have access to this org!');
		}

		await ctx.db.insert('files', {
			name: args.name,
			orgId: args.orgId || identity.subject.toString(),
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

		const hasAccess = await hasAcessToOrg(ctx, args.orgId);

		if (!hasAccess) {
			return [];
		}

		return await ctx.db
			.query('files')
			.withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
			.collect();
	},
});
