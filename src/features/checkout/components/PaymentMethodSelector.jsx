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
      description: 'Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận kiện hàng.',
      icon: 'solar:hand-money-linear',
    },
    {
      id: 'payos',
      title: 'Chuyển khoản VietQR tức thì (payOS)',
      description: 'Tự động tạo mã QR VietQR chuẩn NAPAS247, xác nhận giao dịch ngay lập tức.',
      icon: 'solar:qr-code-linear',
    },
  ];

  return (
    <div className="space-y-3 select-none">
      {methods.map((m) => {
        const isSelected = String(selectedMethod).toLowerCase() === m.id;
        return (
          <div
            key={m.id}
            onClick={() => onSelectMethod(m.id)}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              isSelected
                ? 'border-black bg-neutral-50 dark:border-white dark:bg-neutral-900 shadow-sm'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-black'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
              isSelected ? 'border-black dark:border-white' : 'border-neutral-300 dark:border-neutral-700'
            }`}>
              {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Icon icon={m.icon} className="text-lg text-black dark:text-white" />
                <h4 className="font-black text-xs uppercase tracking-tight text-black dark:text-white">{m.title}</h4>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{m.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
