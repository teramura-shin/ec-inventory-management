"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Package, AlertTriangle, TrendingDown } from "lucide-react"

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    alertCount: 0,
    lowStockCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000) // 1分ごとに更新
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const [productsRes, alertsRes] = await Promise.all([
        fetch("/api/products?limit=1"),
        fetch("/api/alerts/count"),
      ])

      const productsData = await productsRes.json()
      const alertsData = await alertsRes.json()

      setStats({
        totalProducts: productsData.total || 0,
        alertCount: alertsData.count || 0,
        lowStockCount: alertsData.count || 0, // 暫定的にアラート数を使用
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="h-20 animate-pulse bg-gray-200"></div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="h-20 animate-pulse bg-gray-200"></div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="h-20 animate-pulse bg-gray-200"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Link
        href="/products"
        className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-600">総商品数</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalProducts}
            </p>
          </div>
          <Package className="h-12 w-12 text-blue-600" />
        </div>
      </Link>

      <Link
        href="/alerts"
        className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-600">アラート商品</h2>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {stats.alertCount}
            </p>
          </div>
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>
      </Link>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-600">低在庫商品</h2>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {stats.lowStockCount}
            </p>
          </div>
          <TrendingDown className="h-12 w-12 text-yellow-600" />
        </div>
      </div>
    </div>
  )
}

