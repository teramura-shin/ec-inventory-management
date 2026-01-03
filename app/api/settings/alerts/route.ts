import { NextRequest, NextResponse } from "next/server"
import { requireAuth, getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    let alertSetting = await prisma.alertSetting.findUnique({
      where: { userId: user.id },
    })

    // 設定が存在しない場合はデフォルト値を作成
    if (!alertSetting) {
      alertSetting = await prisma.alertSetting.create({
        data: {
          userId: user.id,
          alertThresholdWeeks: 2,
          emailNotification: false,
          lineNotification: false,
          slackNotification: false,
        },
      })
    }

    return NextResponse.json({ setting: alertSetting })
  } catch (error) {
    console.error("Error fetching alert settings:", error)
    return NextResponse.json(
      { error: "アラート設定の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const {
      alertThresholdWeeks,
      emailNotification,
      emailAddress,
      lineNotification,
      lineWebhookUrl,
      slackNotification,
      slackWebhookUrl,
    } = body

    let alertSetting = await prisma.alertSetting.findUnique({
      where: { userId: user.id },
    })

    if (!alertSetting) {
      alertSetting = await prisma.alertSetting.create({
        data: {
          userId: user.id,
          alertThresholdWeeks: alertThresholdWeeks || 2,
          emailNotification: emailNotification || false,
          emailAddress: emailAddress || null,
          lineNotification: lineNotification || false,
          lineWebhookUrl: lineWebhookUrl || null,
          slackNotification: slackNotification || false,
          slackWebhookUrl: slackWebhookUrl || null,
        },
      })
    } else {
      alertSetting = await prisma.alertSetting.update({
        where: { userId: user.id },
        data: {
          alertThresholdWeeks: alertThresholdWeeks || 2,
          emailNotification: emailNotification || false,
          emailAddress: emailAddress || null,
          lineNotification: lineNotification || false,
          lineWebhookUrl: lineWebhookUrl || null,
          slackNotification: slackNotification || false,
          slackWebhookUrl: slackWebhookUrl || null,
        },
      })
    }

    return NextResponse.json({ setting: alertSetting })
  } catch (error) {
    console.error("Error updating alert settings:", error)
    return NextResponse.json(
      { error: "アラート設定の更新に失敗しました" },
      { status: 500 }
    )
  }
}

