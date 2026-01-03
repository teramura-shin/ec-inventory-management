import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import PurchaseOrderForm from "@/components/purchase-orders/PurchaseOrderForm"

export default async function EditPurchaseOrderPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold">発注編集</h1>
        <PurchaseOrderForm orderId={params.id} />
      </div>
    </MainLayout>
  )
}

