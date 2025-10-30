import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { FaGripHorizontal, FaTrash, FaPlus } from 'react-icons/fa';
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
      {/* Block Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderBottom: 'none',
        borderRadius: '4px 4px 0 0',
        fontSize: '0.85rem',
        color: '#495057'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaGripHorizontal style={{ color: '#6c757d' }} />
          <span>Block {blockId} ({fields.length} field{fields.length === 1 ? '' : 's'})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isLastBlock && (
            <button
              onClick={onAddBlock}
              style={{
                background: 'none',
                border: 'none',
                color: '#28a745',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '0.25rem',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              title="Add new block below"
            >
              <FaPlus />
            </button>
          )}
          {fields.length === 0 && (
            <button
              onClick={() => onRemoveBlock(blockId)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc3545',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '0.25rem'
              }}
              title="Remove empty block"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>

      {/* Block Content */}
      <div
        ref={setNodeRef}
        style={{
          minHeight: '100px',
          padding: '1rem',
          backgroundColor: isOver ? '#e3f2fd' : 'white',
          border: '2px solid #dee2e6',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
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