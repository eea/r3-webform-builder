import { FaCog, FaEdit } from 'react-icons/fa';
import type { FormField } from '../../types/formBuilder';
import ActionView from '../../views/ActionView';

interface FieldPropertiesPanelProps {
  selectedFormField: FormField | null;
  onUpdateFieldProperty: (formId: string, property: string, value: any) => void;
  onDownloadJSON: () => void;
  onPushToRN3: () => void;
  onGenerateJSON: () => void;
  onUploadJSON: (jsonData: any) => void;
}

export default function FieldPropertiesPanel({
  selectedFormField,
  onUpdateFieldProperty,
  onDownloadJSON,
  onPushToRN3,
  onGenerateJSON,
  onUploadJSON
}: FieldPropertiesPanelProps) {
  return (
    <div style={{
      width: '300px',
      backgroundColor: 'white',
      borderLeft: '1px solid #DAE8F4',
      padding: '1.5rem',
      overflow: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #dee2e6'
      }}>
        <FaCog style={{ color: '#6c757d' }} />
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>
          Field Properties
        </h3>
      </div>

      {selectedFormField ? (
        <div style={{ paddingRight: '1.5rem' }}>
          {/* Field Info */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '0.5rem',
            backgroundColor: '#DAE8F4',
            borderRadius: '4px',
            border: '1px solid #87A7C3',
            marginRight:'-1rem'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              {selectedFormField.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#4C677F' }}>
              Type: {selectedFormField.type}
            </div>
          </div>

          {/* Custom Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
              <FaEdit style={{ marginRight: '0.5rem', color: '#47B3FF' }} />
              Display Title
            </label>
            <input
              type="text"
              value={selectedFormField.customTitle || selectedFormField.name}
              onChange={(e) => onUpdateFieldProperty(selectedFormField.formId, 'customTitle', e.target.value)}
              placeholder={selectedFormField.name}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #87A7C3',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Custom Tooltip */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Tooltip / Help Text
            </label>
            <textarea
              value={selectedFormField.customTooltip || ''}
              onChange={(e) => onUpdateFieldProperty(selectedFormField.formId, 'customTooltip', e.target.value)}
              placeholder="Enter helpful text for users..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #87A7C3',
                borderRadius: '4px',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Custom Placeholder */}
          {['text', 'email', 'tel', 'number', 'textarea'].includes(selectedFormField.type) && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Placeholder Text
              </label>
              <input
                type="text"
                value={selectedFormField.customPlaceholder || ''}
                onChange={(e) => onUpdateFieldProperty(selectedFormField.formId, 'customPlaceholder', e.target.value)}
                placeholder={`Enter ${selectedFormField.name.toLowerCase()}`}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          )}

          {/* Required Toggle */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={selectedFormField.customRequired !== undefined ? selectedFormField.customRequired : selectedFormField.required}
                onChange={(e) => onUpdateFieldProperty(selectedFormField.formId, 'customRequired', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Required Field
            </label>
          </div>

          {/* Primary Field Toggle */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={selectedFormField.isPrimary || false}
                onChange={(e) => onUpdateFieldProperty(selectedFormField.formId, 'isPrimary', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Primary Field
            </label>
            <div style={{ fontSize: '0.8rem', color: '#4C677F', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
              Primary fields are highlighted in the form
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              onUpdateFieldProperty(selectedFormField.formId, 'customTitle', undefined);
              onUpdateFieldProperty(selectedFormField.formId, 'customTooltip', undefined);
              onUpdateFieldProperty(selectedFormField.formId, 'customPlaceholder', undefined);
              onUpdateFieldProperty(selectedFormField.formId, 'customRequired', undefined);
              onUpdateFieldProperty(selectedFormField.formId, 'isPrimary', false);
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#4C677F',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginTop: '1rem'
            }}
          >
            Reset to Defaults
          </button>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          textAlign: 'center',
          color: '#666'
        }}>
          <div>
            <FaCog style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ccc' }} />
            <p>Select a field to edit its properties</p>
          </div>
        </div>
      )}

      {/* Action View - Always visible */}
      <ActionView
        onDownloadJSON={onDownloadJSON}
        onPushToRN3={onPushToRN3}
        onGenerateJSON={onGenerateJSON}
        onUploadJSON={onUploadJSON}
      />
    </div>
  );
}
