/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.matchpoint.tv",
            },
        ],
    },
};

export default nextConfig;
