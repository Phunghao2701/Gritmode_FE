'use client';
import { useRouter } from 'next/navigation';
import { useAdminDashboardOverview } from '../hooks/useAdmin';
import DashboardStatCard from '../components/DashboardStatCard';
import RecentOrdersTable from '../components/RecentOrdersTable';
import LowStockAlert from '../components/LowStockAlert';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatPriceVND } from '../../../shared/utils/formatNumber';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: overview, isLoading, isError, refetch } = useAdminDashboardOverview();
  const stats = overview?.stats;
  const orders = overview?.orders || [];
  const inventory = overview?.inventory || [];

  const isInitialLoading = (isLoading || !overview) && !isError;

  const lowStockItems = inventory.filter(
    (item) => Number(item.quantity_available ?? (item.quantity_stock - item.quantity_reserved)) <= 5
  );

  const statCards = [
    {
      title: 'Doanh thu',
      value: formatPriceVND(stats?.totalRevenue ?? stats?.revenueThisMonth ?? 0),
      icon: 'solar:dollar-minimalistic-linear',
      bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      title: 'Tổng đơn hàng',
      value: `${stats?.totalOrders || 0} đơn`,
      icon: 'solar:bag-3-linear',
      bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    },
    {
      title: 'Sản phẩm đang bán',
      value: `${stats?.totalProducts || 0} sản phẩm`,
      icon: 'solar:t-shirt-linear',
      bg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    },
    {
      title: 'Khách hàng thành viên',
      value: `${stats?.totalUsers || 0} users`,
      icon: 'solar:users-group-rounded-linear',
      bg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <AdminPageHeader
        eyebrow="Tổng quan"
        title="Tổng quan"
        description="Theo dõi các chỉ số và việc cần xử lý trong cửa hàng."
      />

      {isError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
            Không thể tải dữ liệu bảng điều khiển từ máy chủ. Vui lòng bấm thử lại.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-wider hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <DashboardStatCard key={idx} {...card} isLoading={isInitialLoading} />
        ))}
      </div>

      {/* 2-Column Grid: Recent Orders (7 cols) + Low Stock Alert (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <RecentOrdersTable
            orders={orders.slice(0, 5)}
            onViewAll={() => router.push('/admin/orders')}
            isLoading={isInitialLoading}
          />
        </div>
        <div className="lg:col-span-5">
          <LowStockAlert
            lowStockItems={lowStockItems.slice(0, 3)}
            onManageInventory={() => router.push('/admin/inventory')}
            isLoading={isInitialLoading}
          />
        </div>
      </div>
    </div>
  );
}
