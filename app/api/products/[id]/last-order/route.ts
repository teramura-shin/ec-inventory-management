import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    // 商品の最終発注情報を取得
    const lastOrder = await prisma.purchaseOrder.findFirst({
      where: {
        productId: params.id,
        status: {
          not: "キャンセル",
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    })

    if (!lastOrder) {
      return NextResponse.json({ order: null })
    }

    // リードタイムを考慮した入荷予測日を計算
    // 注意: leadTimeDaysはPrismaクライアント再生成後に有効になります
    let expectedArrivalDateStr: string | null = null
    // リードタイムの取得は後で実装（Prismaクライアント再生成後）

    return NextResponse.json({
      order: {
        ...lastOrder,
        expectedArrivalDate: expectedArrivalDateStr,
      },
    })
  } catch (error) {
    console.error("Error fetching last order:", error)
    return NextResponse.json(
      { error: "最終発注情報の取得に失敗しました" },
      { status: 500 }
    )
  }
}

