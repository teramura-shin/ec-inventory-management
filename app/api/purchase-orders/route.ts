import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || ""
    const supplierId = searchParams.get("supplierId") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (supplierId) {
      where.supplierId = supplierId
    }

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { orderDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching purchase orders:", error)
    return NextResponse.json(
      { error: "発注の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      notes,
    } = body

    if (!supplierId || !productId || !orderDate || !quantity) {
      return NextResponse.json(
        { error: "発注先、商品、発注日、数量は必須です" },
        { status: 400 }
      )
    }

    const order = await prisma.purchaseOrder.create({
      data: {
        supplierId,
        productId,
        orderDate: new Date(orderDate),
        quantity: parseInt(quantity),
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        status: status || "発注済み",
        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate)
          : null,
        notes: notes || null,
      },
      include: {
        product: true,
        supplier: true,
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Error creating purchase order:", error)
    return NextResponse.json(
      { error: "発注の作成に失敗しました" },
      { status: 500 }
    )
  }
}

