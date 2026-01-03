"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Supplier {
  id: string
  name: string
}

interface ProductFormProps {
  productId?: string
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    purchasePrice: "",
    sellingPrice: "",
    predictedWeeklySales: "0",
    supplierId: "",
    shopifyProductId: "",
    shopifyVariantId: "",
  })

  useEffect(() => {
    fetchSuppliers()
    if (productId) {
      fetchProduct()
    }
  }, [productId])

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

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()
      if (response.ok) {
        setFormData({
          sku: data.sku,
          name: data.name,
          category: data.category || "",
          purchasePrice: data.purchasePrice?.toString() || "",
          sellingPrice: data.sellingPrice?.toString() || "",
          predictedWeeklySales: data.predictedWeeklySales?.toString() || "0",
          supplierId: data.supplierId || "",
          shopifyProductId: data.shopifyProductId?.toString() || "",
          shopifyVariantId: data.shopifyVariantId?.toString() || "",
        })
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = productId
        ? `/api/products/${productId}`
        : "/api/products"
      const method = productId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/products/${data.product?.id || productId}`)
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
          SKU <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          商品名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          カテゴリ
        </label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            仕入価格
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) =>
              setFormData({ ...formData, purchasePrice: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            販売価格
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.sellingPrice}
            onChange={(e) =>
              setFormData({ ...formData, sellingPrice: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          週次予測販売数（新商品用）
        </label>
        <input
          type="number"
          value={formData.predictedWeeklySales}
          onChange={(e) =>
            setFormData({
              ...formData,
              predictedWeeklySales: e.target.value,
            })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          販売実績がない新商品の場合、この値を使用して在庫切れまでの週数を計算します
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          発注先
        </label>
        <select
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Shopify商品ID
          </label>
          <input
            type="number"
            value={formData.shopifyProductId}
            onChange={(e) =>
              setFormData({ ...formData, shopifyProductId: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            ShopifyバリアントID
          </label>
          <input
            type="number"
            value={formData.shopifyVariantId}
            onChange={(e) =>
              setFormData({ ...formData, shopifyVariantId: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
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

