import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRES_KEY = 'token_expires';

export const tokenStorage = {
  setToken(token: string, expiresIn: number) {
    // Set expiration time based on expiresIn (seconds)
    const expires = new Date(Date.now() + expiresIn * 1000);

    Cookies.set(TOKEN_KEY, token, {
      expires: expires,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
    });

    Cookies.set(TOKEN_EXPIRES_KEY, expires.getTime().toString(), {
      expires: expires,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
    });
  },

  getToken(): string | null {
    const token = Cookies.get(TOKEN_KEY);
    const expiresAt = Cookies.get(TOKEN_EXPIRES_KEY);

    if (!token || !expiresAt) {
      return null;
    }

    // Check if token is expired
    if (Date.now() > parseInt(expiresAt)) {
      this.clearToken();
      return null;
    }

    return token;
  },

  clearToken() {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(TOKEN_EXPIRES_KEY);
  },

  isTokenExpired(): boolean {
    const expiresAt = Cookies.get(TOKEN_EXPIRES_KEY);
    if (!expiresAt) return true;

    return Date.now() > parseInt(expiresAt);
  },
};
