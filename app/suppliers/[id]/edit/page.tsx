import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import SupplierForm from "@/components/suppliers/SupplierForm"

export default async function EditSupplierPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold">発注先編集</h1>
        <SupplierForm supplierId={params.id} />
      </div>
    </MainLayout>
  )
}

