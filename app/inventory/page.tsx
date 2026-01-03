import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import InventoryList from "@/components/inventory/InventoryList"

export default async function InventoryPage() {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold">在庫管理</h1>
        <InventoryList />
      </div>
    </MainLayout>
  )
}

