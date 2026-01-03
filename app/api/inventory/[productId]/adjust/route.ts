import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await requireAuth()

    const body = await request.json()
    const { adjustment, changeType, notes } = body

    if (adjustment === undefined) {
      return NextResponse.json(
        { error: "調整数量は必須です" },
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
    const adjustmentValue = parseInt(adjustment)
    const newQuantity = previousQuantity + adjustmentValue

    if (newQuantity < 0) {
      return NextResponse.json(
        { error: "在庫数が負の値になることはできません" },
        { status: 400 }
      )
    }

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
        changeType: changeType || (adjustmentValue > 0 ? "入荷" : "出荷"),
        notes: notes || null,
      },
    })

    return NextResponse.json({ inventory: updatedInventory })
  } catch (error) {
    console.error("Error adjusting inventory:", error)
    return NextResponse.json(
      { error: "在庫の調整に失敗しました" },
      { status: 500 }
    )
  }
}

