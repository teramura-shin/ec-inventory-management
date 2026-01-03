import { requireAuth } from "@/lib/auth-helpers"
import MainLayout from "@/components/layout/MainLayout"
import SettingsTabs from "@/components/settings/SettingsTabs"

export default async function SettingsPage() {
  await requireAuth()

  return (
    <MainLayout>
      <div>
        <h1 className="mb-6 text-3xl font-bold">設定</h1>
        <SettingsTabs />
      </div>
    </MainLayout>
  )
}

