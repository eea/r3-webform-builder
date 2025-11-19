import type { Field, FormField } from '../types/formBuilder';

interface UseFormBuilderHelpersProps {
  state: {
    selectedTreeTable: string | null;
    selectedDataset: string | null;
    datasets: any[];
    treeStructure: any[];
    hasRootTable: boolean;
  };
  formFields: FormField[];
}

export function useFormBuilderHelpers({ state, formFields }: UseFormBuilderHelpersProps) {
  /**
   * Get all fields from the currently selected table in the dataset
   */
  const getSelectedTableFields = (): Field[] => {
    if (!state.selectedTreeTable || !state.selectedDataset) return [];
    const selectedDataset = state.datasets.find((d: any) => d.id === state.selectedDataset);
    if (!selectedDataset) return [];
    const selectedTable = selectedDataset.tables.find((t: any) => t.id === state.selectedTreeTable);
    return selectedTable?.fields || [];
  };

  /**
   * Get fields that are available (not yet added to the form)
   */
  const getAvailableFields = (): Field[] => {
    const allFields = getSelectedTableFields();
    const usedFieldIds = formFields
      .filter((f) => f.tableId === state.selectedTreeTable)
      .map((f) => f.id);
    return allFields.filter((field) => !usedFieldIds.includes(field.id));
  };

  /**
   * Get all form fields for the current table
   */
  const getCurrentTableFormFields = (): FormField[] => {
    return formFields.filter((f) => f.tableId === state.selectedTreeTable);
  };

  /**
   * Organize current table's form fields by block ID
   */
  const getCurrentTableFieldsByBlocks = (): Record<number, FormField[]> => {
    const blocks: Record<number, FormField[]> = {};
    getCurrentTableFormFields().forEach((field) => {
      if (!blocks[field.blockId]) {
        blocks[field.blockId] = [];
      }
      blocks[field.blockId].push(field);
    });
    return blocks;
  };

  /**
   * Calculate the next available block ID for the current table
   */
  const getNextBlockId = (): number => {
    const blockIds = getCurrentTableFormFields().map((f) => f.blockId);
    return blockIds.length === 0 ? 1 : Math.max(...blockIds) + 1;
  };

  /**
   * Get child tables from the tree structure
   */
  const getChildTables = () => {
    if (state.treeStructure.length === 0) return [];
    if (state.hasRootTable) {
      const rootNode = state.treeStructure[0];
      return rootNode.children || [];
    }
    return state.treeStructure;
  };

  /**
   * Get the name of the currently selected table
   */
  const getSelectedTableName = (): string => {
    if (!state.selectedTreeTable || !state.selectedDataset) return '';
    const selectedDataset = state.datasets.find((d: any) => d.id === state.selectedDataset);
    const selectedTable = selectedDataset?.tables.find((t: any) => t.id === state.selectedTreeTable);
    return selectedTable?.name || '';
  };

  /**
   * Get total count of fields in the selected table
   */
  const getTotalFields = (): number => {
    return getSelectedTableFields().length;
  };

  return {
    getSelectedTableFields,
    getAvailableFields,
    getCurrentTableFormFields,
    getCurrentTableFieldsByBlocks,
    getNextBlockId,
    getChildTables,
    getSelectedTableName,
    getTotalFields,
  };
}
