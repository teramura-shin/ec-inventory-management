import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const setting = await prisma.shopifySetting.findUnique({
      where: { userId: user.id },
    })

    if (!setting || !setting.syncEnabled) {
      return NextResponse.json(
        { error: "Shopify設定が有効になっていません" },
        { status: 400 }
      )
    }

    // Shopify APIから商品と在庫情報を取得
    const shopifyUrl = `https://${setting.storeName}.myshopify.com/admin/api/2024-01/products.json?limit=250`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (setting.accessToken) {
      headers["X-Shopify-Access-Token"] = setting.accessToken
    } else if (setting.apiKey && setting.apiSecret) {
      const auth = Buffer.from(
        `${setting.apiKey}:${setting.apiSecret}`
      ).toString("base64")
      headers["Authorization"] = `Basic ${auth}`
    }

    const response = await fetch(shopifyUrl, {
      method: "GET",
      headers,
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Shopify APIへの接続に失敗しました" },
        { status: 400 }
      )
    }

    const data = await response.json()
    const products = data.products || []

    let syncedCount = 0
    let createdCount = 0
    let updatedCount = 0

    for (const shopifyProduct of products) {
      for (const variant of shopifyProduct.variants || []) {
        // 商品を検索または作成
        let product = await prisma.product.findFirst({
          where: { shopifyVariantId: BigInt(variant.id) },
        })

        if (!product) {
          // 新規商品を作成
          product = await prisma.product.create({
            data: {
              sku: variant.sku || `SHOPIFY-${variant.id}`,
              name: shopifyProduct.title,
              shopifyProductId: BigInt(shopifyProduct.id),
              shopifyVariantId: BigInt(variant.id),
            },
          })
          createdCount++

          // 在庫レコードを作成
          await prisma.inventory.create({
            data: {
              productId: product.id,
              currentQuantity: variant.inventory_quantity || 0,
            },
          })
        } else {
          updatedCount++
        }

        // 在庫数を更新
        const inventory = await prisma.inventory.findUnique({
          where: { productId: product.id },
        })

        if (inventory) {
          const previousQuantity = inventory.currentQuantity
          const newQuantity = variant.inventory_quantity || 0

          if (previousQuantity !== newQuantity) {
            await prisma.inventory.update({
              where: { productId: product.id },
              data: {
                currentQuantity: newQuantity,
                lastSyncedAt: new Date(),
              },
            })

            // 在庫履歴を記録
            await prisma.inventoryHistory.create({
              data: {
                productId: product.id,
                changeDate: new Date(),
                previousQuantity,
                newQuantity,
                changeType: "同期",
                notes: "Shopify同期",
              },
            })
          }
        }

        syncedCount++
      }
    }

    // 最終同期日時を更新
    await prisma.shopifySetting.update({
      where: { userId: user.id },
      data: { lastSyncAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: "同期が完了しました",
      syncedCount,
      createdCount,
      updatedCount,
    })
  } catch (error: any) {
    console.error("Error syncing with Shopify:", error)
    return NextResponse.json(
      { error: `同期に失敗しました: ${error.message}` },
      { status: 500 }
    )
  }
}

