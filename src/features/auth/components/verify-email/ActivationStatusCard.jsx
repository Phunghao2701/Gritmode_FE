// ActivationStatusCard.jsx
// Card wrapper chứa 3 trạng thái: loading / success / error.
// Nhận status từ hook và render đúng state tương ứng.

import LoadingState from './LoadingState';
import SuccessState from './SuccessState';
import ErrorState from './ErrorState';

const ActivationStatusCard = ({
  status,
  errorMessage,
  countdown,
  totalSeconds,
  onLogin,
  onHome,
  onRegister,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border, #E6E6E6)',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}
    >
      {/* Trạng thái đang xác thực */}
      {status === 'loading' && <LoadingState />}

      {/* Trạng thái kích hoạt thành công */}
      {status === 'success' && (
        <SuccessState
          countdown={countdown}
          totalSeconds={totalSeconds}
          onLogin={onLogin}
          onHome={onHome}
        />
      )}

      {/* Trạng thái kích hoạt thất bại */}
      {status === 'error' && (
        <ErrorState
          message={errorMessage}
          onLogin={onLogin}
          onRegister={onRegister}
        />
      )}
    </div>
  );
};

export default ActivationStatusCard;