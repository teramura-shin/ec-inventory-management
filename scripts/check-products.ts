import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("商品を確認しています...")

  const products = await prisma.product.findMany({
    include: {
      inventory: true,
      supplier: true,
    },
    take: 10,
  })

  if (products.length === 0) {
    console.log("❌ 商品が登録されていません")
    console.log("商品管理画面から新規商品を登録してください")
  } else {
    console.log(`✅ ${products.length}件の商品が見つかりました（最大10件表示）:`)
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`)
      console.log(`   SKU: ${product.sku}`)
      console.log(`   在庫数: ${product.inventory?.currentQuantity || 0}`)
      console.log(`   発注先: ${product.supplier?.name || "未設定"}`)
    })
  }

  const totalProducts = await prisma.product.count()
  console.log(`\n総商品数: ${totalProducts}件`)
}

main()
  .catch((e) => {
    console.error("エラーが発生しました:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

