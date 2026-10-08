import React from 'react';
import Icon from '../../../shared/components/Icon';

export default function PaymentMethodSelector({
  selectedMethod = 'cod',
  onSelectMethod,
}) {
  const methods = [
    {
      id: 'cod',
      title: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận kiện hàng. Khách hàng được kiểm tra hàng trước khi thanh toán.',
      icon: 'solar:hand-money-linear',
      badge: 'Kiểm hàng khi nhận',
    },
    {
      id: 'payos',
      title: 'Thanh toán qua VIETQR',
      description: 'Mở trang thanh toán bảo mật. Giao dịch được xác nhận tự động.',
      icon: 'solar:shield-check-linear',
      badge: 'NAPAS247',
    },
  ];

  return (
    <fieldset className="space-y-3 select-none">
      <legend className="sr-only">Lựa chọn phương thức thanh toán</legend>
      {methods.map((m) => {
        const isSelected = String(selectedMethod).toLowerCase() === m.id;
        return (
          <label
            key={m.id}
            htmlFor={`payment-method-${m.id}`}
            onClick={() => onSelectMethod(m.id)}
            className={`p-4 sm:p-5 transition-colors cursor-pointer flex items-start gap-4 bg-white dark:bg-black ${
              isSelected
                ? 'bg-neutral-50/70 dark:bg-neutral-950/70'
                : 'hover:bg-neutral-50 dark:hover:bg-neutral-950'
            }`}
          >
            <input
              type="radio"
              id={`payment-method-${m.id}`}
              name="payment_method"
              value={m.id}
              checked={isSelected}
              onChange={() => onSelectMethod(m.id)}
              className="sr-only"
            />

            {/* Custom High-Contrast Radio Dot */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all ${
              isSelected ? 'border-black dark:border-white bg-white dark:bg-black' : 'border-neutral-300 dark:border-neutral-700'
            }`}>
              {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Icon icon={m.icon} className="text-lg text-black dark:text-white" />
                  <h4 className="font-[550] text-xs uppercase tracking-tight text-black dark:text-white">
                    {m.title}
                  </h4>
                </div>
                {m.badge && (
                  <span className={`text-[10px] font-[550] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}>
                    {m.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-normal uppercase tracking-wider text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {m.description}
              </p>
            </div>
          </label>
        );
      })}
    </fieldset>
  );
}
