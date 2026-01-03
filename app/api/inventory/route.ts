import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { calculateWeeksUntilOut } from "@/lib/inventory"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.product = {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
        ],
      }
    }

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          product: {
            include: {
              supplier: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.inventory.count({ where }),
    ])

    // 在庫切れまでの週数を計算
    const inventoriesWithWeeks = await Promise.all(
      inventories.map(async (inventory) => {
        const weeksUntilOut = await calculateWeeksUntilOut(
          inventory.productId,
          inventory.currentQuantity
        )

        return {
          ...inventory,
          weeksUntilOut: isFinite(weeksUntilOut)
            ? Math.round(weeksUntilOut * 10) / 10
            : null,
        }
      })
    )

    return NextResponse.json({
      inventories: inventoriesWithWeeks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { error: "在庫の取得に失敗しました" },
      { status: 500 }
    )
  }
}

