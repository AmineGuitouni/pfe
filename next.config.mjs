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

export default nextConfig;