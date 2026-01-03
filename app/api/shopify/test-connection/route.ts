import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const setting = await prisma.shopifySetting.findUnique({
      where: { userId: user.id },
    })

    if (!setting) {
      return NextResponse.json(
        { error: "Shopify設定が登録されていません" },
        { status: 400 }
      )
    }

    // Shopify APIへの接続テスト
    const shopifyUrl = `https://${setting.storeName}.myshopify.com/admin/api/2024-01/products.json?limit=1`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (setting.accessToken) {
      headers["X-Shopify-Access-Token"] = setting.accessToken
    } else if (setting.apiKey && setting.apiSecret) {
      // Basic認証の場合
      const auth = Buffer.from(
        `${setting.apiKey}:${setting.apiSecret}`
      ).toString("base64")
      headers["Authorization"] = `Basic ${auth}`
    }

    const response = await fetch(shopifyUrl, {
      method: "GET",
      headers,
    })

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Shopifyへの接続に成功しました",
      })
    } else {
      const errorText = await response.text()
      return NextResponse.json(
        {
          success: false,
          error: `接続に失敗しました: ${response.status} ${errorText}`,
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Error testing Shopify connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: `接続テストに失敗しました: ${error.message}`,
      },
      { status: 500 }
    )
  }
}

