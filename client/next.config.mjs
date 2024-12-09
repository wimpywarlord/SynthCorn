/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  output: "export",
  distDir: "out",
  crossOrigin: "anonymous",
};

export default nextConfig;
