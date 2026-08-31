import ROUTES from '../../../app/routes/routePaths';

const ADMIN_MENU = [
  // Trang tổng quan: Total Journals, Total Articles, Pending Reviews, Active Users,
  // Publication Trends chart, Recent Activity, Volume & Issue Overview table.
  { key: 'dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard', path: ROUTES.ADMIN_DASHBOARD },

  // Quản lý danh sách journal (sẽ phát triển ở issue khác).
  { key: 'journals', label: 'Journals', icon: 'lucide:book-open', path: ROUTES.ADMIN_JOURNALS },

  // Article Repository + Update Article (Issue 1 - phần còn lại).
  { key: 'articles', label: 'Articles', icon: 'lucide:file-text', path: ROUTES.ADMIN_ARTICLES },

  // Quản lý Volume/Issue (liên quan tới issue khác, dùng chung journal context).
  { key: 'volumes', label: 'Volumes', icon: 'lucide:layers', path: ROUTES.ADMIN_REPOSITORY },

  // Trang tài khoản admin (đổi mật khẩu, thông tin cá nhân...).
  { key: 'account', label: 'Account', icon: 'lucide:user', path: ROUTES.ADMIN_USERS },
];

export default ADMIN_MENU;
