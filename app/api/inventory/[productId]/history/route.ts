import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    const history = await prisma.inventoryHistory.findMany({
      where: { productId: params.productId },
      orderBy: { changeDate: "desc" },
      take: limit,
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching inventory history:", error)
    return NextResponse.json(
      { error: "在庫履歴の取得に失敗しました" },
      { status: 500 }
    )
  }
}

