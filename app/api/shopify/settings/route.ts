import { NextRequest, NextResponse } from "next/server"
import { requireAuth, getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const setting = await prisma.shopifySetting.findUnique({
      where: { userId: user.id },
    })

    // 機密情報は返さない（マスク）
    if (setting) {
      return NextResponse.json({
        setting: {
          ...setting,
          apiKey: setting.apiKey ? "***" : null,
          apiSecret: setting.apiSecret ? "***" : null,
          accessToken: setting.accessToken ? "***" : null,
        },
      })
    }

    return NextResponse.json({ setting: null })
  } catch (error) {
    console.error("Error fetching Shopify settings:", error)
    return NextResponse.json(
      { error: "Shopify設定の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { storeName, apiKey, apiSecret, accessToken, webhookSecret } = body

    if (!storeName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "ストア名、APIキー、APIシークレットは必須です" },
        { status: 400 }
      )
    }

    // 既存の設定を確認
    const existing = await prisma.shopifySetting.findUnique({
      where: { userId: user.id },
    })

    let setting
    if (existing) {
      setting = await prisma.shopifySetting.update({
        where: { userId: user.id },
        data: {
          storeName,
          apiKey, // 実際の運用では暗号化が必要
          apiSecret, // 実際の運用では暗号化が必要
          accessToken: accessToken || null,
          webhookSecret: webhookSecret || null,
          syncEnabled: true,
        },
      })
    } else {
      setting = await prisma.shopifySetting.create({
        data: {
          userId: user.id,
          storeName,
          apiKey, // 実際の運用では暗号化が必要
          apiSecret, // 実際の運用では暗号化が必要
          accessToken: accessToken || null,
          webhookSecret: webhookSecret || null,
          syncEnabled: true,
        },
      })
    }

    return NextResponse.json({
      setting: {
        ...setting,
        apiKey: "***",
        apiSecret: "***",
        accessToken: setting.accessToken ? "***" : null,
      },
    })
  } catch (error) {
    console.error("Error saving Shopify settings:", error)
    return NextResponse.json(
      { error: "Shopify設定の保存に失敗しました" },
      { status: 500 }
    )
  }
}

