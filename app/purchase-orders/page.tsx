import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import PurchaseOrdersList from "@/components/purchase-orders/PurchaseOrdersList"

export default async function PurchaseOrdersPage() {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">発注管理</h1>
          <a
            href="/purchase-orders/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            新規発注
          </a>
        </div>
        <PurchaseOrdersList />
      </div>
    </MainLayout>
  )
}

