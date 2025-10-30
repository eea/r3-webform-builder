import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import SortableFormField from './SortableFormField';
import type { FormField } from '../../types/formBuilder';

interface FormBlockProps {
  blockId: number;
  fields: FormField[];
  onRemoveField: (formId: string) => void;
  onRemoveBlock: (blockId: number) => void;
  onAddBlock: () => void;
  selectedFormField: FormField | null;
  onFieldClick: (field: FormField) => void;
  isLastBlock: boolean;
}

export default function FormBlock({
  blockId,
  fields,
  onRemoveField,
  onRemoveBlock,
  onAddBlock,
  selectedFormField,
  onFieldClick,
  isLastBlock
}: FormBlockProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `block-${blockId}`,
    data: { blockId }
  });

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Block Content */}
      <div
        ref={setNodeRef}
        style={{
          minHeight: '100px',
          padding: '1rem',
          backgroundColor: isOver ? '#e3f2fd' : 'white',
          border: '2px solid #dee2e6',
          borderRadius: '4px',
          display: 'flex',
          gap: '1rem',
          alignItems: 'stretch',
          transition: 'background-color 0.2s ease'
        }}
      >
        {fields.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6c757d',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '2rem'
          }}>
            Drop fields here to create a horizontal layout
          </div>
        ) : (
          <SortableContext
            items={fields.map(f => f.formId)}
            strategy={horizontalListSortingStrategy}
          >
            {fields.map((field) => (
              <div
                key={field.formId}
                style={{
                  flex: `1 1 ${100 / fields.length}%`,
                  minWidth: '200px'
                }}
              >
                <SortableFormField
                  field={field}
                  onRemove={onRemoveField}
                  isSelected={selectedFormField?.formId === field.formId}
                  onClick={() => onFieldClick(field)}
                />
              </div>
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}