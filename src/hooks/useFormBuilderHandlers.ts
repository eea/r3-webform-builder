import type { Dispatch, SetStateAction } from 'react';
import type { FormField } from '../types/formBuilder';
import { importFormJSON } from '../utils/formBuilder/jsonHandlers';

interface UseFormBuilderHandlersProps {
  state: {
    webformName: string;
    datasets: any[];
    selectedDataset: string | null;
    treeStructure: any[];
  };
  generateJSON: () => string;
  setFormFields: Dispatch<SetStateAction<FormField[]>>;
  setSelectedFormField: Dispatch<SetStateAction<FormField | null>>;
  setBlockOrderMap: Dispatch<SetStateAction<Record<string, number[]>>>;
  setTabOrder: Dispatch<SetStateAction<string[]>>;
  setWebformName: (name: string) => void;
  setSelectedTreeTable: (tableId: string) => void;
  addRootTableToTree: (tableId: string, label: string, title: string) => void;
  addChildTableToTree: (tableId: string, label: string, title: string) => void;
  removeTableFromTree: (nodeId: string) => void;
  onUploadJSON?: (fields: FormField[]) => void;
}

export function useFormBuilderHandlers({
  state,
  generateJSON,
  setFormFields,
  setSelectedFormField,
  setBlockOrderMap,
  setTabOrder,
  setWebformName,
  setSelectedTreeTable,
  addRootTableToTree,
  addChildTableToTree,
  removeTableFromTree,
  onUploadJSON,
}: UseFormBuilderHandlersProps) {
  /**
   * Download the form configuration as a JSON file
   */
  const handleDownloadJSON = () => {
    const jsonData = generateJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = state.webformName
      ? `${state.webformName.replace(/[^a-z0-9_-]/gi, '_')}.json`
      : 'form-config.json';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Upload and import a JSON form configuration
   */
  const handleUploadJSON = (jsonData: any) => {
    try {
      const result = importFormJSON(jsonData, state.datasets, state.selectedDataset);

      if (result.webformName) {
        setWebformName(result.webformName);
      }

      // Clear existing state
      setFormFields([]);
      setSelectedFormField(null);

      // Reconstruct tree structure from JSON
      if (jsonData.tables && Array.isArray(jsonData.tables) && jsonData.tables.length > 0) {
        const selectedDatasetObj = state.datasets.find((d: any) => d.id === state.selectedDataset);

        // Clear existing tree (make a copy to avoid mutation during iteration)
        const existingNodes = [...state.treeStructure];
        existingNodes.forEach((node: any) => {
          removeTableFromTree(node.id);
        });

        // Build tree structure from JSON tables
        // First table is the root table (if overview exists, it's a root table structure)
        const hasOverview = jsonData.overview && Array.isArray(jsonData.overview) && jsonData.overview.length > 0;

        jsonData.tables.forEach((table: any, index: number) => {
          const tableData = selectedDatasetObj?.tables.find((t: any) => t.name === table.name);

          if (tableData) {
            if (index === 0 && hasOverview) {
              // First table with overview is the root table
              addRootTableToTree(tableData.id, table.label || table.name, table.title || table.name);
            } else {
              // All other tables are child tables/tabs
              addChildTableToTree(tableData.id, table.label || table.name, table.title || table.name);
            }
          }
        });
      }

      if (result.formFields.length > 0) {
        setFormFields(result.formFields);

        // Notify parent component to update its selectedFields state
        if (onUploadJSON) {
          onUploadJSON(result.formFields);
        }

        // Rebuild block order map for each table
        const newBlockOrderMap: Record<string, number[]> = {};
        const tableIds = [...new Set(result.formFields.map((f) => f.tableId))];

        tableIds.forEach((tableId) => {
          const tableFields = result.formFields.filter((f) => f.tableId === tableId);
          const blockIds = [...new Set(tableFields.map((f) => f.blockId))].sort((a, b) => a - b);
          newBlockOrderMap[tableId] = blockIds;
        });

        setBlockOrderMap(newBlockOrderMap);

        // Rebuild tab order from JSON tables (excluding root table if present)
        if (jsonData.tables && Array.isArray(jsonData.tables)) {
          const selectedDatasetObj = state.datasets.find((d: any) => d.id === state.selectedDataset);
          const hasOverview = jsonData.overview && Array.isArray(jsonData.overview) && jsonData.overview.length > 0;

          const tabTableIds = jsonData.tables
            .slice(hasOverview ? 1 : 0) // Skip first table if it's the root table
            .map((table: any) => {
              const tableData = selectedDatasetObj?.tables.find((t: any) => t.name === table.name);
              return tableData?.id;
            })
            .filter((id: string | undefined) => id !== undefined);

          if (tabTableIds.length > 0) {
            setTabOrder(tabTableIds as string[]);
          }
        }

        if (result.firstTableId) {
          setSelectedTreeTable(result.firstTableId);
        }
      } else {
        alert('No matching fields found in the current dataset. Please ensure you have the correct dataset selected.');
      }
    } catch (error) {
      alert('Error processing JSON file. Please check the file format and try again.');
      console.error('JSON upload error:', error);
    }
  };

  return {
    handleDownloadJSON,
    handleUploadJSON,
  };
}
