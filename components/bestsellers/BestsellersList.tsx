"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, Package } from "lucide-react"

interface Bestseller {
  product: {
    id: string
    sku: string
    name: string
    category: string | null
    inventory: {
      currentQuantity: number
    } | null
    supplier: {
      name: string
      leadTimeDays: number | null
    } | null
  } | null
  totalSold: number
  orderCount: number
  averageDailySales: number
}

export default function BestsellersList() {
  const [bestsellers, setBestsellers] = useState<Bestseller[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")

  useEffect(() => {
    fetchBestsellers()
  }, [period])

  const fetchBestsellers = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/products/bestsellers?period=${period}&limit=20`
      )
      const data = await response.json()

      if (response.ok) {
        setBestsellers(data.bestsellers)
      }
    } catch (error) {
      console.error("Error fetching bestsellers:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div>
      {/* 期間選択 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          集計期間
        </label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="mt-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="7">直近7日間</option>
          <option value="30">直近30日間</option>
          <option value="60">直近60日間</option>
          <option value="90">直近90日間</option>
        </select>
      </div>

      {/* 売れ筋商品一覧 */}
      {bestsellers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          売れ筋商品が見つかりませんでした
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  順位
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  商品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  総販売数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  注文件数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  1日平均販売数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  現在在庫数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  発注先
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {bestsellers.map((item, index) => {
                if (!item.product) return null

                return (
                  <tr key={item.product.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <TrendingUp className="h-4 w-4 text-yellow-500" />
                        )}
                        {index + 1}位
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {item.product.sku}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.product.category || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                      {item.totalSold}個
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.orderCount}件
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {item.averageDailySales.toFixed(1)}個/日
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {item.product.inventory?.currentQuantity || 0}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.product.supplier?.name || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

