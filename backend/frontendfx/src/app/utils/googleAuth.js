import { GOOGLE_CONFIG } from '../../config/googleConfig';

const GOOGLE_TOKEN_KEY = 'googleDriveToken';
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

export class GoogleAuthManager {
  static getStoredToken() {
    const tokenData = localStorage.getItem(GOOGLE_TOKEN_KEY);
    if (!tokenData) return null;
    
    try {
      return JSON.parse(tokenData);
    } catch {
      localStorage.removeItem(GOOGLE_TOKEN_KEY);
      return null;
    }
  }

  static async refreshTokenIfNeeded() {
    const tokenData = this.getStoredToken();
    if (!tokenData) return null;

    const now = Date.now();
    const expiresAt = tokenData.expiresAt;

    if (now + REFRESH_THRESHOLD >= expiresAt) {
      // Token is expired or will expire soon, need to re-authenticate
      this.clearToken();
      return null;
    }

    return tokenData.token;
  }

  static async getValidToken() {
    try {
      const token = await this.refreshTokenIfNeeded();
      if (token) return token;
      return null;
    } catch (error) {
      console.error('Failed to get valid token:', error);
      this.clearToken();
      return null;
    }
  }

  static async handleAuthCallback(hash) {
    if (!hash) return false;

    try {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const expiresIn = params.get("expires_in");
      
      if (!accessToken || !expiresIn) return false;

      const tokenData = {
        token: accessToken,
        expiresAt: Date.now() + (parseInt(expiresIn, 10) * 1000)
      };
      
      localStorage.setItem(GOOGLE_TOKEN_KEY, JSON.stringify(tokenData));
      return true;
    } catch (error) {
      console.error('Failed to handle auth callback:', error);
      return false;
    }
  }

  static clearToken() {
    localStorage.removeItem(GOOGLE_TOKEN_KEY);
  }

  static async initiateAuth() {
    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: `${window.location.origin}/settings`,
      response_type: 'token',
      scope: GOOGLE_CONFIG.scopes.join(' '),
      prompt: 'consent',
      access_type: 'online'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = authUrl;
  }
}

export async function initializeGoogleAuth() {
  // Check if we already have a valid token
  const token = await GoogleAuthManager.getValidToken();
  if (token) return token;

  // If no valid token, start auth flow
  await GoogleAuthManager.initiateAuth();
  return null;
}