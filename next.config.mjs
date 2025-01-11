/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'replicate.delivery',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'pbxt.replicate.delivery',
                port: '',
                pathname: '/**',
            }
        ],
    },
};

export default nextConfig;
