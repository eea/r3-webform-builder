import { FaTable } from 'react-icons/fa';
import DraggableField from './DraggableField';
import { panelStyles, colors } from './styles';
import type { Field, FormField } from '../../types/formBuilder';

interface FieldsPanelProps {
  selectedTableName: string;
  availableFields: Field[];
  totalFields: number;
  currentTableFormFields: FormField[];
  selectedTreeTable: string;
}

export default function FieldsPanel({
  selectedTableName,
  availableFields,
  totalFields,
  currentTableFormFields,
  selectedTreeTable,
}: FieldsPanelProps) {
  return (
    <div style={panelStyles.container}>
      <div style={panelStyles.header}>
        <FaTable style={{ color: colors.primary }} />
        <h3 style={panelStyles.title}>Table Fields / Label</h3>
      </div>

      {selectedTreeTable ? (
        <>
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: colors.primaryLight,
              borderRadius: '4px',
              border: `1px solid ${colors.primary}`,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: colors.info }}>
              {selectedTableName}
            </div>
            <div style={{ fontSize: '0.8rem', color: colors.textDark }}>
              {availableFields.length} of {totalFields} fields available
            </div>
            {currentTableFormFields.length > 0 && (
              <div style={{ fontSize: '0.7rem', color: colors.success, marginTop: '0.25rem' }}>
                {currentTableFormFields.length} field{currentTableFormFields.length === 1 ? '' : 's'} in form
              </div>
            )}
          </div>

          <div>
            {availableFields.length > 0 ? (
              availableFields.map((field: Field) => <DraggableField key={field.id} field={field} />)
            ) : (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: colors.textMuted,
                  fontStyle: 'italic',
                }}
              >
                {totalFields > 0 ? 'All fields have been added to the form' : 'No fields available'}
              </div>
            )}
          </div>

          {/* Label Field - Always Available */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: `1px solid ${colors.grayBorder}`,
            }}
          >
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: colors.textMuted,
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}
            >
              Layout Elements
            </div>
            <DraggableField
              key="label-field"
              field={{
                id: 'label',
                name: 'Label',
                type: 'label',
                required: false,
              }}
            />
          </div>
        </>
      ) : (
        <EmptyFieldsPanel />
      )}
    </div>
  );
}

export function EmptyFieldsPanel() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        textAlign: 'center',
        color: colors.textMuted,
      }}
    >
      <div>
        <FaTable style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ccc' }} />
        <p>Select a table from the treeview to see its fields</p>
      </div>
    </div>
  );
}
