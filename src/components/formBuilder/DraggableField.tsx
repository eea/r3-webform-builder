import { useDraggable } from '@dnd-kit/core';
import { FaGripVertical } from 'react-icons/fa';
import type { Field } from '../../types/formBuilder';
import { getFieldIcon } from '../../utils/formBuilder/fieldIcons';

interface DraggableFieldProps {
  field: Field;
}

export default function DraggableField({ field }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: field.id,
    data: field,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab'
      }}
      className="draggable-field"
    >
      <div style={{
        padding: '0.75rem',
        backgroundColor: 'white',
        border: '1px solid #DAE8F4',
        borderRadius: '4px',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 1px 3px rgba(44,62,76,0.1)',
        transition: 'all 0.2s ease'
      }}>
        <FaGripVertical style={{ color: '#4C677F', cursor: 'grab' }} />
        <div style={{ color: '#47B3FF', marginRight: '0.5rem' }}>
          {getFieldIcon(field.type)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#2E3E4C' }}>
            {field.name}
            {field.required && <span style={{ color: '#B83230', marginLeft: '0.25rem' }}>*</span>}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#4C677F' }}>
            {field.type}
          </div>
        </div>
      </div>
    </div>
  );
}
