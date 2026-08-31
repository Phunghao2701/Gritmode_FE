// useVerifyAccount.js
// Hook quản lý toàn bộ logic của trang verify email.
// Page và component KHÔNG chứa logic — chỉ gọi hook này.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import { verifyEmailApi } from '../api/auth.api';

// Số giây đếm ngược trước khi tự redirect
const COUNTDOWN_SECONDS = 5;

const useVerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ─── States ───────────────────────────────────────────────────────────────
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const hasCalled = useRef(false);
  const countdownRef = useRef(null);

  // ─── Bước 1: Gọi API verify khi component mount ───────────────────────────
  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Liên kết kích hoạt không hợp lệ hoặc đã hết hạn.');
      return;
    }

    verifyEmailApi(token)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        const message =
          err?.response?.data?.message ||
          'Liên kết kích hoạt không hợp lệ hoặc đã hết hạn.';
        setErrorMessage(message);
      });
  }, [searchParams]);

  // ─── Bước 2: Khi success → bắt đầu đếm ngược ────────────────────────────
  useEffect(() => {
    if (status !== 'success') return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          navigate(ROUTES.LOGIN);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownRef.current);
    };
  }, [status, navigate]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const goToLogin = () => {
    clearInterval(countdownRef.current);
    navigate(ROUTES.LOGIN);
  };

  const goToHome = () => {
    clearInterval(countdownRef.current);
    navigate(ROUTES.HOME);
  };

  const goToRegister = () => {
    navigate(ROUTES.REGISTER);
  };

  return {
    status,
    errorMessage,
    countdown,
    totalSeconds: COUNTDOWN_SECONDS,
    goToLogin,
    goToHome,
    goToRegister,
  };
};

export default useVerifyAccount;