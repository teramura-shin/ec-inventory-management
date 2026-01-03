"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Trash2 } from "lucide-react"

interface PurchaseOrder {
  id: string
  orderDate: string
  quantity: number
  unitPrice: number | null
  status: string
  expectedDeliveryDate: string | null
  actualDeliveryDate: string | null
  product: {
    id: string
    sku: string
    name: string
  }
  supplier: {
    id: string
    name: string
  }
}

export default function PurchaseOrdersList() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [supplierFilter, setSupplierFilter] = useState("")

  useEffect(() => {
    fetchSuppliers()
    fetchOrders()
  }, [statusFilter, supplierFilter])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers")
      const data = await response.json()
      if (response.ok) {
        setSuppliers(data.suppliers)
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append("status", statusFilter)
      if (supplierFilter) params.append("supplierId", supplierFilter)

      const response = await fetch(`/api/purchase-orders?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return

    try {
      const response = await fetch(`/api/purchase-orders/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchOrders()
      } else {
        alert("削除に失敗しました")
      }
    } catch (error) {
      alert("削除に失敗しました")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "発注済み":
        return "bg-blue-100 text-blue-800"
      case "入荷済み":
        return "bg-green-100 text-green-800"
      case "キャンセル":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div>
      {/* フィルタ */}
      <div className="mb-6 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">すべてのステータス</option>
          <option value="発注済み">発注済み</option>
          <option value="入荷済み">入荷済み</option>
          <option value="キャンセル">キャンセル</option>
        </select>
        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">すべての発注先</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      {/* 発注一覧 */}
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          発注が見つかりませんでした
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  発注日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  商品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  発注先
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  単価
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  入荷予定日
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link
                      href={`/products/${order.product.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {order.product.name}
                    </Link>
                    <p className="text-xs text-gray-500">{order.product.sku}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {order.supplier.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {order.quantity}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {order.unitPrice
                      ? `¥${order.unitPrice.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {order.expectedDeliveryDate
                      ? new Date(
                          order.expectedDeliveryDate
                        ).toLocaleDateString("ja-JP")
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/purchase-orders/${order.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

