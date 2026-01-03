"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Package } from "lucide-react"

interface AlertProduct {
  id: string
  sku: string
  name: string
  category: string | null
  inventory: {
    currentQuantity: number
  }
  supplier: {
    name: string
  } | null
  weeksUntilOut: number | null
}

export default function AlertsList() {
  const [alerts, setAlerts] = useState<AlertProduct[]>([])
  const [count, setCount] = useState(0)
  const [threshold, setThreshold] = useState(2)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000) // 1分ごとに更新
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      const data = await response.json()

      if (response.ok) {
        setAlerts(data.alerts)
        setCount(data.count)
        setThreshold(data.threshold)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getWeeksUntilOutColor = (weeks: number | null) => {
    if (weeks === null) return "text-gray-500"
    if (weeks < 1) return "text-red-700 font-bold"
    if (weeks < 2) return "text-red-600 font-bold"
    return "text-yellow-600"
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div>
      {/* サマリー */}
      <div className="mb-6 rounded-lg bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h2 className="text-lg font-semibold text-red-900">
              アラート商品: {count}件
            </h2>
            <p className="text-sm text-red-700">
              在庫切れまでの週数が{threshold}週未満の商品
            </p>
          </div>
        </div>
      </div>

      {/* アラート一覧 */}
      {alerts.length === 0 ? (
        <div className="rounded-lg bg-green-50 p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-green-600" />
          <p className="mt-4 text-lg font-medium text-green-900">
            アラート商品はありません
          </p>
          <p className="mt-2 text-sm text-green-700">
            すべての商品の在庫が十分にあります
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-red-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-red-700">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-red-700">
                  商品名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-red-700">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-red-700">
                  現在在庫数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-red-700">
                  在庫切れまでの週数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-red-700">
                  発注先
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-red-700">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {alerts.map((product) => (
                <tr key={product.id} className="bg-red-50 hover:bg-red-100">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-red-600 hover:text-red-800"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {product.category || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                    {product.inventory.currentQuantity}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span
                        className={getWeeksUntilOutColor(product.weeksUntilOut)}
                      >
                        {product.weeksUntilOut !== null
                          ? `${product.weeksUntilOut}週`
                          : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {product.supplier?.name || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

