import { getFieldIcon } from '../../utils/formBuilder/fieldIcons';
import { colors } from './styles';
import type { Field } from '../../types/formBuilder';

interface DragPreviewProps {
  field: Field;
}

export default function DragPreview({ field }: DragPreviewProps) {
  return (
    <div
      style={{
        padding: '0.5rem',
        backgroundColor: colors.white,
        border: `2px solid ${colors.primary}`,
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(44,62,76,0.15)',
        transform: 'rotate(5deg)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
      }}
    >
      <div style={{ color: colors.primary }}>{getFieldIcon(field.type)}</div>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: colors.textDark }}>
          {field.name}
        </div>
        <div style={{ fontSize: '0.8rem', color: colors.gray }}>{field.type}</div>
      </div>
    </div>
  );
}
