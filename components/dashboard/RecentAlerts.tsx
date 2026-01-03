"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

interface AlertProduct {
  id: string
  sku: string
  name: string
  inventory: {
    currentQuantity: number
  }
  weeksUntilOut: number | null
}

export default function RecentAlerts() {
  const [alerts, setAlerts] = useState<AlertProduct[]>([])
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
        setAlerts(data.alerts.slice(0, 5)) // 上位5件のみ表示
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="h-40 animate-pulse bg-gray-200"></div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">在庫アラート</h2>
        <p className="text-center text-gray-500">アラート商品はありません</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">在庫アラート</h2>
        <Link
          href="/alerts"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          すべて見る →
        </Link>
      </div>
      <div className="space-y-3">
        {alerts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="block rounded-md border border-red-200 bg-red-50 p-3 transition-colors hover:bg-red-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-gray-900">
                    {product.name}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  SKU: {product.sku} | 在庫: {product.inventory.currentQuantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-600">
                  {product.weeksUntilOut !== null
                    ? `${product.weeksUntilOut}週`
                    : "-"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

