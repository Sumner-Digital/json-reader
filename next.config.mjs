/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    /* Enable Edge Runtime globally (per-route `runtime = 'edge'` still recommended) */
    runtime: 'edge'
  }
};

export default nextConfig;