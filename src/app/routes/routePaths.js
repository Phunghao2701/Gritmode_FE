/**
 * File: app/routes/routePaths.js
 * Danh sách tập trung tất cả các đường dẫn định tuyến (routes) trong hệ thống Gritmode.
 */
const ROUTES = {
  // Trang chủ & Cửa hàng
  HOME:                  "/",
  SHOP:                  "/shop",
  PRODUCTS:              "/products",
  PRODUCT_DETAIL:        "/products/:slug",
  COLLECTIONS:           "/collections",
  COLLECTION_DETAIL:     "/collections/:slug",
  
  // Giỏ hàng & Thanh toán
  CART:                  "/cart",
  CHECKOUT:              "/checkout",
  ORDER_SUCCESS:         "/order-success/:orderId",

  // Xác thực người dùng
  LOGIN:                 "/login",
  REGISTER:              "/register",
  FORGOT_PASSWORD:       "/forgot-password",
  RESET_PASSWORD:        "/reset-password",
  VERIFY_EMAIL:          "/verify-email",

  // Hồ sơ & Đơn hàng của khách hàng
  PROFILE:               "/profile",
  PROFILE_ADDRESSES:     "/profile/addresses",
  PROFILE_ORDERS:        "/profile/orders",
  ORDER_DETAIL:          "/profile/orders/:id",

  // Quản trị viên (Admin)
  ADMIN_DASHBOARD:       "/admin/dashboard",
  ADMIN_PRODUCTS:        "/admin/products",
  ADMIN_PRODUCT_CREATE:  "/admin/products/create",
  ADMIN_PRODUCT_EDIT:    "/admin/products/:id/edit",
  ADMIN_CATEGORIES:      "/admin/categories",
  ADMIN_ORDERS:          "/admin/orders",
  ADMIN_USERS:           "/admin/users",
  ADMIN_INVENTORY:       "/admin/inventory",
  ADMIN_AUDIT_LOGS:      "/admin/audit-logs",
};

export default ROUTES;
