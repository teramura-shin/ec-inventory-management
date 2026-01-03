import { requireAuth } from "@/lib/auth-helpers";
import MainLayout from "@/components/layout/MainLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AlertBadge from "@/components/alerts/AlertBadge";
import RecentAlerts from "@/components/dashboard/RecentAlerts";

export default async function Home() {
  await requireAuth();

  return (
    <MainLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">ダッシュボード</h1>
          <AlertBadge />
        </div>
        <DashboardStats />
        <div className="mt-6">
          <RecentAlerts />
        </div>
      </div>
    </MainLayout>
  );
}
