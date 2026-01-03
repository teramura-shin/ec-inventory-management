import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import ProductDetail from "@/components/products/ProductDetail"

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuth()

  return (
    <MainLayout>
      <ProductDetail productId={params.id} />
    </MainLayout>
  )
}

