import { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Field, FormField } from '../types/formBuilder';

interface UseDragAndDropProps {
  formFields: FormField[];
  setFormFields: React.Dispatch<React.SetStateAction<FormField[]>>;
  currentTableFormFields: FormField[];
  selectedTreeTable: string | null;
  blockOrderMap: Record<string, number[]>;
  setBlockOrderMap: React.Dispatch<React.SetStateAction<Record<string, number[]>>>;
  getCurrentTableFieldsByBlocks: () => Record<number, FormField[]>;
  getNextBlockId: () => number;
  tabOrder: string[];
  setTabOrder: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * Custom hook to handle all drag and drop logic
 */
export function useDragAndDrop({
  formFields,
  setFormFields,
  currentTableFormFields,
  selectedTreeTable,
  blockOrderMap,
  setBlockOrderMap,
  getCurrentTableFieldsByBlocks,
  getNextBlockId,
  tabOrder,
  setTabOrder,
}: UseDragAndDropProps) {
  const [activeField, setActiveField] = useState<Field | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const field = event.active.data.current as Field;
    setActiveField(field);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveField(null);
      return;
    }

    // Handle tab reordering
    if (active.data.current?.type === 'tab' && over.data.current?.type === 'tab') {
      handleTabReorder(active.data.current.tableId, over.data.current.tableId);
      setActiveField(null);
      return;
    }

    // Handle block reordering
    if (active.data.current?.type === 'block' && over.data.current?.type === 'block') {
      handleBlockReorder(active.data.current.blockId, over.data.current.blockId);
      setActiveField(null);
      return;
    }

    // Handle dropping field from left panel to form
    if (
      (over.id === 'form-builder' || over.id?.toString().startsWith('droppable-block-')) &&
      active.data.current &&
      !active.data.current.formId
    ) {
      handleDropNewField(active.data.current as Field, over.id, over.data.current?.blockId);
    }

    // Handle moving field between blocks
    if (active.data.current?.formId && over.id?.toString().startsWith('droppable-block-')) {
      handleMoveFieldBetweenBlocks(active.id as string, over.data.current?.blockId);
    }

    // Handle reordering existing fields within the same block
    if (active.id !== over.id && active.data.current?.formId && over.data.current?.formId) {
      handleReorderWithinBlock(active.id as string, over.id as string);
    }

    setActiveField(null);
  };

  /**
   * Handle tab reordering in preview mode
   */
  const handleTabReorder = (activeTabId: string, overTabId: string) => {
    if (activeTabId === overTabId) return;

    setTabOrder((prev) => {
      const oldIndex = prev.indexOf(activeTabId);
      const newIndex = prev.indexOf(overTabId);

      if (oldIndex !== -1 && newIndex !== -1) {
        return arrayMove(prev, oldIndex, newIndex);
      }
      return prev;
    });
  };

  /**
   * Handle block reordering
   */
  const handleBlockReorder = (activeBlockId: number, overBlockId: number) => {
    if (activeBlockId === overBlockId || !selectedTreeTable) return;

    setBlockOrderMap((prev) => {
      const tableKey = selectedTreeTable || '';
      const fieldsByBlocks = getCurrentTableFieldsByBlocks();
      const blockIds = Object.keys(fieldsByBlocks).map(Number).sort((a, b) => a - b);
      const currentOrder = prev[tableKey] || blockIds;

      const oldIndex = currentOrder.indexOf(activeBlockId);
      const newIndex = currentOrder.indexOf(overBlockId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
        return { ...prev, [tableKey]: newOrder };
      }

      return prev;
    });
  };

  /**
   * Handle dropping a new field from the panel
   */
  const handleDropNewField = (
    field: Field,
    overId: string | number,
    overBlockId?: number
  ) => {
    let blockId = 1; // Default to block 1

    // If dropped on a specific block, use that block ID
    if (overId?.toString().startsWith('droppable-block-')) {
      blockId = overBlockId || 1;
    } else {
      // If dropped on general form area, use next available block
      blockId = getNextBlockId();
    }

    const newFormField: FormField = {
      ...field,
      formId: Math.random().toString(36).substr(2, 9),
      tableId: selectedTreeTable || '',
      blockId,
    };
    setFormFields((prev) => [...prev, newFormField]);
  };

  /**
   * Handle moving a field between blocks
   */
  const handleMoveFieldBetweenBlocks = (fieldId: string, targetBlockId?: number) => {
    if (!targetBlockId) return;

    setFormFields((prev) =>
      prev.map((field) =>
        field.formId === fieldId ? { ...field, blockId: targetBlockId } : field
      )
    );
  };

  /**
   * Handle reordering fields within the same block
   */
  const handleReorderWithinBlock = (activeId: string, overId: string) => {
    const activeField = formFields.find((f) => f.formId === activeId);
    const overField = formFields.find((f) => f.formId === overId);

    if (!activeField || !overField || activeField.blockId !== overField.blockId) return;

    const blockFields = currentTableFormFields.filter(
      (f) => f.blockId === activeField.blockId
    );
    const oldIndex = blockFields.findIndex((field) => field.formId === activeId);
    const newIndex = blockFields.findIndex((field) => field.formId === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedBlockFields = arrayMove(blockFields, oldIndex, newIndex);

      // Update the main formFields array
      setFormFields((prev) => {
        const otherFields = prev.filter(
          (f) => f.tableId !== selectedTreeTable || f.blockId !== activeField.blockId
        );
        return [...otherFields, ...reorderedBlockFields];
      });
    }
  };

  return {
    activeField,
    handleDragStart,
    handleDragEnd,
  };
}
