import NextAuth from "next-auth"
import { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

// 環境変数の読み込み（複数の方法を試す）
// Vercelでは環境変数が正しく読み込まれない場合があるため、複数の方法で試す
function getSecret(): string | undefined {
  // 方法1: 標準的な環境変数
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET
  
  // 方法2: ブラケット記法
  if (process.env['AUTH_SECRET']) return process.env['AUTH_SECRET']
  if (process.env['NEXTAUTH_SECRET']) return process.env['NEXTAUTH_SECRET']
  
  // 方法3: グローバルオブジェクトから（Vercelのランタイム環境）
  const globalEnv = (globalThis as any).process?.env
  if (globalEnv?.AUTH_SECRET) return globalEnv.AUTH_SECRET
  if (globalEnv?.NEXTAUTH_SECRET) return globalEnv.NEXTAUTH_SECRET
  
  return undefined
}

const secret = getSecret()

// デバッグログ
if (typeof window === 'undefined') {
  console.log("🔍 [SERVER] Environment variables check:")
  console.log("  AUTH_SECRET:", process.env.AUTH_SECRET ? `✅ Set (length: ${process.env.AUTH_SECRET.length})` : "❌ Not set")
  console.log("  NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? `✅ Set (length: ${process.env.NEXTAUTH_SECRET.length})` : "❌ Not set")
  console.log("  Final secret:", secret ? `✅ Available (length: ${secret.length})` : "❌ Missing")
  console.log("  NODE_ENV:", process.env.NODE_ENV)
  console.log("  VERCEL:", process.env.VERCEL ? "✅ Yes" : "❌ No")
  
  if (!secret) {
    console.error("⚠️ AUTH_SECRET or NEXTAUTH_SECRET is not set!")
    console.error("All process.env keys:", Object.keys(process.env).slice(0, 20))
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: true, // Vercelなどのホスティング環境で必要
  secret: secret, // NextAuth.js v5ではAUTH_SECRETを優先
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

// NextAuthインスタンスを作成してauth関数をエクスポート
export const { auth } = NextAuth(authConfig)
