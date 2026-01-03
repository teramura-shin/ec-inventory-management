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

    const inventory = await prisma.inventory.findUnique({
      where: { productId: params.productId },
      include: {
        product: true,
      },
    })

    if (!inventory) {
      return NextResponse.json(
        { error: "在庫が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { error: "在庫の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await requireAuth()

    const body = await request.json()
    const { quantity, changeType, notes } = body

    if (quantity === undefined) {
      return NextResponse.json(
        { error: "在庫数は必須です" },
        { status: 400 }
      )
    }

    // 現在の在庫を取得
    const currentInventory = await prisma.inventory.findUnique({
      where: { productId: params.productId },
    })

    if (!currentInventory) {
      return NextResponse.json(
        { error: "在庫が見つかりません" },
        { status: 404 }
      )
    }

    const previousQuantity = currentInventory.currentQuantity
    const newQuantity = parseInt(quantity)

    // 在庫を更新
    const updatedInventory = await prisma.inventory.update({
      where: { productId: params.productId },
      data: {
        currentQuantity: newQuantity,
      },
    })

    // 在庫履歴を記録
    await prisma.inventoryHistory.create({
      data: {
        productId: params.productId,
        changeDate: new Date(),
        previousQuantity,
        newQuantity,
        changeType: changeType || "調整",
        notes: notes || null,
      },
    })

    return NextResponse.json({ inventory: updatedInventory })
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json(
      { error: "在庫の更新に失敗しました" },
      { status: 500 }
    )
  }
}

