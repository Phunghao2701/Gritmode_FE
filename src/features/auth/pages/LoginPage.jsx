import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import AuthLayout from '../../../app/layouts/AuthLayout';
import { toast } from '../../../shared/utils/toast';
import { googleLoginApi, requestOtpApi, verifyOtpApi } from '../apis/auth.api';
import { tokenService } from '../services/token.service';
import { useAuthStore } from '../../../app/store/authStore';
import { useCartStore } from '../../../app/store/cartStore';
import gritmodeLogo from '../../../assets/icons/GM den.jpg';

// ----------------------------------------------------------------
// OTP Input — 6 ô số riêng biệt
// ----------------------------------------------------------------
function OtpInput({ value, onChange, disabled }) {
  const inputs = useRef([]);

  const handleChange = (index, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[index] = char;
    const next = arr.join('');
    onChange(next);
    if (char && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    e.preventDefault();
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-1.5 sm:gap-2 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          id={`otp-digit-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-9 h-12 sm:w-11 sm:h-14 text-center text-xl sm:text-2xl font-black border-2 rounded-xl outline-none transition-all
            border-neutral-200 bg-white text-neutral-900
            focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10
            disabled:opacity-40 disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
}

// ----------------------------------------------------------------
// Countdown Timer
// ----------------------------------------------------------------
function Countdown({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onExpire]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  if (remaining <= 0) return null;

  return (
    <span className="font-mono font-bold text-neutral-900">
      {mm}:{ss}
    </span>
  );
}

// ================================================================
// LOGIN PAGE — OTP 2-step
// ================================================================
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Step: 'email' | 'otp'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [expiredIn, setExpiredIn] = useState(300);
  const [otpExpired, setOtpExpired] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleGoogleLogin = async ({ access_token }) => {
    try {
      const currentGuestToken = useCartStore.getState().guestToken;
      const res = await googleLoginApi({ access_token, guest_token: currentGuestToken || undefined });
      const data = res.data?.data;
      tokenService.setTokens({ access_token: data.access_token });
      useAuthStore.getState().loginSuccess(data.user);
      if (currentGuestToken) useCartStore.getState().clearGuestToken();
      toast.success(data.is_new_user ? 'Chào mừng bạn đến với Gritmode!' : 'Đăng nhập thành công!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đăng nhập bằng Google.');
    }
  };

  const startGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleLogin,
    onError: () => toast.error('Không thể đăng nhập bằng Google.'),
  });

  // ---- Step 1: Gửi OTP ----
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Vui lòng nhập địa chỉ email.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError('Email không hợp lệ.');
      return;
    }
    setEmailError('');
    setIsRequesting(true);

    try {
      const res = await requestOtpApi(email.trim());
      const returned = res.data?.data?.expired_in ?? 300;
      setExpiredIn(returned);
      setOtpExpired(false);
      setOtp('');
      setOtpError('');
      setStep('otp');
      toast.success('Mã OTP đã được gửi đến email của bạn!');
    } catch (err) {
      const status = err.response?.status;
      let msg;
      if (status === 429) msg = 'Bạn đã gửi OTP quá nhiều lần. Vui lòng chờ trước khi thử lại.';
      else if (status === 400) msg = err.response?.data?.message || 'Email không hợp lệ.';
      else msg = err.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.';
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setIsRequesting(false);
    }
  };

  // ---- Resend OTP ----
  const handleResendOtp = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setOtpError('');
    setOtp('');

    try {
      const res = await requestOtpApi(email.trim());
      const returned = res.data?.data?.expired_in ?? 300;
      setExpiredIn(returned);
      setOtpExpired(false);
      toast.success('Đã gửi lại mã OTP!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi lại OTP.';
      toast.error(msg);
    } finally {
      setIsRequesting(false);
    }
  };

  // ---- Step 2: Verify OTP ----
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.replace(/\D/g, '').length < 6) {
      setOtpError('Vui lòng nhập đủ 6 số OTP.');
      return;
    }
    if (isVerifying) return;
    setOtpError('');
    setIsVerifying(true);

    try {
      const currentGuestToken = useCartStore.getState().guestToken;
      const res = await verifyOtpApi({
        email: email.trim(),
        otp: otp.replace(/\D/g, ''),
        guest_token: currentGuestToken || undefined,
      });

      const data = res.data?.data;
      const { access_token, user: userData } = data;

      // Lưu tokens
      tokenService.setTokens({ access_token });

      // Cập nhật auth state
      useAuthStore.getState().loginSuccess(userData);

      // Clear guest token sau khi BE đã merge cart
      if (currentGuestToken) {
        useCartStore.getState().clearGuestToken();
      }

      if (data.is_new_user) {
        toast.success('Chào mừng bạn đến với Gritmode! 🎉');
      } else {
        toast.success('Đăng nhập thành công! Chào mừng trở lại.');
      }

      navigate(from, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      let msg;
      if (status === 401) msg = 'Mã OTP không đúng hoặc đã hết hạn.';
      else if (status === 403) msg = 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.';
      else if (status === 429) msg = 'Thử OTP quá nhiều lần. Vui lòng yêu cầu mã mới.';
      else msg = err.response?.data?.message || 'Xác thực thất bại. Vui lòng thử lại.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <AuthLayout>
      <section className="w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`inline-flex min-h-11 cursor-pointer items-center justify-center transition-opacity hover:opacity-70 ${step === 'otp' ? 'mb-6' : ''}`}
            aria-label="Về trang chủ Gritmode"
          >
            <img
              src={gritmodeLogo}
              alt="Gritmode"
              width="160"
              height="128"
              className="h-32 w-40 object-contain"
            />
          </button>
          {step === 'otp' && (
            <>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">Nhập mã OTP</h1>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Nhập mã 6 số đã gửi đến {email}
              </p>
            </>
          )}
        </div>

        {/* ---- Step 1: Email ---- */}
        {step === 'email' && (
          <form onSubmit={handleRequestOtp} className="space-y-5" noValidate>
            <button
              type="button"
              onClick={() => startGoogleLogin()}
              className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-neutral-100 px-4 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 active:bg-neutral-300"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
                <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.19-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.39 13.86A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.48l3.35-2.62Z" />
                <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
              </svg>
              Tiếp tục với Google
            </button>

            <div className="flex items-center gap-4" aria-hidden="true">
              <span className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-medium text-neutral-500">Hoặc</span>
              <span className="h-px flex-1 bg-neutral-200" />
            </div>

            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="Nhập địa chỉ email"
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'login-email-error' : undefined}
                className={`min-h-12 w-full rounded-lg border px-4 text-base outline-none transition-colors
                  ${emailError
                    ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
                    : 'border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10'
                  }`}
              />
              {emailError && (
                <p id="login-email-error" role="alert" className="text-sm font-medium text-red-600">{emailError}</p>
              )}
            </div>

            <button
              id="btn-request-otp"
              type="submit"
              disabled={isRequesting}
              className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-bold text-white transition-colors
                hover:bg-neutral-700 active:bg-black
                disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRequesting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Tiếp tục'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="min-h-11 w-full cursor-pointer text-sm text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-900"
            >
              Quay lại và tiếp tục mua hàng
            </button>
          </form>
        )}

        {/* ---- Step 2: OTP ---- */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6" noValidate>
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
            />

            {otpError && (
              <p className="text-center text-xs text-red-600 font-medium">{otpError}</p>
            )}

            {/* Countdown / Resend */}
            <div className="text-center text-xs text-neutral-500 space-y-1">
              {!otpExpired ? (
                <p>
                  Mã hết hạn sau{' '}
                  <Countdown
                    seconds={expiredIn}
                    onExpire={() => setOtpExpired(true)}
                  />
                </p>
              ) : (
                <p className="text-red-500 font-semibold">Mã OTP đã hết hạn.</p>
              )}

              <button
                type="button"
                id="btn-resend-otp"
                onClick={handleResendOtp}
                disabled={isRequesting || (!otpExpired && false)}
                className="font-bold text-neutral-900 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRequesting ? 'Đang gửi...' : 'Gửi lại mã OTP'}
              </button>
            </div>

            <button
              id="btn-verify-otp"
              type="submit"
              disabled={isVerifying || otp.replace(/\D/g, '').length < 6}
              className="w-full py-3.5 rounded-xl bg-neutral-900 text-white text-sm font-bold tracking-wide
                hover:bg-neutral-700 active:scale-[0.98] transition-all
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                'Xác thực'
              )}
            </button>

            <button
              type="button"
              id="btn-back-to-email"
              onClick={() => { setStep('email'); setOtp(''); setOtpError(''); }}
              className="w-full text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              ← Đổi email
            </button>
          </form>
        )}
      </section>
    </AuthLayout>
  );
}
