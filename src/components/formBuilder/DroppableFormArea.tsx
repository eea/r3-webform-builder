import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface DroppableFormAreaProps {
  children: ReactNode;
}

export default function DroppableFormArea({ children }: DroppableFormAreaProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'form-builder',
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: '400px',
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
