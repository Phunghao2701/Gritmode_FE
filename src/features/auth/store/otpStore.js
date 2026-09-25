import { create } from 'zustand';

/**
 * OTP Store — Trạng thái tạm thời trong quá trình Email OTP authentication.
 *
 * Không persist — OTP state chỉ tồn tại trong session hiện tại.
 * Khi App reload, user phải bắt đầu lại từ bước nhập Email.
 */
export const useOtpStore = create((set) => ({
  /** Email đang được verify OTP */
  email: null,

  /** Thời gian OTP còn hiệu lực (giây) — từ BE, chỉ dùng hiển thị countdown */
  expiredIn: null,

  /** Đang gửi Request OTP */
  isRequesting: false,

  /** Đang gửi Verify OTP */
  isVerifying: false,

  /** Request OTP đã được gửi thành công, đang chờ User nhập OTP */
  requested: false,

  /** Error message từ BE */
  error: null,

  // --- Actions ---

  /** Gọi khi Request OTP thành công */
  setOtpRequested: ({ email, expiredIn }) =>
    set({
      email,
      expiredIn,
      requested: true,
      error: null,
      isRequesting: false,
    }),

  setRequesting: (value) => set({ isRequesting: value }),

  setVerifying: (value) => set({ isVerifying: value }),

  setError: (error) => set({ error }),

  /** Reset toàn bộ OTP state (sau khi login thành công hoặc user quay lại bước đầu) */
  resetOtp: () =>
    set({
      email: null,
      expiredIn: null,
      isRequesting: false,
      isVerifying: false,
      requested: false,
      error: null,
    }),
}));
