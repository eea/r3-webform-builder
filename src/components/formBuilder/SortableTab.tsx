import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactElement } from 'react';

interface TreeNode {
  id: string;
  tableId: string;
  label: string;
  title: string;
  children: TreeNode[];
}

interface SortableTabProps {
  childTable: TreeNode;
  isActive: boolean;
  onClick: () => void;
  getTableIcon: () => ReactElement;
}

export default function SortableTab({
  childTable,
  isActive,
  onClick,
  getTableIcon
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: childTable.tableId,
    data: { type: 'tab', tableId: childTable.tableId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    flex: 1
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      style={{
        ...style,
        padding: '0.75rem 1.5rem',
        paddingBottom: '0.85rem',
        backgroundColor: isActive ? '#EFEBF2' : '#f8f9fa',
        color: isActive ? '#2E3E4C' : '#6b7280',
        border: isActive ? '1px solid #BEADCE' : '1px solid #dee2e6',
        borderBottom: isActive ? 'none' : '1px solid #dee2e6',
        borderRadius: '8px 8px 0 0',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.2s ease',
        position: 'relative',
        marginBottom: '-2px',
        zIndex: isActive ? 2 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#e9ecef';
          e.currentTarget.style.color = '#374151';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.color = '#6b7280';
        }
      }}
    >
      {/* Table icon as drag handle */}
      <span
        {...attributes}
        {...listeners}
        style={{
          marginRight: '0.5rem',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center'
        }}
        title="Drag to reorder tabs"
      >
        {getTableIcon()}
      </span>
      {childTable.title}
    </button>
  );
}
