import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import ProductForm from "@/components/products/ProductForm"

export default async function NewProductPage() {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold">商品新規登録</h1>
        <ProductForm />
      </div>
    </MainLayout>
  )
}

