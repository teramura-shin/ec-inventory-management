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

    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            sku: true,
            name: true,
          },
        },
      },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: "発注先が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json({ supplier })
  } catch (error) {
    console.error("Error fetching supplier:", error)
    return NextResponse.json(
      { error: "発注先の取得に失敗しました" },
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
    const { name, contactPerson, email, phone, address, leadTimeDays } = body

    if (!name) {
      return NextResponse.json(
        { error: "発注先名は必須です" },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        name,
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        leadTimeDays: leadTimeDays ? parseInt(leadTimeDays) : 7,
      },
    })

    return NextResponse.json({ supplier })
  } catch (error: any) {
    console.error("Error updating supplier:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "発注先が見つかりません" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "発注先の更新に失敗しました" },
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

    await prisma.supplier.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting supplier:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "発注先が見つかりません" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "発注先の削除に失敗しました" },
      { status: 500 }
    )
  }
}

