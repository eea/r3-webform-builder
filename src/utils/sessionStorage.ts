interface ConnectionData {
  environment: string;
  apiKey: string;
  dataflowId: string;
}

const CONNECTION_STORAGE_KEY = 'r3-webform-builder-connection';

export const sessionStorageUtils = {
  saveConnection: (connection: ConnectionData): void => {
    try {
      sessionStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(connection));
    } catch (error) {
      console.warn('Failed to save connection data to session storage:', error);
    }
  },

  loadConnection: (): ConnectionData | null => {
    try {
      const stored = sessionStorage.getItem(CONNECTION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as ConnectionData;
      }
    } catch (error) {
      console.warn('Failed to load connection data from session storage:', error);
      sessionStorageUtils.clearConnection();
    }
    return null;
  },

  clearConnection: (): void => {
    try {
      sessionStorage.removeItem(CONNECTION_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear connection data from session storage:', error);
    }
  }
};