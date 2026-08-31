/**
 * Token Service — chỉ lưu Access Token.
 * Refresh Token nằm trong HttpOnly cookie và không thể được JavaScript đọc.
 */

const ACCESS_TOKEN_KEY = 'gritmode_access_token';
const LEGACY_REFRESH_TOKEN_KEY = 'gritmode_refresh_token';

export const tokenService = {
  // Access Token
  getAccessToken: () => {
    // Dọn refresh token từng được lưu bởi phiên bản frontend cũ.
    localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  clearAccessToken: () => localStorage.removeItem(ACCESS_TOKEN_KEY),

  // Helpers
  setTokens: ({ access_token }) => {
    if (access_token) localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  },

  clearAllTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  },

  hasTokens: () => {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  },
};
