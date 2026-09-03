/**
 * Token Service — Quản lý Access Token trong Memory (RAM).
 * Refresh Token nằm trong HttpOnly cookie và được trình duyệt tự động đính kèm.
 * Tuyệt đối không lưu Access Token / Refresh Token vào localStorage (chống XSS).
 */

let inMemoryAccessToken = null;

// Dọn dẹp token legacy còn sót lại trong localStorage nếu có
try {
  localStorage.removeItem('gritmode_access_token');
  localStorage.removeItem('gritmode_refresh_token');
} catch {
  // Bỏ qua nếu môi trường không có localStorage
}

export const tokenService = {
  // Access Token — In-Memory
  getAccessToken: () => inMemoryAccessToken,

  setAccessToken: (token) => {
    inMemoryAccessToken = token || null;
  },

  clearAccessToken: () => {
    inMemoryAccessToken = null;
  },

  // Helpers
  setTokens: ({ access_token }) => {
    inMemoryAccessToken = access_token || null;
  },

  clearAllTokens: () => {
    inMemoryAccessToken = null;
    try {
      localStorage.removeItem('gritmode_access_token');
      localStorage.removeItem('gritmode_refresh_token');
    } catch {
      // Bỏ qua
    }
  },

  hasTokens: () => Boolean(inMemoryAccessToken),
};

