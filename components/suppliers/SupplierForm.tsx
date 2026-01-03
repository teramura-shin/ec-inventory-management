"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface SupplierFormProps {
  supplierId?: string
}

export default function SupplierForm({ supplierId }: SupplierFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    leadTimeDays: "7",
  })

  useEffect(() => {
    if (supplierId) {
      fetchSupplier()
    }
  }, [supplierId])

  const fetchSupplier = async () => {
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`)
      const data = await response.json()

      if (response.ok) {
        setFormData({
          name: data.supplier.name,
          contactPerson: data.supplier.contactPerson || "",
          email: data.supplier.email || "",
          phone: data.supplier.phone || "",
          address: data.supplier.address || "",
          leadTimeDays: data.supplier.leadTimeDays?.toString() || "7",
        })
      }
    } catch (error) {
      console.error("Error fetching supplier:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = supplierId
        ? `/api/suppliers/${supplierId}`
        : "/api/suppliers"
      const method = supplierId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/suppliers")
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
          発注先名 <span className="text-red-500">*</span>
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
          担当者名
        </label>
        <input
          type="text"
          value={formData.contactPerson}
          onChange={(e) =>
            setFormData({ ...formData, contactPerson: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          電話番号
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">住所</label>
        <textarea
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          リードタイム（日数）
        </label>
        <input
          type="number"
          min="1"
          value={formData.leadTimeDays}
          onChange={(e) =>
            setFormData({ ...formData, leadTimeDays: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          発注から在庫化するまでの日数（デフォルト: 7日）
        </p>
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

