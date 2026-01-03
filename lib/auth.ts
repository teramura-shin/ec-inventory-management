import NextAuth from "next-auth"
import { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

// 環境変数の確認（デバッグ用）
const authSecret = process.env.AUTH_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET
const secret = authSecret || nextAuthSecret

console.log("🔍 Environment variables check:")
console.log("  AUTH_SECRET:", authSecret ? "✅ Set" : "❌ Not set")
console.log("  NEXTAUTH_SECRET:", nextAuthSecret ? "✅ Set" : "❌ Not set")
console.log("  Final secret:", secret ? "✅ Available" : "❌ Missing")

if (!secret) {
  console.error("⚠️ AUTH_SECRET or NEXTAUTH_SECRET is not set!")
  console.error("Available env vars:", Object.keys(process.env).filter(k => 
    k.includes('AUTH') || k.includes('NEXTAUTH') || k.includes('SECRET')
  ))
}

export const authConfig: NextAuthConfig = {
  trustHost: true, // Vercelなどのホスティング環境で必要
  secret: secret || undefined, // NextAuth.js v5ではAUTH_SECRETを優先
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
