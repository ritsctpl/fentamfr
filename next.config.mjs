/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    basePath: '/manufacturing', 
    productionBrowserSourceMaps: false,  
    eslint: {
        ignoreDuringBuilds: true,
    },
  };
  
  export default nextConfig;
  