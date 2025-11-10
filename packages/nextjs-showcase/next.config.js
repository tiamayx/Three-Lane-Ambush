/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fhevm-sdk'],
  output: 'export',
  distDir: '.next',
  webpack: (config, { isServer }) => {
    // Add polyfills for browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Add global, self, and window polyfills for both server and client
    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        'global': 'globalThis',
        'self': isServer ? 'globalThis' : 'self',
        'window': isServer ? '{}' : 'window',
      })
    );
    
    return config;
  },
}

module.exports = nextConfig
