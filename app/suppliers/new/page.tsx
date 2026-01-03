import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import SupplierForm from "@/components/suppliers/SupplierForm"

export default async function NewSupplierPage() {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold">発注先新規登録</h1>
        <SupplierForm />
      </div>
    </MainLayout>
  )
}

