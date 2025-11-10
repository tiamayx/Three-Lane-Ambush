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
      
      // Add global polyfill for client-side only
      config.plugins.push(
        new (require('webpack').ProvidePlugin)({
          'global': 'globalThis',
        })
      );
    }
    
    // For server-side rendering, provide mock implementations
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@zama-fhe/relayer-sdk/web': false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
