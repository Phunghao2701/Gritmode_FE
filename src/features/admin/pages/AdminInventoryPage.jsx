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
        <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 font-sans text-[10px] font-[550] text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
          Hết hàng
        </span>
      );
    }
    if (isLowStock) {
      return (
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-sans text-[10px] font-[550] text-amber-600 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
          Sắp hết
        </span>
      );
    }
    return (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-sans text-[10px] font-[550] text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
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
    <div className="mx-auto max-w-7xl space-y-6 font-sans font-[550]">
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
            className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-11 pr-4 font-sans text-xs font-normal text-black transition-colors placeholder:text-neutral-400 focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
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
              className={`rounded-full px-3.5 py-1.5 font-sans text-xs font-[550] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-black text-white shadow-sm dark:bg-white dark:text-black'
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
              <table className="w-full text-left font-sans text-xs">
                <thead className="uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="pb-3 font-sans font-[550]">Mã biến thể</th>
                    <th className="pb-3 font-sans font-[550]">Sản phẩm</th>
                    <th className="pb-3 text-center font-sans font-[550]">Tồn thực tế</th>
                    <th className="pb-3 text-center font-sans font-[550]">Có thể bán</th>
                    <th className="pb-3 text-center font-sans font-[550]">Trạng thái</th>
                    <th className="pb-3 text-right font-sans font-[550]">Điều chỉnh kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center font-normal text-neutral-400">
                        Không tìm thấy sản phẩm tồn kho nào.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item, idx) => (
                      <tr key={item.inventory_id || item.product_variant_id || idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-4 font-sans font-[550] text-black uppercase dark:text-white">
                          {item.sku}
                        </td>
                        <td className="py-4">
                          <span className="line-clamp-1 font-sans font-[550] text-black uppercase dark:text-white">
                            {item.name_product || item.product_name}
                          </span>
                        </td>
                        <td className="py-4 text-center font-sans font-[550] text-black dark:text-white">
                          {item.quantity_stock ?? 0}
                        </td>
                        <td className={`py-4 text-center font-sans font-[550] ${Number(item.quantity_available ?? 0) <= 0
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
                                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 font-sans text-[11px] font-[550] text-black transition-all hover:border-neutral-400 dark:border-neutral-700 dark:text-white dark:hover:border-neutral-500"
                                title="Chỉnh sửa sản phẩm"
                              >
                                <Icon icon="solar:t-shirt-linear" />
                                <span className="hidden xl:inline">Sản phẩm</span>
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => setAdjustItem(item)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-1.5 font-sans text-[11px] font-[550] text-black transition-all hover:border-neutral-400 dark:border-neutral-700 dark:text-white dark:hover:border-neutral-500"
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
