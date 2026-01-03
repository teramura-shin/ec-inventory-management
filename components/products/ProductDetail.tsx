"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, Trash2, Package, AlertTriangle } from "lucide-react"

interface ProductDetailProps {
  productId: string
}

interface Product {
  id: string
  sku: string
  name: string
  category: string | null
  purchasePrice: number | null
  sellingPrice: number | null
  predictedWeeklySales: number
  inventory: {
    currentQuantity: number
  } | null
  supplier: {
    name: string
    leadTimeDays: number | null
  } | null
  weeksUntilOut: number | null
}

interface LastOrder {
  id: string
  orderDate: string
  quantity: number
  status: string
  expectedDeliveryDate: string | null
  expectedArrivalDate: string | null
  supplier: {
    name: string
    leadTimeDays: number | null
  }
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
    fetchLastOrder()
  }, [productId])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()

      if (response.ok) {
        setProduct(data)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLastOrder = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/last-order`)
      const data = await response.json()

      if (response.ok && data.order) {
        setLastOrder(data.order)
      }
    } catch (error) {
      console.error("Error fetching last order:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？")) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/products")
        router.refresh()
      } else {
        alert("削除に失敗しました")
      }
    } catch (error) {
      alert("削除に失敗しました")
    }
  }

  const getWeeksUntilOutColor = (weeks: number | null) => {
    if (weeks === null) return "text-gray-500"
    if (weeks < 2) return "text-red-600 font-bold"
    if (weeks < 4) return "text-yellow-600"
    return "text-green-600"
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  if (!product) {
    return <div className="text-center py-8 text-red-500">商品が見つかりません</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-1 text-gray-500">SKU: {product.sku}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/products/${productId}/edit`}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" />
            編集
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 基本情報 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">基本情報</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">SKU</dt>
              <dd className="mt-1 text-sm text-gray-900">{product.sku}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">商品名</dt>
              <dd className="mt-1 text-sm text-gray-900">{product.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">カテゴリ</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.category || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">仕入価格</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.purchasePrice
                  ? `¥${product.purchasePrice.toLocaleString()}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">販売価格</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.sellingPrice
                  ? `¥${product.sellingPrice.toLocaleString()}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">発注先</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.supplier?.name || "-"}
              </dd>
            </div>
          </dl>
        </div>

        {/* 在庫情報 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">在庫情報</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">現在在庫数</dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900">
                {product.inventory?.currentQuantity || 0}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                在庫切れまでの週数
              </dt>
              <dd className="mt-1">
                <span
                  className={`text-2xl font-bold ${getWeeksUntilOutColor(
                    product.weeksUntilOut
                  )}`}
                >
                  {product.weeksUntilOut !== null
                    ? `${product.weeksUntilOut}週`
                    : "-"}
                </span>
                {product.weeksUntilOut !== null && product.weeksUntilOut < 2 && (
                  <div className="mt-2 flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    アラート: 在庫が少なくなっています
                  </div>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                週次予測販売数
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.predictedWeeklySales}個/週
              </dd>
            </div>
            {product.supplier?.leadTimeDays && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  発注先リードタイム
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.supplier.leadTimeDays}日
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* 最終発注情報 */}
      {lastOrder && (
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">最終発注情報</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">発注日</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(lastOrder.orderDate).toLocaleDateString("ja-JP")}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">発注数量</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {lastOrder.quantity}個
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">発注先</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {lastOrder.supplier.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ステータス</dt>
              <dd className="mt-1 text-sm text-gray-900">{lastOrder.status}</dd>
            </div>
            {lastOrder.expectedArrivalDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  入荷予測日（リードタイム考慮）
                </dt>
                <dd className="mt-1 text-sm font-semibold text-blue-600">
                  {new Date(lastOrder.expectedArrivalDate).toLocaleDateString(
                    "ja-JP"
                  )}
                </dd>
              </div>
            )}
            {lastOrder.expectedDeliveryDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  入荷予定日
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(
                    lastOrder.expectedDeliveryDate
                  ).toLocaleDateString("ja-JP")}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  )
}

