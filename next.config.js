/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Implement phased CSP migration
  ...(process.env.CSP_MODE === 'strict' ? [
    // Strict CSP without unsafe-inline/unsafe-eval
    {
      key: 'Content-Security-Policy',
      value: process.env.NODE_ENV === 'production' 
        ? "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://aiapi.qa.cardinal-holdings.com wss:// https://*.auth0.com; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
        : "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https: http://127.0.0.1:10000 http://localhost:10000; font-src 'self' data:; connect-src 'self' https://aiapi.qa.cardinal-holdings.com wss:// https://*.auth0.com http://localhost:*; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
    }
  ] : process.env.CSP_MODE === 'report-only' ? [
    // Report-Only mode for testing strict CSP
    {
      key: 'Content-Security-Policy-Report-Only',
      value: process.env.NODE_ENV === 'production' 
        ? "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://aiapi.qa.cardinal-holdings.com wss:// https://*.auth0.com; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; report-uri /api/csp-report;"
        : "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob: https: http://127.0.0.1:10000 http://localhost:10000; font-src 'self' data:; connect-src 'self' https://aiapi.qa.cardinal-holdings.com wss:// https://*.auth0.com http://localhost:*; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; report-uri /api/csp-report;",
    },
    // Keep existing permissive CSP while testing
    {
      key: 'Content-Security-Policy',
      value: process.env.NODE_ENV === 'production' 
        ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://aiapi.qa.cardinal-holdings.com wss://; frame-ancestors 'none';"
        : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http://127.0.0.1:10000 http://localhost:10000; font-src 'self'; connect-src 'self' https://aiapi.qa.cardinal-holdings.com wss://;",
    }
  ] : [
    // Default: Current permissive CSP
    {
      key: 'Content-Security-Policy',
      value: process.env.NODE_ENV === 'production' 
        ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://aiapi.qa.cardinal-holdings.com wss://; frame-ancestors 'none';"
        : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http://127.0.0.1:10000 http://localhost:10000; font-src 'self'; connect-src 'self' https://aiapi.qa.cardinal-holdings.com wss://;",
    }
  ])
];

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Required for Docker deployment
  eslint: {
    // Temporarily disabled for production build - fix warnings later
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Enable TypeScript error checking during build
    ignoreBuildErrors: false,
  },
  
  // Image optimization configuration
  images: {
    // Allow loading images from our own API endpoints
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/api/**',
      },
    ],
  },
  
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    // OpenAI API Key (Keep for standard OpenAI access)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    // Azure OpenAI Configuration - only expose if using Azure
    ...(process.env.AI_PROVIDER === 'azure' ? {
      AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
      AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
      AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    } : {}),
    // AI Provider Switch ('openai' or 'azure')
    AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
    // AI Input Limits
    NEXT_PUBLIC_AI_MAX_INPUT_TOKENS: process.env.AI_MAX_INPUT_TOKENS || '6000',
    // Patbase API Configuration
    PATBASE_API_USER_ID: process.env.PATBASE_API_USER_ID,
    PATBASE_API_PASSWORD: process.env.PATBASE_API_PASSWORD,
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // Environment-specific configurations
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: process.env.MY_SECRET,
    secondSecret: process.env.SECOND_SECRET,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    appEnv: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  },

  // Fix for node-cron and other Node.js-specific modules
  // Note: This webpack config is still used even with Turbopack for certain edge cases
  // The warning about "Webpack is configured while Turbopack is not" is just informational
  webpack: (config, { isServer }) => {
    // If it's a client-side bundle, add node-cron to the list of modules to not parse
    if (!isServer) {
      // These packages are Node.js specific and should be ignored in client builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        tls: false,
        crypto: false,
        worker_threads: false,
        dns: false,
        os: false,
        path: false,
      };

      // Tell webpack not to try to bundle certain Node.js specific packages on the client
      config.externals = [
        ...(config.externals || []),
        { 'node-cron': 'node-cron' },
      ];
    }

    return config;
  },
};

// Export with Bundle Analyzer
module.exports = withBundleAnalyzer(nextConfig);
