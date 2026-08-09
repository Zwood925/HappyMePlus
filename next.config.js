/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // REQUIRED FOR CAPACITOR: Forces Next.js to build a static HTML/JS/CSS bundle
  output: 'export', 
  
  // REQUIRED FOR CAPACITOR: Disables server-side image optimization
  images: {
    unoptimized: true, 
  },

  // SILENCES NEXT.JS 16 ERROR: Tells Turbopack to ignore the Webpack config below during local dev
  turbopack: {},

  // KEEP: Fixes Firebase/Firestore Webpack resolution errors in the browser
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        module: false,
      };
    }
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};

module.exports = nextConfig;