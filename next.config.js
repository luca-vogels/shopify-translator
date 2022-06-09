/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverRuntimeConfig: {
    
  },
  publicRuntimeConfig: {
    domains: [
      "lupauth.com",
      "lupauth.de",
      "localhost"
    ]
  },
  trailingSlash: true,
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
    localeDetection: true,
    domains: [
      {
        domain: 'lupauth.de',
        defaultLocale: 'de',
        locales: ['de', 'de-DE', 'ch', 'de-CH', 'de-AT', 'de-LU', 'de-LI']
      },
    ]
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  }
} 

module.exports = nextConfig
