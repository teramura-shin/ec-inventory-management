import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import PurchaseOrderForm from "@/components/purchase-orders/PurchaseOrderForm"

export default async function NewPurchaseOrderPage() {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold">新規発注</h1>
        <PurchaseOrderForm />
      </div>
    </MainLayout>
  )
}

