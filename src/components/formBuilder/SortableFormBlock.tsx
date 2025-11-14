import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { FaGripVertical } from 'react-icons/fa';
import SortableFormField from './SortableFormField';
import type { FormField } from '../../types/formBuilder';

interface SortableFormBlockProps {
  blockId: number;
  fields: FormField[];
  onRemoveField: (formId: string) => void;
  onRemoveBlock: (blockId: number) => void;
  onAddBlock: () => void;
  selectedFormField: FormField | null;
  onFieldClick: (field: FormField) => void;
  isLastBlock: boolean;
}

export default function SortableFormBlock({
  blockId,
  fields,
  onRemoveField,
  onRemoveBlock,
  onAddBlock,
  selectedFormField,
  onFieldClick,
  isLastBlock
}: SortableFormBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `block-${blockId}`,
    data: { type: 'block', blockId }
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-block-${blockId}`,
    data: { blockId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={{ ...style, marginBottom: '1rem' }}>
      {/* Block Content */}
      <div
        style={{
          minHeight: '100px',
          padding: '0.5rem',
          paddingBottom: '0.1rem',
          border: '2px solid #dee2e6',
          borderRadius: '4px',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start',
          position: 'relative',
          backgroundColor: isOver ? '#e3f2fd' : 'white',
          transition: 'background-color 0.2s ease'
        }}
      >
        {/* Drag Handle - Positioned at top-left */}
        {fields.length > 0 && (
          <div style={{
            display: 'flex',
            paddingRight: '0.5rem',
            paddingTop: '0.25rem'
          }}>
            <FaGripVertical
              {...attributes}
              {...listeners}
              style={{
                color: '#4C677F',
                cursor: isDragging ? 'grabbing' : 'grab',
                fontSize: '1rem'
              }}
              title="Drag to reorder block"
            />
          </div>
        )}

        {/* Fields Container - This is the droppable area */}
        <div
          ref={setDroppableRef}
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            flex: 1,
            width: '100%',
            borderRadius: '4px',
            minHeight: '80px'
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
    </div>
  );
}
