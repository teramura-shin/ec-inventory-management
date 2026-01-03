import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import ProductsList from "@/components/products/ProductsList"

export default async function ProductsPage() {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">商品管理</h1>
          <a
            href="/products/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            新規登録
          </a>
        </div>
        <ProductsList />
      </div>
    </MainLayout>
  )
}

