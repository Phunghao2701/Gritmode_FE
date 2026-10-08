'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Icon from '../../../shared/components/Icon';

export default function QrCodeImage({ value, size = 280, alt = 'Mã QR thanh toán' }) {
  const [source, setSource] = useState('');

  useEffect(() => {
    let active = true;

    if (!value) {
      setSource('');
      return () => {
        active = false;
      };
    }

    QRCode.toDataURL(String(value), {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111111',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => {
        if (active) setSource(dataUrl);
      })
      .catch(() => {
        if (active) setSource('');
      });

    return () => {
      active = false;
    };
  }, [size, value]);

  if (!source) {
    return (
      <div
        className="flex aspect-square w-full max-w-[17.5rem] items-center justify-center rounded-xl bg-neutral-50 text-center text-xs text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400"
        role="status"
      >
        <span className="flex flex-col items-center gap-2">
          <Icon icon="solar:qr-code-linear" className="text-3xl" />
          Chưa có dữ liệu mã QR
        </span>
      </div>
    );
  }

  return (
    <img
      src={source}
      width={size}
      height={size}
      alt={alt}
      className="block h-auto w-full max-w-[17.5rem] select-none"
      draggable="false"
    />
  );
}
