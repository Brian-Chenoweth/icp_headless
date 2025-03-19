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
      '@components': path.resolve(__dirname, 'components'), // 👈 Fix alias
      '@constants': path.resolve(__dirname, 'constants'),   // 👈 Add missing alias
      '@config': path.resolve(__dirname, 'config'),         // 👈 Add missing alias
      '@utils': path.resolve(__dirname, 'utils'),           // 👈 Add missing alias
    };
    return config;
  },
});
