interface ConnectionData {
  environment: string;
  apiKey: string;
  dataflowId: string;
}

const CONNECTION_STORAGE_KEY = 'r3-webform-builder-connection';
const WEBFORM_NAME_STORAGE_KEY = 'r3-webform-builder-name';
const SELECTED_DATASET_STORAGE_KEY = 'r3-webform-builder-selected-dataset';

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
  },

  saveWebformName: (name: string): void => {
    try {
      sessionStorage.setItem(WEBFORM_NAME_STORAGE_KEY, name);
    } catch (error) {
      console.warn('Failed to save webform name to session storage:', error);
    }
  },

  loadWebformName: (): string => {
    try {
      const stored = sessionStorage.getItem(WEBFORM_NAME_STORAGE_KEY);
      return stored || '';
    } catch (error) {
      console.warn('Failed to load webform name from session storage:', error);
      return '';
    }
  },

  clearWebformName: (): void => {
    try {
      sessionStorage.removeItem(WEBFORM_NAME_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear webform name from session storage:', error);
    }
  },

  saveSelectedDataset: (datasetId: string): void => {
    try {
      sessionStorage.setItem(SELECTED_DATASET_STORAGE_KEY, datasetId);
    } catch (error) {
      console.warn('Failed to save selected dataset to session storage:', error);
    }
  },

  loadSelectedDataset: (): string => {
    try {
      const stored = sessionStorage.getItem(SELECTED_DATASET_STORAGE_KEY);
      return stored || '';
    } catch (error) {
      console.warn('Failed to load selected dataset from session storage:', error);
      return '';
    }
  },

  clearSelectedDataset: (): void => {
    try {
      sessionStorage.removeItem(SELECTED_DATASET_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear selected dataset from session storage:', error);
    }
  }
};