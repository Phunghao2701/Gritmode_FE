// AuthLogo.jsx
// Hiển thị logo ResearchPulse phía trên card.
// Tách riêng để dễ thay đổi logo sau này mà không ảnh hưởng page.

const AuthLogo = () => {
  return (
    <div className="text-center mb-4">
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: '1.8rem',
          fontWeight: 700,
          color: 'var(--primary)',
          letterSpacing: '-0.5px',
        }}
      >
        ResearchPulse
      </span>
    </div>
  );
};

export default AuthLogo;