/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  experimental: {
    turbo: {
      root: process.cwd()
    }
  }
}

module.exports = nextConfig
