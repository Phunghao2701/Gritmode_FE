import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminProducts } from '../hooks/useAdmin';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Pagination from '../../../shared/components/Pagination';
import { formatPriceVND } from '../../products/utils/product.utils';
import { publishAdminProductApi } from '../apis/admin.api';
import { toast } from '../../../shared/utils/toast';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    products,
    isLoading,
    total,
    deleteProduct,
    archiveProduct,
  } = useAdminProducts({
    search: debouncedSearch.trim() || undefined,
    status_product: statusFilter || undefined,
    page,
    limit,
  });
  const handlePublishDirect = async (productId) => {
    try {
      await publishAdminProductApi(productId);
      toast.success('Đã chuyển trạng thái sang Đang bán (Active)!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đăng bán sản phẩm');
    }
  };

  const handleDelete = (productId, name, status) => {
    if (status === 'active') {
      if (window.confirm(`Archive sản phẩm "${name}"?`)) archiveProduct(productId);
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      deleteProduct(productId);
    }
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white mt-1">
            Quản lý sản phẩm ({total})
          </h1>
        </div>

        <PrimaryButton icon="solar:add-circle-linear" onClick={() => navigate('/admin/products/create')} size="sm">
          Thêm sản phẩm mới
        </PrimaryButton>
      </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-6 text-xs uppercase tracking-wider select-none">
            {[
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
            ].map((tab) => (
              <button
                key={tab.value || 'all'}
                type="button"
                onClick={() => handleStatusChange(tab.value)}
                className={`relative py-2 font-normal transition-colors duration-300 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-black dark:after:bg-white after:origin-center after:transition-transform after:duration-300 ${
                  statusFilter === tab.value
                    ? 'text-black dark:text-white after:scale-x-100'
                    : 'text-neutral-400 hover:text-black dark:hover:text-white after:scale-x-0'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <LoadingSkeleton key={n} height="60px" className="rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                    <tr>
                      <th className="pb-3 font-black">Sản phẩm</th>
                      <th className="pb-3 font-black">Mô tả</th>
                      <th className="pb-3 font-black text-center">Khoảng giá</th>
                      <th className="pb-3 font-black text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-neutral-400">
                          Không tìm thấy sản phẩm nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => {
                        const productId = p.product_id || p.id;
                        const name = p.name_product || p.title;
                        const minPrice = p.min_price ?? p.price ?? 0;
                        const maxPrice = p.max_price ?? p.price ?? 0;
                        const originalMinPrice = p.original_min_price ?? minPrice;
                        const originalMaxPrice = p.original_max_price ?? maxPrice;
                        const hasSale = originalMinPrice > minPrice || originalMaxPrice > maxPrice;
                        const discountPercent = hasSale && originalMinPrice > 0
                          ? Math.round((1 - minPrice / originalMinPrice) * 100)
                          : 0;
                        const isDraft = (p.status_product || 'draft') === 'draft';

                        return (
                          <tr key={productId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                {p.thumbnail || p.images?.[0]?.url_product_image || (typeof p.images?.[0] === 'string' ? p.images[0] : null) ? (
                                  <img
                                    src={p.thumbnail || p.images?.[0]?.url_product_image || p.images?.[0]}
                                    alt={name}
                                    className="w-12 h-14 object-contain rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 p-1 shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-14 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center text-neutral-400 shrink-0">
                                    <Icon icon="solar:t-shirt-bold-duotone" className="text-xl" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-bold text-black dark:text-white uppercase line-clamp-1">{name}</h4>
                                  <span className="text-[10px] font-mono text-neutral-400">ID: #{productId}</span>
                                  {hasSale && discountPercent > 0 && (
                                    <span className="ml-2 text-[9px] font-bold uppercase rounded-md bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 px-1.5 py-0.5">
                                      -{discountPercent}%
                                    </span>
                                  )}
                                  <span className={`ml-2 text-[9px] font-black uppercase rounded-full px-2 py-0.5 ${
                                    isDraft
                                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                                      : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                  }`}>
                                    {p.status_product || 'draft'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-neutral-400 max-w-xs truncate">
                              {p.description || 'Chưa có mô tả'}
                            </td>
                            <td className="py-4 text-center text-black dark:text-white">
                              {hasSale && (
                                <div className="text-neutral-400 line-through font-normal">
                                  {originalMinPrice === originalMaxPrice ? formatPriceVND(originalMinPrice) : `${formatPriceVND(originalMinPrice)} - ${formatPriceVND(originalMaxPrice)}`}
                                </div>
                              )}
                              <div className={hasSale ? 'font-black text-red-600 dark:text-red-500' : 'font-black'}>
                                {minPrice === maxPrice ? formatPriceVND(minPrice) : `${formatPriceVND(minPrice)} - ${formatPriceVND(maxPrice)}`}
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isDraft && (
                                  <button
                                    type="button"
                                    onClick={() => handlePublishDirect(productId)}
                                    className="px-2.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-black text-[10px] uppercase tracking-wider hover:opacity-85 transition-all cursor-pointer shadow-sm"
                                    title="Đăng bán ngay"
                                  >
                                    Đăng bán
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => navigate(`/admin/products/${productId}/edit`)}
                                  className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-black dark:text-white transition-all cursor-pointer"
                                  title="Chỉnh sửa"
                                >
                                  <Icon icon="solar:pen-linear" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(productId, name, p.status_product)}
                                  className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                                  title={p.status_product === 'active' ? 'Archive' : 'Xóa Draft'}
                                >
                                  <Icon icon="solar:trash-bin-minimalistic-linear" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
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
                entityName="sản phẩm"
              />
            </div>
          )}
        </div>
    </div>
  );
}
