import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("データベースの初期化を開始します...")

  // 初期ユーザーの作成（既に存在する場合はスキップ）
  const existingUser = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  })

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("admin123", 10)
    const user = await prisma.user.create({
      data: {
        email: "admin@example.com",
        passwordHash: hashedPassword,
        name: "管理者",
      },
    })
    console.log("初期ユーザーを作成しました:", user.email)
    console.log("パスワード: admin123")
  } else {
    console.log("初期ユーザーは既に存在します")
  }

  // アラート設定のデフォルト値を作成
  const users = await prisma.user.findMany()
  for (const user of users) {
    const existingSetting = await prisma.alertSetting.findUnique({
      where: { userId: user.id },
    })

    if (!existingSetting) {
      await prisma.alertSetting.create({
        data: {
          userId: user.id,
          alertThresholdWeeks: 2,
          emailNotification: false,
          lineNotification: false,
          slackNotification: false,
        },
      })
      console.log(`ユーザー ${user.email} のアラート設定を作成しました`)
    }
  }

  console.log("データベースの初期化が完了しました！")
}

main()
  .catch((e) => {
    console.error("エラーが発生しました:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

