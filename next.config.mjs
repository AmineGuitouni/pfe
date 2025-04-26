import b_analyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = b_analyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'tbnfcrturvesuzrlsldk.supabase.co',
            },
        ],
    },
};

export default withBundleAnalyzer(nextConfig);
