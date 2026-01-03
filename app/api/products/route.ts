import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { calculateWeeksUntilOut } from "@/lib/inventory"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // 検索条件を構築
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ]
    }
    if (category) {
      where.category = category
    }

    // 商品一覧を取得
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          inventory: true,
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // 在庫切れまでの週数を計算
    const productsWithWeeks = await Promise.all(
      products.map(async (product) => {
        let weeksUntilOut = Infinity
        try {
          if (product.inventory) {
            weeksUntilOut = await calculateWeeksUntilOut(
              product.id,
              product.inventory.currentQuantity
            )
          }
        } catch (error) {
          console.error(`Error calculating weeks for product ${product.id}:`, error)
          // エラーが発生しても商品は表示する
          weeksUntilOut = Infinity
        }

        return {
          ...product,
          shopifyProductId: product.shopifyProductId?.toString() || null,
          shopifyVariantId: product.shopifyVariantId?.toString() || null,
          weeksUntilOut: isFinite(weeksUntilOut)
            ? Math.round(weeksUntilOut * 10) / 10
            : null,
        }
      })
    )

    // カテゴリ一覧を取得（フィルタ用）
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      where: { category: { not: null } },
    })

    return NextResponse.json({
      products: productsWithWeeks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories: categories.map((c) => c.category).filter(Boolean),
    })
  } catch (error: any) {
    console.error("Error fetching products:", error)
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    })
    return NextResponse.json(
      { 
        error: "商品の取得に失敗しました",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const {
      sku,
      name,
      category,
      purchasePrice,
      sellingPrice,
      predictedWeeklySales,
      supplierId,
      shopifyProductId,
      shopifyVariantId,
    } = body

    // バリデーション
    if (!sku || !name) {
      return NextResponse.json(
        { error: "SKUと商品名は必須です" },
        { status: 400 }
      )
    }

    // 商品を作成
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        category: category || null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
        predictedWeeklySales: predictedWeeklySales
          ? parseInt(predictedWeeklySales)
          : 0,
        supplierId: supplierId || null,
        shopifyProductId: shopifyProductId
          ? BigInt(shopifyProductId)
          : null,
        shopifyVariantId: shopifyVariantId
          ? BigInt(shopifyVariantId)
          : null,
      },
    })

    // 在庫レコードを作成
    await prisma.inventory.create({
      data: {
        productId: product.id,
        currentQuantity: 0,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating product:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "このSKUは既に登録されています" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "商品の作成に失敗しました" },
      { status: 500 }
    )
  }
}

