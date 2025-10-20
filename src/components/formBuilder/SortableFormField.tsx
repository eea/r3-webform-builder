import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical, FaTimes } from 'react-icons/fa';
import type { FormField } from '../../types/formBuilder';
import { getFieldIcon } from '../../utils/formBuilder/fieldIcons';

interface SortableFormFieldProps {
  field: FormField;
  onRemove: (formId: string) => void;
  isSelected: boolean;
  onClick: () => void;
}

export default function SortableFormField({
  field,
  onRemove,
  isSelected,
  onClick
}: SortableFormFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.formId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        onClick={onClick}
        style={{
          padding: '1rem',
          backgroundColor: 'white',
          border: `2px solid ${isSelected ? '#47B3FF' : '#DAE8F4'}`,
          borderRadius: '4px',
          marginBottom: '0.75rem',
          boxShadow: isSelected ? '0 2px 8px rgba(71,179,255,0.3)' : '0 1px 3px rgba(44,62,76,0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaGripVertical
              {...attributes}
              {...listeners}
              style={{ color: '#4C677F', cursor: 'grab' }}
              onClick={(e) => e.stopPropagation()}
            />
            <div style={{ color: '#47B3FF', marginRight: '0.25rem' }}>
              {getFieldIcon(field.type)}
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              {field.name}
              {field.required && <span style={{ color: '#B83230', marginLeft: '0.25rem' }}>*</span>}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(field.formId);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#B83230',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.25rem'
            }}
            title="Remove field"
          >
            <FaTimes />
          </button>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#4C677F' }}>
          Type: {field.type} | {field.required ? 'Required' : 'Optional'}
        </div>
      </div>
    </div>
  );
}
