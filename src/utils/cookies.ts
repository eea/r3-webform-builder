import config from '../../config.json';

interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const cookieUtils = {
  set: (name: string, value: string, options: CookieOptions = {}): void => {
    try {
      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

      if (options.expires) {
        cookieString += `; expires=${options.expires.toUTCString()}`;
      }

      if (options.maxAge) {
        cookieString += `; max-age=${options.maxAge}`;
      }

      if (options.path) {
        cookieString += `; path=${options.path}`;
      }

      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }

      if (options.secure) {
        cookieString += '; secure';
      }

      if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`;
      }

      document.cookie = cookieString;
    } catch (error) {
      console.warn('Failed to set cookie:', error);
    }
  },

  get: (name: string): string | null => {
    try {
      const cookies = document.cookie.split(';');
      const encodedName = encodeURIComponent(name);

      for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === encodedName) {
          return decodeURIComponent(cookieValue);
        }
      }

      return null;
    } catch (error) {
      console.warn('Failed to get cookie:', error);
      return null;
    }
  },

  remove: (name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void => {
    try {
      cookieUtils.set(name, '', {
        ...options,
        expires: new Date(0)
      });
    } catch (error) {
      console.warn('Failed to remove cookie:', error);
    }
  },

  exists: (name: string): boolean => {
    return cookieUtils.get(name) !== null;
  }
};

// Session data (stored in cookies, excludes API key for security)
interface SessionData {
  environment: string;
  dataflowId: string;
}

// Full connection data (includes API key, used in memory only)
interface ConnectionData {
  environment: string;
  apiKey: string;
  dataflowId: string;
}

const SESSION_COOKIE_NAME = config.storage.keys.connection;
const WEBFORM_NAME_COOKIE_NAME = config.storage.keys.webformName;
const SELECTED_DATASET_COOKIE_NAME = config.storage.keys.selectedDataset;
const API_KEY_SESSION_STORAGE = 'r3-webform-api-key';

// Calculate maxAge from config
const calculateMaxAge = () => {
  const { days, hours, minutes } = config.cookies.expiration;
  return (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60);
};

const COOKIE_OPTIONS: CookieOptions = {
  path: config.cookies.options.path,
  maxAge: calculateMaxAge(),
  sameSite: config.cookies.options.sameSite as 'strict' | 'lax' | 'none',
  secure: config.cookies.options.secure
};

// SessionStorage utilities for API key (clears when browser tab closes)
export const apiKeyStorage = {
  save: (apiKey: string): void => {
    try {
      sessionStorage.setItem(API_KEY_SESSION_STORAGE, apiKey);
    } catch (error) {
      console.warn('Failed to save API key to session storage:', error);
    }
  },

  load: (): string => {
    try {
      return sessionStorage.getItem(API_KEY_SESSION_STORAGE) || '';
    } catch (error) {
      console.warn('Failed to load API key from session storage:', error);
      return '';
    }
  },

  clear: (): void => {
    try {
      sessionStorage.removeItem(API_KEY_SESSION_STORAGE);
    } catch (error) {
      console.warn('Failed to clear API key from session storage:', error);
    }
  }
};

// Cookie utilities for session data (excludes API key for security)
export const sessionDataUtils = {
  saveSessionData: (sessionData: SessionData): void => {
    try {
      const sessionString = JSON.stringify(sessionData);
      cookieUtils.set(SESSION_COOKIE_NAME, sessionString, COOKIE_OPTIONS);
    } catch (error) {
      console.warn('Failed to save session data to cookies:', error);
    }
  },

  loadSessionData: (): SessionData | null => {
    try {
      const stored = cookieUtils.get(SESSION_COOKIE_NAME);
      if (stored) {
        return JSON.parse(stored) as SessionData;
      }
    } catch (error) {
      console.warn('Failed to load session data from cookies:', error);
      sessionDataUtils.clearSessionData();
    }
    return null;
  },

  clearSessionData: (): void => {
    cookieUtils.remove(SESSION_COOKIE_NAME, { path: config.cookies.options.path });
  },

  // Hybrid utility: combines session data from cookies with API key from sessionStorage
  loadConnection: (): ConnectionData | null => {
    const sessionData = sessionDataUtils.loadSessionData();
    const apiKey = apiKeyStorage.load();

    if (sessionData) {
      return {
        ...sessionData,
        apiKey
      };
    }
    return null;
  },

  // Hybrid utility: saves connection data split between cookies and sessionStorage
  saveConnection: (connection: ConnectionData): void => {
    // Save API key to sessionStorage (clears when tab closes)
    apiKeyStorage.save(connection.apiKey);

    // Save other data to cookies (persists)
    sessionDataUtils.saveSessionData({
      environment: connection.environment,
      dataflowId: connection.dataflowId
    });
  },

  // Clear all connection data
  clearConnection: (): void => {
    apiKeyStorage.clear();
    sessionDataUtils.clearSessionData();
  },

  saveWebformName: (name: string): void => {
    cookieUtils.set(WEBFORM_NAME_COOKIE_NAME, name, COOKIE_OPTIONS);
  },

  loadWebformName: (): string => {
    return cookieUtils.get(WEBFORM_NAME_COOKIE_NAME) || '';
  },

  clearWebformName: (): void => {
    cookieUtils.remove(WEBFORM_NAME_COOKIE_NAME, { path: config.cookies.options.path });
  },

  saveSelectedDataset: (datasetId: string): void => {
    cookieUtils.set(SELECTED_DATASET_COOKIE_NAME, datasetId, COOKIE_OPTIONS);
  },

  loadSelectedDataset: (): string => {
    return cookieUtils.get(SELECTED_DATASET_COOKIE_NAME) || '';
  },

  clearSelectedDataset: (): void => {
    cookieUtils.remove(SELECTED_DATASET_COOKIE_NAME, { path: config.cookies.options.path });
  }
};

// Export for backward compatibility - this is now the hybrid approach
export const connectionCookieUtils = sessionDataUtils;