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
  CONTACT:               "/contact",
  ABOUT_US:              "/about-us",
  
  // Hỗ trợ mua hàng & Hướng dẫn
  SIZE_GUIDE:            "/size-guide",
  HOW_TO_ORDER:          "/how-to-order",
  ORDER_LOOKUP:          "/orders/lookup",

  // Chính sách khách hàng (Customer Policies)
  POLICY_RETURN:         "/policies/return",
  POLICY_SHIPPING:       "/policies/shipping",
  POLICY_WARRANTY:       "/policies/warranty",
  POLICY_PAYMENT:        "/policies/payment",
  POLICY_PRIVACY:        "/policies/privacy",
  POLICY_TERMS:          "/policies/terms",
  
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
  ADMIN_COLLECTIONS:     "/admin/collections",
  ADMIN_ORDERS:          "/admin/orders",
  ADMIN_USERS:           "/admin/users",
  ADMIN_INVENTORY:       "/admin/inventory",
};

export default ROUTES;
