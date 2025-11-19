import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { FormField } from '../types/formBuilder';

interface UseFormBuilderEffectsProps {
  selectedFields: FormField[];
  setFormFields: Dispatch<SetStateAction<FormField[]>>;
  selectedFormField: FormField | null;
  setSelectedFormField: Dispatch<SetStateAction<FormField | null>>;
  selectedTreeTable: string | null;
  treeStructure: any[];
  hasRootTable: boolean;
  tabOrder: string[];
  setTabOrder: Dispatch<SetStateAction<string[]>>;
  blockOrderMap: Record<string, number[]>;
  setBlockOrderMap: Dispatch<SetStateAction<Record<string, number[]>>>;
  getChildTables: () => any[];
  getCurrentTableFieldsByBlocks: () => Record<number, FormField[]>;
}

export function useFormBuilderEffects({
  selectedFields,
  setFormFields,
  selectedFormField,
  setSelectedFormField,
  selectedTreeTable,
  treeStructure,
  hasRootTable,
  tabOrder,
  setTabOrder,
  blockOrderMap,
  setBlockOrderMap,
  getChildTables,
  getCurrentTableFieldsByBlocks,
}: UseFormBuilderEffectsProps) {
  /**
   * Effect 1: Sync form fields with selected fields prop
   */
  useEffect(() => {
    setFormFields(selectedFields);
  }, [selectedFields, setFormFields]);

  /**
   * Effect 2: Initialize and update tab order
   */
  useEffect(() => {
    const childTables = getChildTables();
    const childTableIds = childTables.map((t: any) => t.tableId);

    // Only update if the child tables have actually changed
    if (childTableIds.length > 0) {
      const tabOrderSet = new Set(tabOrder);
      const childTableSet = new Set(childTableIds);

      // Check if they're different
      const needsUpdate =
        childTableIds.length !== tabOrder.length ||
        childTableIds.some((id) => !tabOrderSet.has(id)) ||
        tabOrder.some((id) => !childTableSet.has(id));

      if (needsUpdate) {
        // Preserve existing order where possible, add new tables at the end
        const newOrder = [...tabOrder.filter((id) => childTableSet.has(id))];
        const newTables = childTableIds.filter((id) => !tabOrderSet.has(id));
        setTabOrder([...newOrder, ...newTables]);
      }
    } else if (tabOrder.length > 0) {
      // No child tables, clear tab order
      setTabOrder([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeStructure, hasRootTable]);

  /**
   * Effect 3: Fix existing fields without blockId (migration)
   */
  useEffect(() => {
    setFormFields((prev) =>
      prev.map((field) =>
        field.blockId === undefined || field.blockId === null ? { ...field, blockId: 1 } : field
      )
    );
  }, [setFormFields]);

  /**
   * Effect 4: Clear selected field when tree table selection changes
   */
  useEffect(() => {
    if (selectedFormField && selectedFormField.tableId !== selectedTreeTable) {
      setSelectedFormField(null);
    }
  }, [selectedTreeTable, selectedFormField, setSelectedFormField]);

  /**
   * Effect 5: Keep blockOrderMap in sync with actual blocks
   */
  useEffect(() => {
    if (!selectedTreeTable) return;

    const tableKey = selectedTreeTable;
    const fieldsByBlocks = getCurrentTableFieldsByBlocks();
    const actualBlockIds = Object.keys(fieldsByBlocks)
      .map(Number)
      .sort((a, b) => a - b);

    setBlockOrderMap((prev) => {
      const currentOrder = prev[tableKey] || [];
      const newBlocks = actualBlockIds.filter((id) => !currentOrder.includes(id));

      if (newBlocks.length > 0) {
        return { ...prev, [tableKey]: [...currentOrder, ...newBlocks] };
      }

      const validOrder = currentOrder.filter((id) => actualBlockIds.includes(id));
      if (validOrder.length !== currentOrder.length) {
        return { ...prev, [tableKey]: validOrder };
      }

      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTreeTable]);
}
