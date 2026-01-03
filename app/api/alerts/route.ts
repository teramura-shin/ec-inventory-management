import { NextRequest, NextResponse } from "next/server"
import { requireAuth, getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { calculateWeeksUntilOut, checkAlert } from "@/lib/inventory"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // アラート設定を取得
    const alertSetting = await prisma.alertSetting.findUnique({
      where: { userId: user.id },
    })

    const threshold = alertSetting?.alertThresholdWeeks || 2

    // 全商品の在庫を取得
    const inventories = await prisma.inventory.findMany({
      include: {
        product: {
          include: {
            supplier: true,
          },
        },
      },
    })

    // アラート商品を抽出
    const alertProducts = []
    for (const inventory of inventories) {
      const weeksUntilOut = await calculateWeeksUntilOut(
        inventory.productId,
        inventory.currentQuantity
      )

      if (checkAlert(weeksUntilOut, threshold)) {
        alertProducts.push({
          ...inventory.product,
          inventory: {
            currentQuantity: inventory.currentQuantity,
          },
          weeksUntilOut: isFinite(weeksUntilOut)
            ? Math.round(weeksUntilOut * 10) / 10
            : null,
        })
      }
    }

    // 週数でソート（少ない順）
    alertProducts.sort((a, b) => {
      const aWeeks = a.weeksUntilOut || Infinity
      const bWeeks = b.weeksUntilOut || Infinity
      return aWeeks - bWeeks
    })

    return NextResponse.json({
      alerts: alertProducts,
      count: alertProducts.length,
      threshold,
    })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json(
      { error: "アラートの取得に失敗しました" },
      { status: 500 }
    )
  }
}

