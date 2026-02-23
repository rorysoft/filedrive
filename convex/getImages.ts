import { ConvexError, v } from 'convex/values';

import { query } from './_generated/server';
import { hasAcessToOrg } from './files';

// Returns a signed URL for an image if the requesting user can access the file.
export const getImageUrl = query({
	args: {
		storageId: v.id('_storage'),
	},
	async handler(ctx, args) {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new ConvexError('Unauthorized');
		}

		const file = await ctx.db
			.query('files')
			.filter((q) => q.eq(q.field('fileId'), args.storageId))
			.first();

		if (!file) {
			throw new ConvexError('File not found');
		}

		if (file.type !== 'image') {
			throw new ConvexError('File is not an image');
		}

		const hasAccess = await hasAcessToOrg(ctx, file.orgId);

		if (!hasAccess) {
			throw new ConvexError('You do not have access to this file');
		}

		const url = await ctx.storage.getUrl(file.fileId);

		if (!url) {
			throw new ConvexError('Unable to retrieve image from storage');
		}

		return url;
	},
});
