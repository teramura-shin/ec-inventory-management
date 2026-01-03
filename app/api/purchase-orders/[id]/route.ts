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

    const order = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        supplier: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "発注が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error fetching purchase order:", error)
    return NextResponse.json(
      { error: "発注の取得に失敗しました" },
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
      supplierId,
      productId,
      orderDate,
      quantity,
      unitPrice,
      status,
      expectedDeliveryDate,
      actualDeliveryDate,
      notes,
    } = body

    const order = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: {
        supplierId,
        productId,
        orderDate: orderDate ? new Date(orderDate) : undefined,
        quantity: quantity ? parseInt(quantity) : undefined,
        unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
        status,
        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate)
          : undefined,
        actualDeliveryDate: actualDeliveryDate
          ? new Date(actualDeliveryDate)
          : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
      include: {
        product: true,
        supplier: true,
      },
    })

    // 入荷済みの場合、在庫を更新
    if (status === "入荷済み" && order.actualDeliveryDate) {
      const inventory = await prisma.inventory.findUnique({
        where: { productId: order.productId },
      })

      if (inventory) {
        const newQuantity = inventory.currentQuantity + order.quantity

        await prisma.inventory.update({
          where: { productId: order.productId },
          data: { currentQuantity: newQuantity },
        })

        // 在庫履歴を記録
        await prisma.inventoryHistory.create({
          data: {
            productId: order.productId,
            changeDate: new Date(),
            previousQuantity: inventory.currentQuantity,
            newQuantity,
            changeType: "入荷",
            notes: `発注ID: ${order.id}`,
          },
        })
      }
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error("Error updating purchase order:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "発注が見つかりません" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "発注の更新に失敗しました" },
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

    await prisma.purchaseOrder.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting purchase order:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "発注が見つかりません" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "発注の削除に失敗しました" },
      { status: 500 }
    )
  }
}

