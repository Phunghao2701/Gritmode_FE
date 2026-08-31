/**
 * Guest Token Service
 * Manages guest_token storage for unauthenticated cart ownership.
 */
const GUEST_TOKEN_KEY = 'gritmode_guest_token';

export const guestTokenService = {
  getGuestToken: () => {
    try {
      return localStorage.getItem(GUEST_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  },

  setGuestToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(GUEST_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(GUEST_TOKEN_KEY);
      }
    } catch {
      // Ignore storage write errors in private browsing
    }
  },

  clearGuestToken: () => {
    try {
      localStorage.removeItem(GUEST_TOKEN_KEY);
    } catch {
      // Ignore
    }
  },
};
