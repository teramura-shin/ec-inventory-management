import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("ユーザーを確認しています...")

  const users = await prisma.user.findMany()

  if (users.length === 0) {
    console.log("❌ ユーザーが存在しません")
    console.log("以下のコマンドを実行して初期ユーザーを作成してください:")
    console.log("npm run db:init")
  } else {
    console.log(`✅ ${users.length}人のユーザーが見つかりました:`)
    users.forEach((user) => {
      console.log(`  - ${user.email} (${user.name || "名前なし"})`)
    })
  }
}

main()
  .catch((e) => {
    console.error("エラーが発生しました:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

