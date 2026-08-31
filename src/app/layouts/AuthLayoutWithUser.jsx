import { Outlet } from 'react-router-dom';

/**
 * AuthLayoutWithUser — Simplified.
 *
 * Session restore đã được xử lý tập trung bởi AuthInit trong App.jsx.
 * Component này chỉ render children, giữ lại để không break routing cũ nếu còn dùng.
 */
export default function AuthLayoutWithUser() {
  return <Outlet />;
}
