import Icon from '../../../shared/components/Icon';

export default function LowStockAlert({ lowStockItems = [], onManageInventory }) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="font-display font-black text-lg text-black dark:text-white uppercase tracking-tight">
              Cảnh báo kho hàng
            </h2>
          </div>
        </div>
        
        <p className="text-xs text-neutral-400 leading-relaxed">
          Các biến thể sản phẩm có số lượng khả dụng dưới ngưỡng an toàn cần nhập thêm.
        </p>

        <div className="space-y-3 pt-2">
          {lowStockItems.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">Tất cả SKU đều đủ tồn kho an toàn.</p>
          ) : (
            lowStockItems.map((item) => (
              <div 
                key={item.inventory_id || item.product_variant_id || item.id}
                className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-black dark:text-white line-clamp-1">
                    {item.name_product || item.productTitle || item.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                    {item.sku || item.variantSku || 'Chưa có mã'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-rose-500">
                    Còn {item.quantity_available ?? item.available ?? item.onHand ?? 0} cái
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <button
          onClick={onManageInventory}
          className="w-full py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-xs font-black uppercase tracking-wider text-black dark:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Quản lý kho</span>
          <Icon icon="solar:arrow-right-linear" />
        </button>
      </div>
    </div>
  );
}
