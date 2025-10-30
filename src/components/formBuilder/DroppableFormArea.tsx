import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface DroppableFormAreaProps {
  children: ReactNode;
  elementCount?: number;
}

export default function DroppableFormArea({ children, elementCount = 0 }: DroppableFormAreaProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'form-builder',
  });

  // Calculate dynamic height based on number of elements
  // Base height of 400px + 120px per element (to accommodate form fields and spacing)
  const dynamicHeight = Math.max(400, 400 + (elementCount * 120));

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: `${dynamicHeight}px`,
        padding: '1rem',
        backgroundColor: isOver ? '#DAE8F4' : 'transparent',
        border: isOver ? '2px dashed #47B3FF' : '2px dashed transparent',
        borderRadius: '8px',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </div>
  );
}
