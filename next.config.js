/** @type {import('next').NextConfig} */
const nextConfig = {
  // 本番環境でのビルド最適化
  output: 'standalone',
  // 環境変数をランタイムで読み込むように設定
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
}

module.exports = nextConfig

