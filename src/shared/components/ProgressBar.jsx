// ProgressBar.jsx
// Thanh tiến trình chạy theo countdown.
// Đặt trong shared/ vì có thể tái sử dụng ở Reset Password, v.v.

const ProgressBar = ({ current, total }) => {
  // Tính % đã đi qua — current giảm dần nên lấy (total - current)
  const percentage = ((total - current) / total) * 100;

  return (
    <div
      style={{
        width: '100%',
        height: '6px',
        backgroundColor: 'var(--bg-section, #ececec)',
        borderRadius: '999px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: 'var(--primary, #FF7A33)',
          borderRadius: '999px',
          // Animation mượt — chạy đúng 1 giây mỗi bước
          transition: 'width 1s linear',
        }}
      />
    </div>
  );
};

export default ProgressBar;