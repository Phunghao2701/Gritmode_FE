'use client';

import { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { formatPriceVND } from '../../products/utils/product.utils';
import { formatCountdown } from '../utils/payment.utils';
import QrCodeImage from './QrCodeImage';

const detailRows = [
  { key: 'bank_name', label: 'Ngân hàng' },
  { key: 'account_number', label: 'Số tài khoản', copy: true },
  { key: 'account_name', label: 'Chủ tài khoản' },
  { key: 'amount', label: 'Số tiền', copy: true, format: formatPriceVND },
  { key: 'transfer_description', label: 'Nội dung chuyển khoản', copy: true },
];

export default function PayOSPaymentCard({ payment, remainingSeconds }) {
  const [copiedKey, setCopiedKey] = useState('');
  const display = payment?.payment_display || {};

  const copyValue = async (key, value) => {
    if (!value || !navigator?.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(''), 1600);
    } catch {
      setCopiedKey('');
    }
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      aria-label="Thanh toán bằng mã VietQR"
    >
      <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 sm:px-6">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
            Quét mã ngân hàng
          </span>
          <h3 className="mt-1 text-base font-black uppercase tracking-tight text-black dark:text-white">
            Mã VietQR chuyển khoản
          </h3>
        </div>

        <div className="shrink-0 text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Hết hạn sau
          </span>
          <span className={`font-mono text-sm font-black ${remainingSeconds <= 60 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'}`}>
            {formatCountdown(remainingSeconds)}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex justify-center">
          <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700">
            <QrCodeImage value={display.qr_code} size={280} />
          </div>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {detailRows.map(({ key, label, copy, format }) => {
            const value = display[key];
            if (value === null || value === undefined || value === '') return null;

            const formattedValue = format ? format(value) : value;
            return (
              <div
                key={key}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 text-xs"
              >
                <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
                <div className="flex min-w-0 items-center gap-2 text-right">
                  <span className={`max-w-[14rem] truncate font-bold text-black dark:text-white ${key === 'account_number' || key === 'transfer_description' ? 'font-mono' : ''}`}>
                    {formattedValue}
                  </span>
                  {copy && (
                    <button
                      type="button"
                      onClick={() => copyValue(key, value)}
                      className="shrink-0 rounded p-1 text-neutral-400 transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:hover:text-white"
                      aria-label={`Sao chép ${label.toLowerCase()}`}
                    >
                      <Icon icon={copiedKey === key ? 'solar:check-circle-linear' : 'solar:copy-linear'} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
