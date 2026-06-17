/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  compress: true,
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    unoptimized: true,
    formats: ['image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:all*(jpg|jpeg|png|webp|avif|svg)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:all*(mp4|webm)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

module.exports = nextConfig;
