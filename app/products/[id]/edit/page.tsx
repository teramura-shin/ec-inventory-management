import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import ProductForm from "@/components/products/ProductForm"

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold">商品編集</h1>
        <ProductForm productId={params.id} />
      </div>
    </MainLayout>
  )
}

