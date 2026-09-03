import { formatPriceVND } from '../../../shared/utils/formatNumber';

export default function RecentOrdersTable({ orders = [], onViewAll }) {


  const getStatusBadge = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">Hoàn tất</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">Đang xử lý</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">Đã xác nhận</span>;
      case 'shipping':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">Đang giao</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">Chờ xác nhận</span>;
    }
  };

  const getPaymentLabel = (method) => {
    switch (String(method || '').toLowerCase()) {
      case 'payos':
      case 'banking':
        return 'Chuyển khoản';
      case 'cod':
        return 'COD';
      default:
        return 'Chưa xác định';
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-lg text-black dark:text-white uppercase tracking-tight">
            Đơn hàng mới nhất
          </h2>
          <p className="text-xs text-neutral-400">Các đơn hàng phát sinh cần xử lý</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-black uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white underline underline-offset-4 cursor-pointer"
        >
          Xem tất cả
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
            <tr>
              <th className="pb-3 font-black">Mã đơn</th>
              <th className="pb-3 font-black">Khách hàng</th>
              <th className="pb-3 font-black">Tổng tiền</th>
              <th className="pb-3 font-black">Thanh toán</th>
              <th className="pb-3 font-black text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-400 text-xs">
                  Chưa có đơn hàng nào phát sinh.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.order_id || ord.id || ord._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-4 font-black text-black dark:text-white">
                    {ord.code_order || ord.order_code || `#ORD-${ord.order_id || ord.id || ord._id}`}
                  </td>
                  <td className="py-4">
                    <p className="font-bold text-neutral-800 dark:text-neutral-200">{ord.user_name || ord.shipping_name || ord.customer?.name || ord.email_order || 'Khách hàng'}</p>
                    <p className="text-[10px] text-neutral-400">{ord.user_email || ord.shipping_email || ord.customer?.phone || ord.phone_order}</p>
                  </td>
                  <td className="py-4 font-black text-black dark:text-white">
                    {formatPriceVND(ord.total_order ?? ord.finalAmount ?? ord.totalAmount)}
                  </td>
                  <td className="py-4">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-500">
                      {getPaymentLabel(ord.payment_method ?? ord.payment?.payment_method ?? ord.paymentMethod)}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {getStatusBadge(ord.status_order ?? ord.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
