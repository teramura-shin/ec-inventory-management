import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import BestsellersList from "@/components/bestsellers/BestsellersList"

export default async function BestsellersPage() {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold">売れ筋商品</h1>
        <BestsellersList />
      </div>
    </MainLayout>
  )
}

