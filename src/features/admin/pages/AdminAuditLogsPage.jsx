import React, { useState } from 'react';
import { useAdminAuditLogs } from '../hooks/useAdmin';
import AuditLogDetailModal from '../components/AuditLogDetailModal';
import Icon from '../../../shared/components/Icon';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Pagination from '../../../shared/components/Pagination';
import { getAuditActionInfo, formatEntityName } from '../utils/audit.utils';

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  const { logs, isLoading, total, pagination } = useAdminAuditLogs({
    search: search.trim() || undefined,
    action: actionFilter || undefined,
    entity: entityFilter || undefined,
    page,
    limit: 20,
    sort_order: 'DESC',
  });

  const totalPages = pagination?.total_pages || 1;

  const entityOptions = [
    { value: '', label: 'Tất cả đối tượng' },
    { value: 'order', label: 'Đơn hàng (Order)' },
    { value: 'product', label: 'Sản phẩm (Product)' },
    { value: 'inventory', label: 'Tồn kho (Inventory)' },
    { value: 'user', label: 'Người dùng (User)' },
    { value: 'category', label: 'Danh mục (Category)' },
    { value: 'collection', label: 'Bộ sưu tập (Collection)' },
  ];

  const actionOptions = [
    { value: '', label: 'Tất cả hành động' },
    { value: 'ORDER_CONFIRMED', label: 'Xác nhận đơn' },
    { value: 'ORDER_PROCESSING', label: 'Chuẩn bị hàng' },
    { value: 'ORDER_SHIPPING', label: 'Giao hàng' },
    { value: 'ORDER_COMPLETED', label: 'Hoàn tất đơn' },
    { value: 'ORDER_CANCELLED', label: 'Hủy đơn' },
    { value: 'PRODUCT_CREATED', label: 'Tạo sản phẩm' },
    { value: 'PRODUCT_UPDATED', label: 'Cập nhật sản phẩm' },
    { value: 'PRODUCT_DELETED', label: 'Xóa sản phẩm' },
    { value: 'INVENTORY_UPDATED', label: 'Cập nhật tồn kho' },
    { value: 'USER_BLOCKED', label: 'Khóa tài khoản' },
    { value: 'USER_UNBLOCKED', label: 'Mở khóa tài khoản' },
    { value: 'USER_SET_INACTIVE', label: 'Vô hiệu hóa user' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
            Security & Compliance
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white mt-1">
            Nhật ký quản trị — Audit Logs ({total})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Theo dõi toàn bộ lịch sử các thao tác thay đổi sản phẩm, tồn kho, đơn hàng và phân quyền của Admin.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg" />
          <input
            type="text"
            placeholder="Tìm theo ID đối tượng, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
          >
            {entityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
          >
            {actionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <LoadingSkeleton key={n} height="55px" className="rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="pb-3 font-black">Thời gian</th>
                    <th className="pb-3 font-black">Hành động</th>
                    <th className="pb-3 font-black">Đối tượng (Entity)</th>
                    <th className="pb-3 font-black">Mã đối tượng (ID)</th>
                    <th className="pb-3 font-black">Người thực hiện (Actor)</th>
                    <th className="pb-3 font-black text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        Chưa có bản ghi nhật ký nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const logId = log.admin_audit_log_id || log.id;
                      const actionInfo = getAuditActionInfo(log.action_admin_audit_log || log.action);
                      const entityName = formatEntityName(log.entity_admin_audit_log || log.entity);
                      const entityId = log.entity_id_admin_audit_log || log.entity_id;

                      return (
                        <tr key={logId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="py-4 text-neutral-400 font-mono text-[11px]">
                            {new Date(log.created_at || Date.now()).toLocaleString('vi-VN')}
                          </td>

                          <td className="py-4">
                            <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${actionInfo.color}`}>
                              {actionInfo.label}
                            </span>
                          </td>

                          <td className="py-4 font-bold text-black dark:text-white">
                            {entityName}
                          </td>

                          <td className="py-4 font-mono text-neutral-500">
                            {entityId || '—'}
                          </td>

                          <td className="py-4">
                            <span className="font-bold text-black dark:text-white">
                              {log.actor?.full_name || log.actor?.email || log.user_id || 'Admin'}
                            </span>
                          </td>

                          <td className="py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedLog(log)}
                              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-[11px] text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Icon icon="solar:eye-linear" />
                              <span>Xem Diff</span>
                            </button>
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
              limit={20}
              onPageChange={setPage}
              entityName="nhật ký hoạt động"
            />
          </div>
        )}
      </div>

      {/* Audit Log Detail Modal */}
      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
