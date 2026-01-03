import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import AlertsList from "@/components/alerts/AlertsList"

export default async function AlertsPage() {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold">在庫アラート</h1>
        <AlertsList />
      </div>
    </MainLayout>
  )
}

