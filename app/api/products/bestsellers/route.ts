import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { subDays } from "date-fns"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // デフォルト30日間
    const limit = parseInt(searchParams.get("limit") || "10")

    const days = parseInt(period)
    const startDate = subDays(new Date(), days)

    // 期間内の販売実績を集計
    const salesData = await prisma.salesHistory.groupBy({
      by: ["productId"],
      where: {
        soldDate: {
          gte: startDate,
        },
      },
      _sum: {
        soldQuantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          soldQuantity: "desc",
        },
      },
      take: limit,
    })

    // 商品情報を取得
    const productIds = salesData.map((data) => data.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        inventory: true,
        supplier: {
          select: {
            name: true,
          },
        },
      },
    })

    // 商品情報と販売実績を結合
    const bestsellers = salesData.map((data) => {
      const product = products.find((p) => p.id === data.productId)
      return {
        product: product || null,
        totalSold: data._sum.soldQuantity || 0,
        orderCount: data._count.id || 0,
        averageDailySales:
          (data._sum.soldQuantity || 0) / days,
      }
    })

    return NextResponse.json({
      bestsellers,
      period: days,
    })
  } catch (error) {
    console.error("Error fetching bestsellers:", error)
    return NextResponse.json(
      { error: "売れ筋商品の取得に失敗しました" },
      { status: 500 }
    )
  }
}

