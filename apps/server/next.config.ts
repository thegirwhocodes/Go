import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@class-on-time/shared', '@class-on-time/db'],
};

export default nextConfig;
