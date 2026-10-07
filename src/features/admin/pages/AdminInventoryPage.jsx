'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAdminInventory } from '../hooks/useAdmin';
import StockAdjustModal from '../components/StockAdjustModal';
import Icon from '../../../shared/components/Icon';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Pagination from '../../../shared/components/Pagination';
import AdminPageHeader from '../components/AdminPageHeader';

export default function AdminInventoryPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [adjustItem, setAdjustItem] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    inventory,
    isLoading,
    total,
    outOfStockTotal,
    isOutOfStockCountLoading,
    isOutOfStockCountError,
    updateStock,
    isUpdatingStock,
  } = useAdminInventory({
    search: debouncedSearch.trim() || undefined,
    low_stock: statusFilter === 'LOW_STOCK' ? true : undefined,
    out_of_stock: statusFilter === 'OUT_OF_STOCK' ? true : undefined,
    page,
    limit,
  });

  const outOfStockLabel = isOutOfStockCountLoading || isOutOfStockCountError || outOfStockTotal === undefined
    ? 'Hết hàng'
    : `Hết hàng (${outOfStockTotal})`;

  const getStatusBadge = (item) => {
    const available = Number(item.quantity_available ?? 0);
    const isOutOfStock = item.is_out_of_stock || available <= 0;
    const isLowStock = item.is_low_stock || (available > 0 && available <= 5);

    if (isOutOfStock) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
          Hết hàng
        </span>
      );
    }
    if (isLowStock) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
          Sắp hết
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
        Đủ hàng
      </span>
    );
  };

  const handleAdjustSubmit = ({ variantId, quantityStock }) => {
    updateStock(
      { variantId, quantityStock },
      {
        onSuccess: () => {
          setAdjustItem(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        eyebrow="Tồn kho"
        title="Quản lý kho"
        description="Theo dõi tồn thực tế, tồn có thể bán và cập nhật từng biến thể."
      />

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg" />
          <input
            type="text"
            placeholder="Tìm theo mã sản phẩm hoặc tên sản phẩm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'Tất cả trạng thái' },
            { id: 'LOW_STOCK', label: 'Sắp hết hàng' },
            { id: 'OUT_OF_STOCK', label: outOfStockLabel },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <LoadingSkeleton key={n} height="50px" className="rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="pb-3 font-black">Mã biến thể</th>
                    <th className="pb-3 font-black">Sản phẩm</th>
                    <th className="pb-3 font-black text-center">Tồn thực tế</th>
                    <th className="pb-3 font-black text-center">Có thể bán</th>
                    <th className="pb-3 font-black text-center">Trạng thái</th>
                    <th className="pb-3 font-black text-right">Điều chỉnh kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        Không tìm thấy sản phẩm tồn kho nào.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item, idx) => (
                      <tr key={item.inventory_id || item.product_variant_id || idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-4 font-mono font-black text-black dark:text-white uppercase">
                          {item.sku}
                        </td>
                        <td className="py-4">
                          <span className="font-bold text-black dark:text-white uppercase line-clamp-1">
                            {item.name_product || item.product_name}
                          </span>
                        </td>
                        <td className="py-4 font-black text-center text-black dark:text-white">
                          {item.quantity_stock ?? 0}
                        </td>
                        <td className={`py-4 font-black text-center ${Number(item.quantity_available ?? 0) <= 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : Number(item.quantity_available) <= 5
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {item.quantity_available ?? 0}
                        </td>
                        <td className="py-4 text-center">
                          {getStatusBadge(item)}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.product_id && (
                              <Link
                                href={`/admin/products/${item.product_id}/edit`}
                                aria-label={`Chỉnh sửa sản phẩm ${item.name_product || item.product_name || item.product_id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-[11px] font-bold text-black transition-all hover:border-neutral-400 dark:border-neutral-700 dark:text-white dark:hover:border-neutral-500"
                                title="Chỉnh sửa sản phẩm"
                              >
                                <Icon icon="solar:t-shirt-linear" />
                                <span className="hidden xl:inline">Sản phẩm</span>
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => setAdjustItem(item)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-[11px] font-bold text-black transition-all hover:border-neutral-400 dark:border-neutral-700 dark:text-white dark:hover:border-neutral-500"
                            >
                              <Icon icon="solar:pen-linear" />
                              <span>Cập nhật</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              totalItems={total}
              currentPage={page}
              limit={limit}
              onPageChange={setPage}
              entityName="biến thể tồn kho"
            />
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {adjustItem && (
        <StockAdjustModal
          item={adjustItem}
          isOpen={Boolean(adjustItem)}
          onClose={() => setAdjustItem(null)}
          onAdjustSubmit={handleAdjustSubmit}
          isLoading={isUpdatingStock}
        />
      )}
    </div>
  );
}
