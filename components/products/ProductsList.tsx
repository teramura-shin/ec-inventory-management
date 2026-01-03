"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Package, AlertTriangle } from "lucide-react"

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
  } | null
  weeksUntilOut: number | null
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (category) params.append("category", category)

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products || [])
        if (data.categories) {
          setCategories(data.categories)
        }
      } else {
        setError(data.error || "商品の取得に失敗しました")
        console.error("API Error:", data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("商品の取得に失敗しました。ネットワークエラーを確認してください。")
    } finally {
      setLoading(false)
    }
  }

  const getWeeksUntilOutColor = (weeks: number | null) => {
    if (weeks === null) return "text-gray-500"
    if (weeks < 2) return "text-red-600 font-bold"
    if (weeks < 4) return "text-yellow-600"
    return "text-green-600"
  }

  const getWeeksUntilOutBadge = (weeks: number | null) => {
    if (weeks === null) return null
    if (weeks < 2)
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
          <AlertTriangle className="mr-1 h-3 w-3" />
          アラート
        </span>
      )
    return null
  }

  return (
    <div>
      {/* 検索・フィルタ */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="商品名またはSKUで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">すべてのカテゴリ</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* 商品一覧 */}
      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">商品が見つかりませんでした</p>
          <Link
            href="/products/new"
            className="text-blue-600 hover:text-blue-800"
          >
            新規商品を登録する →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  商品名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  在庫数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  在庫切れまでの週数
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
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {product.category || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {product.inventory?.currentQuantity || 0}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={getWeeksUntilOutColor(product.weeksUntilOut)}
                      >
                        {product.weeksUntilOut !== null
                          ? `${product.weeksUntilOut}週`
                          : "-"}
                      </span>
                      {getWeeksUntilOutBadge(product.weeksUntilOut)}
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

