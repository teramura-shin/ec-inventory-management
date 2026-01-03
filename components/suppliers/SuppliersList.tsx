"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Trash2, Edit } from "lucide-react"

interface Supplier {
  id: string
  name: string
  contactPerson: string | null
  email: string | null
  phone: string | null
}

export default function SuppliersList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/suppliers")
      const data = await response.json()

      if (response.ok) {
        setSuppliers(data.suppliers)
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`本当に「${name}」を削除しますか？`)) return

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchSuppliers()
      } else {
        alert("削除に失敗しました")
      }
    } catch (error) {
      alert("削除に失敗しました")
    }
  }

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        発注先が登録されていません
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              発注先名
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              担当者
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              メールアドレス
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              電話番号
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {supplier.name}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {supplier.contactPerson || "-"}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {supplier.email || "-"}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {supplier.phone || "-"}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/suppliers/${supplier.id}/edit`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(supplier.id, supplier.name)}
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
  )
}

