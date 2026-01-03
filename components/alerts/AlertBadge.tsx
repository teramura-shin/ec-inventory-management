"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AlertBadge() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 60000) // 1分ごとに更新
    return () => clearInterval(interval)
  }, [])

  const fetchCount = async () => {
    try {
      const response = await fetch("/api/alerts/count")
      const data = await response.json()

      if (response.ok) {
        setCount(data.count)
      }
    } catch (error) {
      console.error("Error fetching alert count:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || count === 0) {
    return null
  }

  return (
    <Link
      href="/alerts"
      className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700"
    >
      <AlertTriangle className="h-5 w-5" />
      <span className="font-semibold">アラート: {count}件</span>
    </Link>
  )
}

