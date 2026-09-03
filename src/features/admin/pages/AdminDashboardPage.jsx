import { useNavigate } from 'react-router-dom';
import { useAdminDashboardOverview } from '../hooks/useAdmin';
import DashboardStatCard from '../components/DashboardStatCard';
import RecentOrdersTable from '../components/RecentOrdersTable';
import LowStockAlert from '../components/LowStockAlert';
import { formatPriceVND } from '../../../shared/utils/formatNumber';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: overview, isLoading } = useAdminDashboardOverview();
  const stats = overview?.stats;
  const orders = overview?.orders || [];
  const inventory = overview?.inventory || [];

  const lowStockItems = inventory.filter(
    (item) => Number(item.quantity_available ?? (item.quantity_stock - item.quantity_reserved)) <= 5
  );

  const statCards = [
    {
      title: 'Doanh thu',
      value: formatPriceVND(stats?.revenueThisMonth || 0),
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
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white mt-1">
            Tổng quan
          </h1>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <DashboardStatCard key={idx} {...card} />
        ))}
      </div>

      {/* 2-Column Grid: Recent Orders (7 cols) + Low Stock Alert (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <RecentOrdersTable
            orders={orders.slice(0, 5)}
            onViewAll={() => navigate('/admin/orders')}
          />
        </div>
        <div className="lg:col-span-5">
          <LowStockAlert
            lowStockItems={lowStockItems.slice(0, 3)}
            onManageInventory={() => navigate('/admin/inventory')}
          />
        </div>
      </div>
    </div>
  );
}
