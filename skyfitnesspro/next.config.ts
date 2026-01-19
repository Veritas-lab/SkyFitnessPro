import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Уменьшаем размер бандла
  experimental: {
    optimizePackageImports: ['react-icons', 'lucide-react'],
  },
  // Указываем правильную корневую директорию для Turbopack
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
