/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // Windows fix: the persistent webpack cache on this machine is corrupt
    // (the "ENOENT ... rename .next\cache\webpack\...\0.pack.gz" warnings).
    // Because it can't rewrite itself, it keeps serving a STALE, mis-compiled
    // copy of Ably from the old transpilePackages build -> the 'super' error.
    // Turning off the on-disk cache in dev forces webpack to re-read the clean
    // Ably source from node_modules on every run.
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;