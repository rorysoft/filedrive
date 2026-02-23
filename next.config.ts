import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				hostname: 'artful-terrier-457.convex.cloud',
			},
		],
	},
};

export default nextConfig;
