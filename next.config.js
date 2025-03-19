const path = require('path');

const { withFaust, getWpHostname } = require('@faustwp/core');

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withFaust({
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['node_modules'],
  },
  images: {
    domains: [getWpHostname()],
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@components": path.resolve(__dirname, "components"),
      "@constants": path.resolve(__dirname, "constants"),
      "@config": path.resolve(__dirname, "app.config.js"), // ✅ FIXED: Pointing directly to file
      "@utilities": path.resolve(__dirname, "utilities"), // Ensure correct alias
      "@fragments": path.resolve(__dirname, "fragments"), // Add missing alias
      '@queries': path.resolve(__dirname, 'queries'), // ✅ Fix alias
    };
    return config;
  },
});
