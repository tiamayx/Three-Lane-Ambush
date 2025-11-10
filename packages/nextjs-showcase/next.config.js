/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fhevm-sdk'],
  webpack: (config, { isServer }) => {
    // Add polyfills for browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Add global polyfill for browser
      config.plugins.push(
        new (require('webpack').DefinePlugin)({
          'global': 'globalThis',
        })
      );
    }
    return config;
  },
}

module.exports = nextConfig
