/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // 백엔드 API로 프록시
      {
        source: '/api/campaigns/:path*',
        destination: 'http://localhost:8080/campaigns/:path*'
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8080/auth/:path*'
      },
      {
        source: '/api/wallet/:path*',
        destination: 'http://localhost:8080/wallet/:path*'
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:8080/admin/:path*'
      },
      {
        source: '/api/t/:path*',
        destination: 'http://localhost:8080/t/:path*'
      }
    ];
  }
};

module.exports = nextConfig;
