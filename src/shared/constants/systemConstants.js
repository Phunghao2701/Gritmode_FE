/**
 * File: shared/constants/systemConstants.js
 * Danh sách tập trung các vai trò (roles), trạng thái (statuses) và thông số cấu hình hệ thống.
 * Tránh việc hardcode các giá trị chuỗi ở nhiều component khác nhau.
 */

/**
 * Danh sách vai trò trên hệ thống ResearchPulse.
 * Dùng cho các dropdown phân quyền, hiển thị badge và thiết lập form.
 */
export const SYSTEM_ROLES = [
  { value: 'RESEARCHER', label: 'Researcher' },
  { value: 'LECTURER', label: 'Lecturer' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'ADMINISTRATOR', label: 'Administrator' }
];

/**
 * Danh sách trạng thái của tài khoản người dùng trên hệ thống.
 * 'Active' - Tài khoản đang hoạt động bình thường.
 * 'Inactive' - Tài khoản đã bị vô hiệu hóa bởi quản trị viên.
 * 'Pending' - Tài khoản đang trong hàng đợi chờ được duyệt kích hoạt.
 */
export const ACCOUNT_STATUSES = [
  { value: 'Active', label: 'Hoạt động (Active)' },
  { value: 'Inactive', label: 'Vô hiệu hóa (Inactive)' },
  { value: 'Pending', label: 'Chờ duyệt (Pending)' }
];

