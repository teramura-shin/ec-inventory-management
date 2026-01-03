import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ suppliers })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json(
      { error: "発注先の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        leadTimeDays: leadTimeDays ? parseInt(leadTimeDays) : 7,
      },
    })

    return NextResponse.json({ supplier }, { status: 201 })
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json(
      { error: "発注先の作成に失敗しました" },
      { status: 500 }
    )
  }
}

