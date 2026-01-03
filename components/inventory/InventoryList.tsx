"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Package, Plus, Minus } from "lucide-react"

interface Inventory {
  id: string
  currentQuantity: number
  product: {
    id: string
    sku: string
    name: string
    category: string | null
  }
  weeksUntilOut: number | null
}

export default function InventoryList() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const [adjustment, setAdjustment] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetchInventories()
  }, [search])

  const fetchInventories = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)

      const response = await fetch(`/api/inventory?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setInventories(data.inventories)
      }
    } catch (error) {
      console.error("Error fetching inventories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdjust = async (productId: string) => {
    if (!adjustment || parseInt(adjustment) === 0) {
      alert("調整数量を入力してください")
      return
    }

    try {
      const response = await fetch(`/api/inventory/${productId}/adjust`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adjustment: parseInt(adjustment),
          changeType: parseInt(adjustment) > 0 ? "入荷" : "出荷",
          notes: notes || null,
        }),
      })

      if (response.ok) {
        setAdjustingId(null)
        setAdjustment("")
        setNotes("")
        fetchInventories()
      } else {
        const data = await response.json()
        alert(data.error || "在庫の調整に失敗しました")
      }
    } catch (error) {
      alert("在庫の調整に失敗しました")
    }
  }

  const getWeeksUntilOutColor = (weeks: number | null) => {
    if (weeks === null) return "text-gray-500"
    if (weeks < 2) return "text-red-600 font-bold"
    if (weeks < 4) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div>
      {/* 検索 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="商品名またはSKUで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 在庫一覧 */}
      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : inventories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          在庫が見つかりませんでした
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
                  現在在庫数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  在庫切れまでの週数
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {inventories.map((inventory) => (
                <tr key={inventory.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {inventory.product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link
                      href={`/products/${inventory.product.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {inventory.product.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {inventory.product.category || "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                    {inventory.currentQuantity}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={getWeeksUntilOutColor(inventory.weeksUntilOut)}
                    >
                      {inventory.weeksUntilOut !== null
                        ? `${inventory.weeksUntilOut}週`
                        : "-"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    {adjustingId === inventory.product.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={adjustment}
                          onChange={(e) => setAdjustment(e.target.value)}
                          placeholder="数量"
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="備考"
                          className="w-32 rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => handleAdjust(inventory.product.id)}
                          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                        >
                          確定
                        </button>
                        <button
                          onClick={() => {
                            setAdjustingId(null)
                            setAdjustment("")
                            setNotes("")
                          }}
                          className="rounded bg-gray-300 px-3 py-1 text-sm hover:bg-gray-400"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setAdjustingId(inventory.product.id)
                            setAdjustment("")
                            setNotes("")
                          }}
                          className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                        >
                          <Package className="h-4 w-4" />
                          調整
                        </button>
                        <Link
                          href={`/products/${inventory.product.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          詳細
                        </Link>
                      </div>
                    )}
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

