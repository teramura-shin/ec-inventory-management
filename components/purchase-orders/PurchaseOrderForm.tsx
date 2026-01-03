"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface PurchaseOrderFormProps {
  orderId?: string
}

export default function PurchaseOrderForm({ orderId }: PurchaseOrderFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [products, setProducts] = useState<
    { id: string; sku: string; name: string }[]
  >([])
  const [formData, setFormData] = useState({
    supplierId: "",
    productId: "",
    orderDate: new Date().toISOString().split("T")[0],
    quantity: "",
    unitPrice: "",
    status: "発注済み",
    expectedDeliveryDate: "",
    actualDeliveryDate: "",
    notes: "",
  })

  useEffect(() => {
    fetchSuppliers()
    fetchProducts()
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

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

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?limit=1000")
      const data = await response.json()
      if (response.ok) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/purchase-orders/${orderId}`)
      const data = await response.json()
      if (response.ok) {
        const order = data.order
        setFormData({
          supplierId: order.supplierId,
          productId: order.productId,
          orderDate: new Date(order.orderDate).toISOString().split("T")[0],
          quantity: order.quantity.toString(),
          unitPrice: order.unitPrice?.toString() || "",
          status: order.status,
          expectedDeliveryDate: order.expectedDeliveryDate
            ? new Date(order.expectedDeliveryDate).toISOString().split("T")[0]
            : "",
          actualDeliveryDate: order.actualDeliveryDate
            ? new Date(order.actualDeliveryDate).toISOString().split("T")[0]
            : "",
          notes: order.notes || "",
        })
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = orderId
        ? `/api/purchase-orders/${orderId}`
        : "/api/purchase-orders"
      const method = orderId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/purchase-orders")
        router.refresh()
      } else {
        alert(data.error || "エラーが発生しました")
      }
    } catch (error) {
      alert("エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          発注先 <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.supplierId}
          onChange={(e) =>
            setFormData({ ...formData, supplierId: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          商品 <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.productId}
          onChange={(e) =>
            setFormData({ ...formData, productId: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.sku} - {product.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            発注日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.orderDate}
            onChange={(e) =>
              setFormData({ ...formData, orderDate: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            数量 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            単価
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) =>
              setFormData({ ...formData, unitPrice: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            ステータス
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="発注済み">発注済み</option>
            <option value="入荷済み">入荷済み</option>
            <option value="キャンセル">キャンセル</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            入荷予定日
          </label>
          <input
            type="date"
            value={formData.expectedDeliveryDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                expectedDeliveryDate: e.target.value,
              })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            入荷日
          </label>
          <input
            type="date"
            value={formData.actualDeliveryDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                actualDeliveryDate: e.target.value,
              })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">備考</label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}

