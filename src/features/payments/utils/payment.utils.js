/**
 * Payment Domain Utilities
 * Provides countdown timers, payment status labels, and VietQR parsing.
 */

export const formatCountdown = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const calculateRemainingSeconds = (expiredAt) => {
  if (!expiredAt) return 0;
  const expiryTime = new Date(expiredAt).getTime();
  const now = Date.now();
  const diffMs = expiryTime - now;
  return Math.max(0, Math.floor(diffMs / 1000));
};

export const PAYMENT_METHODS = {
  cod: {
    id: 'cod',
    name: 'COD',
    title: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán tiền mặt cho shipper khi nhận kiện hàng.',
    icon: 'solar:hand-money-linear',
  },
  payos: {
    id: 'payos',
    name: 'payOS',
    title: 'Chuyển khoản VietQR tức thì (payOS)',
    description: 'Quét mã VietQR thanh toán nhanh qua ứng dụng ngân hàng.',
    icon: 'solar:qr-code-linear',
  },
};

export const getPaymentMethodInfo = (method) => {
  const normalized = String(method || '').toLowerCase();
  return (
    PAYMENT_METHODS[normalized] || {
      id: normalized,
      name: method || 'Khác',
      title: method || 'Phương thức thanh toán',
      icon: 'solar:card-2-linear',
    }
  );
};

export const VIETNAMESE_BANKS = {
  '970422': { shortName: 'MBBank', name: 'Ngân hàng Quân Đội (MB)', code: 'MB' },
  '970415': { shortName: 'VietinBank', name: 'Ngân hàng Công Thương Việt Nam', code: 'CTG' },
  '970436': { shortName: 'Vietcombank', name: 'Ngân hàng Ngoại Thương Việt Nam', code: 'VCB' },
  '970418': { shortName: 'BIDV', name: 'Ngân hàng Đầu tư và Phát triển', code: 'BIDV' },
  '970407': { shortName: 'Techcombank', name: 'Ngân hàng Kỹ Thương (TCB)', code: 'TCB' },
  '970423': { shortName: 'TPBank', name: 'Ngân hàng Tiên Phong', code: 'TPB' },
  '970432': { shortName: 'VPBank', name: 'Ngân hàng Việt Nam Thịnh Vượng', code: 'VPB' },
  '970416': { shortName: 'ACB', name: 'Ngân hàng Á Châu', code: 'ACB' },
  '970405': { shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp & PTNT', code: 'VBA' },
  '970441': { shortName: 'VIB', name: 'Ngân hàng Quốc tế', code: 'VIB' },
  '970448': { shortName: 'OCB', name: 'Ngân hàng Phương Đông', code: 'OCB' },
  '970403': { shortName: 'Sacombank', name: 'Ngân hàng Sài Gòn Thương Tín', code: 'STB' },
  '970454': { shortName: 'VietCapitalBank', name: 'Ngân hàng Bản Việt', code: 'VCCB' },
  '970428': { shortName: 'NamABank', name: 'Ngân hàng Nam Á', code: 'NAB' },
  '970429': { shortName: 'SCB', name: 'Ngân hàng Sài Gòn', code: 'SCB' },
  '970437': { shortName: 'HDBank', name: 'Ngân hàng Phát triển TP.HCM', code: 'HDB' },
  '970443': { shortName: 'SHB', name: 'Ngân hàng Sài Gòn - Hà Nội', code: 'SHB' },
  '970431': { shortName: 'Eximbank', name: 'Ngân hàng Xuất Nhập Khẩu', code: 'EIB' },
  '970426': { shortName: 'MSB', name: 'Ngân hàng Hàng Hải', code: 'MSB' },
};

/**
 * Parse VietQR EMVCo string to extract Bank BIN, Account Number, Amount, Description
 */
export const parseVietQR = (qrString) => {
  if (!qrString || typeof qrString !== 'string') return null;

  try {
    let index = 0;
    const tlv = {};

    while (index < qrString.length) {
      const tag = qrString.substring(index, index + 2);
      const length = parseInt(qrString.substring(index + 2, index + 4), 10);
      if (isNaN(length)) break;
      const value = qrString.substring(index + 4, index + 4 + length);
      tlv[tag] = value;
      index += 4 + length;
    }

    // Tag 38 is Merchant Account Information (NAPAS format)
    let bin = '';
    let accountNumber = '';
    if (tlv['38']) {
      const sub = tlv['38'];
      let subIdx = 0;
      while (subIdx < sub.length) {
        const subTag = sub.substring(subIdx, subIdx + 2);
        const subLen = parseInt(sub.substring(subIdx + 2, subIdx + 4), 10);
        if (isNaN(subLen)) break;
        const subVal = sub.substring(subIdx + 4, subIdx + 4 + subLen);
        if (subTag === '01') {
          // Inside 01: 0006<BIN>01<len><ACCOUNT>
          let innerIdx = 0;
          while (innerIdx < subVal.length) {
            const inTag = subVal.substring(innerIdx, innerIdx + 2);
            const inLen = parseInt(subVal.substring(innerIdx + 2, innerIdx + 4), 10);
            if (isNaN(inLen)) break;
            const inVal = subVal.substring(innerIdx + 4, innerIdx + 4 + inLen);
            if (inTag === '00') bin = inVal;
            if (inTag === '01') accountNumber = inVal;
            innerIdx += 4 + inLen;
          }
        }
        subIdx += 4 + subLen;
      }
    }

    // Tag 54: Amount
    const amount = tlv['54'] ? Number(tlv['54']) : null;

    // Tag 62: Additional Data (Reference / Description)
    let description = '';
    if (tlv['62']) {
      const sub62 = tlv['62'];
      let subIdx = 0;
      while (subIdx < sub62.length) {
        const subTag = sub62.substring(subIdx, subIdx + 2);
        const subLen = parseInt(sub62.substring(subIdx + 2, subIdx + 4), 10);
        if (isNaN(subLen)) break;
        const subVal = sub62.substring(subIdx + 4, subIdx + 4 + subLen);
        if (subTag === '08') description = subVal;
        subIdx += 4 + subLen;
      }
    }

    const bank = VIETNAMESE_BANKS[bin] || (bin ? { shortName: `Ngân hàng (${bin})`, name: 'Ngân hàng thụ hưởng' } : null);

    return {
      bin,
      bank,
      accountNumber,
      amount,
      description,
    };
  } catch {
    return null;
  }
};
