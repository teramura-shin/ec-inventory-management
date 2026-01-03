import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { calculateWeeksUntilOut, checkAlert } from "@/lib/inventory"

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
        product: true,
      },
    })

    // アラート商品数をカウント
    let count = 0
    for (const inventory of inventories) {
      const weeksUntilOut = await calculateWeeksUntilOut(
        inventory.productId,
        inventory.currentQuantity
      )

      if (checkAlert(weeksUntilOut, threshold)) {
        count++
      }
    }

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error counting alerts:", error)
    return NextResponse.json(
      { error: "アラート数の取得に失敗しました" },
      { status: 500 }
    )
  }
}

