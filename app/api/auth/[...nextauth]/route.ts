import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth"

export const dynamic = 'force-dynamic'

const { handlers } = NextAuth(authConfig)

export const GET = handlers.GET
export const POST = handlers.POST

