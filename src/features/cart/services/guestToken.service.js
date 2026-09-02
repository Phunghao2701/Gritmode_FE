/**
 * Guest Token Service
 * Manages guest_token storage for unauthenticated cart ownership.
 */
const GUEST_TOKEN_KEY = 'gritmode_guest_token';

const generateGuestToken = () => {
  const rand = () => Math.random().toString(36).substring(2, 10);
  return `guest_${Date.now()}_${rand()}${rand()}`;
};

export const guestTokenService = {
  getGuestToken: () => {
    try {
      let token = localStorage.getItem(GUEST_TOKEN_KEY);
      if (!token) {
        token = generateGuestToken();
        localStorage.setItem(GUEST_TOKEN_KEY, token);
      }
      return token;
    } catch {
      return generateGuestToken();
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
