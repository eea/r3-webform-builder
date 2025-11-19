import { FaWpforms, FaEye } from 'react-icons/fa';
import { buttonStyles, colors } from './styles';
import type { FormField } from '../../types/formBuilder';

interface FormBuilderHeaderProps {
  showPreview: boolean;
  showJSON: boolean;
  onTogglePreview: () => void;
  onToggleJSON: () => void;
  onClearTable: () => void;
  onClearAll: () => void;
  currentTableFormFields: FormField[];
  formFields: FormField[];
}

export default function FormBuilderHeader({
  showPreview,
  showJSON,
  onTogglePreview,
  onToggleJSON,
  onClearTable,
  onClearAll,
  currentTableFormFields,
  formFields,
}: FormBuilderHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: `1px solid ${colors.grayBorder}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaWpforms style={{ color: colors.secondary }} />
        <h2
          style={{
            margin: 0,
            fontSize: '1.1rem',
            color: colors.text,
            display: window.innerWidth > 768 ? 'block' : 'none',
          }}
        >
          Form Builder
        </h2>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', margin: '-0.3rem', padding: '0rem' }}>
        <button
          onClick={onTogglePreview}
          style={{
            ...buttonStyles.base,
            ...buttonStyles.primary,
            backgroundColor: showPreview ? colors.primaryDark : colors.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FaEye />
          {showPreview ? 'Edit Mode' : 'Preview'}
        </button>
        <button
          onClick={onToggleJSON}
          style={{
            ...buttonStyles.base,
            ...buttonStyles.secondary,
          }}
        >
          {showJSON ? 'Show Form' : 'JSON'}
        </button>
        <button
          onClick={onClearTable}
          style={{
            ...buttonStyles.base,
            ...(currentTableFormFields.length === 0 ? buttonStyles.disabled : buttonStyles.danger),
          }}
          disabled={currentTableFormFields.length === 0}
        >
          Clear Table
        </button>
        <button
          onClick={onClearAll}
          style={{
            ...buttonStyles.base,
            ...(formFields.length === 0 ? buttonStyles.disabled : buttonStyles.danger),
          }}
          disabled={formFields.length === 0}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
