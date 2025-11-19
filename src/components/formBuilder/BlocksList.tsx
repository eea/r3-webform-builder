import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import FormBlock from './FormBlock';
import SortableFormBlock from './SortableFormBlock';
import type { FormField } from '../../types/formBuilder';

interface BlocksListProps {
  selectedTreeTable: string;
  blockOrderMap: Record<string, number[]>;
  getCurrentTableFieldsByBlocks: () => Record<number, FormField[]>;
  handleRemoveField: (formId: string) => void;
  handleRemoveBlock: () => void;
  handleAddBlock: () => void;
  selectedFormField: FormField | null;
  setSelectedFormField: (field: FormField | null) => void;
}

export default function BlocksList({
  selectedTreeTable,
  blockOrderMap,
  getCurrentTableFieldsByBlocks,
  handleRemoveField,
  handleRemoveBlock,
  handleAddBlock,
  selectedFormField,
  setSelectedFormField,
}: BlocksListProps) {
  const fieldsByBlocks = getCurrentTableFieldsByBlocks();
  const defaultBlockIds = Object.keys(fieldsByBlocks).map(Number).sort((a, b) => a - b);
  const tableKey = selectedTreeTable || '';
  const blockIds = blockOrderMap[tableKey] || defaultBlockIds;

  if (blockIds.length === 0) {
    return (
      <FormBlock
        blockId={1}
        fields={[]}
        onRemoveField={handleRemoveField}
        onRemoveBlock={handleRemoveBlock}
        onAddBlock={handleAddBlock}
        selectedFormField={selectedFormField}
        onFieldClick={setSelectedFormField}
        isLastBlock={true}
      />
    );
  }

  return (
    <SortableContext
      items={blockIds.map((id: number) => `block-${id}`)}
      strategy={verticalListSortingStrategy}
    >
      {blockIds.map((blockId: number, index: number) => (
        <SortableFormBlock
          key={blockId}
          blockId={blockId}
          fields={fieldsByBlocks[blockId] || []}
          onRemoveField={handleRemoveField}
          onRemoveBlock={handleRemoveBlock}
          onAddBlock={handleAddBlock}
          selectedFormField={selectedFormField}
          onFieldClick={setSelectedFormField}
          isLastBlock={index === blockIds.length - 1}
        />
      ))}
    </SortableContext>
  );
}
