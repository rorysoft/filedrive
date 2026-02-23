import { customCtx, customQuery } from 'convex-helpers/server/customFunctions';
import {
	Rules,
	wrapDatabaseReader,
} from 'convex-helpers/server/rowLevelSecurity';
import { DataModel } from './_generated/dataModel';
import { query, QueryCtx } from './_generated/server';

async function rlsRules(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	return {
		files: {
			read: async ({ auth }, file) => {
				if (identity === null) {
					return false;
				}
				return true;
			},
			modify: async ({ auth }, file) => {
				if (identity === null) {
					return false;
				}
				return file._id === identity.tokenIdentifier;
			},
		},
	} satisfies Rules<QueryCtx, DataModel>;
}

export const queryWithRLS = customQuery(
	query,
	customCtx(async (ctx) => ({
		db: wrapDatabaseReader(ctx, ctx.db, await rlsRules(ctx)),
	}))
);
