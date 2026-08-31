// ErrorIcon.jsx
// Icon cảnh báo màu cam — hiển thị khi kích hoạt thất bại.
// Tách riêng để dễ thay icon sau này.

const ErrorIcon = () => {
  return (
    <div className="d-flex justify-content-center mb-4">
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#fff0ee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Kích hoạt thất bại"
        >
          <circle cx="12" cy="12" r="12" fill="#FF7A33" fillOpacity="0.2" />
          <path
            d="M12 7V13"
            stroke="#FF7A33"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16.5" r="1.2" fill="#FF7A33" />
        </svg>
      </div>
    </div>
  );
};

export default ErrorIcon;