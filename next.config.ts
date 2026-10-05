import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/photos-extract.js',
      headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
    }];
  },
};

export default nextConfig;
