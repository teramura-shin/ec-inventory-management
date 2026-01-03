import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { calculateWeeksUntilOut } from "@/lib/inventory"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        inventory: true,
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        salesHistory: {
          orderBy: { soldDate: "desc" },
          take: 100,
        },
        inventoryHistory: {
          orderBy: { changeDate: "desc" },
          take: 50,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "商品が見つかりません" },
        { status: 404 }
      )
    }

    // 在庫切れまでの週数を計算
    const weeksUntilOut = product.inventory
      ? await calculateWeeksUntilOut(
          product.id,
          product.inventory.currentQuantity
        )
      : Infinity

    return NextResponse.json({
      ...product,
      shopifyProductId: product.shopifyProductId?.toString() || null,
      shopifyVariantId: product.shopifyVariantId?.toString() || null,
      weeksUntilOut: isFinite(weeksUntilOut)
        ? Math.round(weeksUntilOut * 10) / 10
        : null,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "商品の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const product = await prisma.product.update({
      where: { id: params.id },
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

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error("Error updating product:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "商品が見つかりません" },
        { status: 404 }
      )
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "このSKUは既に登録されています" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "商品の更新に失敗しました" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()

    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting product:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "商品が見つかりません" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "商品の削除に失敗しました" },
      { status: 500 }
    )
  }
}

