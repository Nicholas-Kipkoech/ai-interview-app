import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https", // required
        hostname: "github.com", // required
        pathname: "/**", // allow all paths under github.com
      },
    ],
  },
};

export default nextConfig;
