import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import SuppliersList from "@/components/suppliers/SuppliersList"

export default async function SuppliersPage() {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">発注先管理</h1>
          <a
            href="/suppliers/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            新規登録
          </a>
        </div>
        <SuppliersList />
      </div>
    </MainLayout>
  )
}

