import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['pzrjbfucbavahwhfjmfq.supabase.co', 'ik.imagekit.io'],
  },
};

export default nextConfig;
