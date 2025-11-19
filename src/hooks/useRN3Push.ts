import type { Dispatch, SetStateAction } from 'react';
import { uploadWebformToRN3 } from '../services/api';

interface UseRN3PushProps {
  state: {
    connection: any;
    selectedDataset: string | null;
  };
  showPushModal: boolean;
  setShowPushModal: Dispatch<SetStateAction<boolean>>;
  generateJSON: () => string;
}

export function useRN3Push({
  state,
  showPushModal,
  setShowPushModal,
  generateJSON,
}: UseRN3PushProps) {
  /**
   * Initiate the push to ReportNet 3 process
   */
  const handlePushToRN3 = () => {
    // Check if we have a connection and selected dataset
    if (!state.connection) {
      alert('Please connect to ReportNet first using the Connection modal.');
      return;
    }
    if (!state.selectedDataset) {
      alert('Please select a dataset first.');
      return;
    }
    setShowPushModal(true);
  };

  /**
   * Confirm and execute the push to ReportNet 3
   */
  const handlePushConfirm = async (
    fileName: string,
    type: 'TABLES' | 'ENTITIES' | 'PAMS' | 'Q&A',
    uploadedFile?: File
  ) => {
    if (!state.connection || !state.selectedDataset) {
      alert('Connection or dataset not available.');
      return;
    }

    try {
      let jsonContent: string;

      // If user uploaded a file, use that; otherwise use generated JSON
      if (uploadedFile) {
        jsonContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const text = e.target?.result as string;
              // Validate it's valid JSON
              JSON.parse(text);
              resolve(text);
            } catch (error) {
              reject(new Error('Invalid JSON file'));
            }
          };
          reader.onerror = () => reject(new Error('Error reading file'));
          reader.readAsText(uploadedFile);
        });
      } else {
        // Generate JSON from current form
        jsonContent = generateJSON();
      }

      const result = await uploadWebformToRN3({
        connection: state.connection,
        datasetId: state.selectedDataset,
        jsonContent,
        fileName,
        type,
      });

      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert(`Error uploading to ReportNet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Push to RN3 error:', error);
    }
  };

  return {
    showPushModal,
    setShowPushModal,
    handlePushToRN3,
    handlePushConfirm,
  };
}
