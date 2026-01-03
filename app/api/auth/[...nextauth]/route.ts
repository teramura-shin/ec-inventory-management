import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// 環境変数の確認（ルートハンドラー内でも確認）
console.log("🔍 Auth route - Environment check:")
console.log("  AUTH_SECRET:", process.env.AUTH_SECRET ? "✅ Set" : "❌ Not set")
console.log("  NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Not set")

const { handlers } = NextAuth(authConfig)

export const GET = handlers.GET
export const POST = handlers.POST

