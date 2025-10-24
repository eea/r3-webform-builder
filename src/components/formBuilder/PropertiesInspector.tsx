import React from 'react';
import { FaCog, FaEdit, FaLevelUpAlt, FaKey, FaEye } from 'react-icons/fa';
import type { FormField } from '../../types/formBuilder';

interface PropertiesInspectorProps {
  selectedField: FormField | null;
  onUpdateField: (formId: string, property: string, value: any) => void;
}

export default function PropertiesInspector({
  selectedField,
  onUpdateField
}: PropertiesInspectorProps) {
  if (!selectedField) {
    return (
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
    );
  }

  const handleReset = () => {
    onUpdateField(selectedField.formId, 'customTitle', undefined);
    onUpdateField(selectedField.formId, 'customTooltip', undefined);
    onUpdateField(selectedField.formId, 'customPlaceholder', undefined);
    onUpdateField(selectedField.formId, 'customRequired', undefined);
    onUpdateField(selectedField.formId, 'isPrimary', false);
    onUpdateField(selectedField.formId, 'customLevel', undefined);
    onUpdateField(selectedField.formId, 'customReadOnly', undefined);
    onUpdateField(selectedField.formId, 'customAutoIncrement', undefined);
    onUpdateField(selectedField.formId, 'customIsVisible', undefined);
    onUpdateField(selectedField.formId, 'customCodelistItems', undefined);
  };

  return (
    <div style={{ paddingRight: '1.5rem' }}>
      {/* Field Info */}
      <div style={{
        marginBottom: '1.5rem',
        padding: '0.5rem',
        backgroundColor: '#DAE8F4',
        borderRadius: '4px',
        border: '1px solid #87A7C3',
        marginRight: '-1rem'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
          {selectedField.name}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#4C677F' }}>
          Type: {selectedField.type}
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
          value={selectedField.customTitle || selectedField.name}
          onChange={(e) => onUpdateField(selectedField.formId, 'customTitle', e.target.value)}
          placeholder={selectedField.name}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
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
          value={selectedField.customTooltip || ''}
          onChange={(e) => onUpdateField(selectedField.formId, 'customTooltip', e.target.value)}
          placeholder="Enter helpful text for users..."
          rows={3}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.9rem',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Custom Placeholder */}
      {['text', 'email', 'tel', 'phone', 'number', 'number_integer', 'number_decimal', 'textarea'].includes(selectedField.type.toLowerCase()) && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Placeholder Text
          </label>
          <input
            type="text"
            value={selectedField.customPlaceholder || ''}
            onChange={(e) => onUpdateField(selectedField.formId, 'customPlaceholder', e.target.value)}
            placeholder={`Enter ${selectedField.name.toLowerCase()}`}
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

      {/* Label Level - for LABEL type fields */}
      {selectedField.type.toLowerCase() === 'label' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <FaLevelUpAlt style={{ marginRight: '0.5rem', color: '#47B3FF' }} />
            Heading Level
          </label>
          <select
            value={selectedField.customLevel || selectedField.level || 1}
            onChange={(e) => onUpdateField(selectedField.formId, 'customLevel', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          >
            <option value={1}>H1 - Largest</option>
            <option value={2}>H2 - Large</option>
            <option value={3}>H3 - Medium</option>
            <option value={4}>H4 - Small</option>
            <option value={5}>H5 - Smaller</option>
            <option value={6}>H6 - Smallest</option>
          </select>
        </div>
      )}

      {/* Codelist Items - for CODELIST and MULTISELECT_CODELIST */}
      {['codelist', 'multiselect_codelist'].includes(selectedField.type.toLowerCase()) && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Options (one per line)
          </label>
          <textarea
            value={selectedField.customCodelistItems?.join('\n') || selectedField.codelistItems?.join('\n') || 'Option 1\nOption 2\nOption 3'}
            onChange={(e) => {
              const items = e.target.value.split('\n').filter(item => item.trim() !== '');
              onUpdateField(selectedField.formId, 'customCodelistItems', items);
            }}
            placeholder="Enter options, one per line"
            rows={5}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.9rem',
              resize: 'vertical'
            }}
          />
          <div style={{ fontSize: '0.8rem', color: '#4C677F', marginTop: '0.25rem' }}>
            Each line will be a separate option
          </div>
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
            checked={selectedField.customRequired !== undefined ? selectedField.customRequired : selectedField.required}
            onChange={(e) => onUpdateField(selectedField.formId, 'customRequired', e.target.checked)}
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
            checked={selectedField.isPrimary || false}
            onChange={(e) => onUpdateField(selectedField.formId, 'isPrimary', e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <FaKey style={{ color: '#47B3FF', fontSize: '0.8rem' }} />
          Primary Field
        </label>
        <div style={{ fontSize: '0.8rem', color: '#4C677F', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
          Primary fields are highlighted in the form
        </div>
      </div>

      {/* Read Only Toggle */}
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
            checked={selectedField.customReadOnly !== undefined ? selectedField.customReadOnly : (selectedField.readOnly || false)}
            onChange={(e) => onUpdateField(selectedField.formId, 'customReadOnly', e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Read Only
        </label>
        <div style={{ fontSize: '0.8rem', color: '#4C677F', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
          Field cannot be edited by users
        </div>
      </div>

      {/* Auto Increment Toggle - for number fields */}
      {['number', 'number_integer'].includes(selectedField.type.toLowerCase()) && (
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
              checked={selectedField.customAutoIncrement !== undefined ? selectedField.customAutoIncrement : (selectedField.autoIncrement || false)}
              onChange={(e) => onUpdateField(selectedField.formId, 'customAutoIncrement', e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Auto Increment
          </label>
          <div style={{ fontSize: '0.8rem', color: '#4C677F', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
            Automatically increment value for new records
          </div>
        </div>
      )}

      {/* Visibility Toggle */}
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
            checked={selectedField.customIsVisible !== undefined ? !selectedField.customIsVisible : !(selectedField.isVisible !== false)}
            onChange={(e) => onUpdateField(selectedField.formId, 'customIsVisible', !e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <FaEye style={{ color: '#47B3FF', fontSize: '0.8rem' }} />
          Hidden Field
        </label>
        <div style={{ fontSize: '0.8rem', color: '#4C677F', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
          Field is not visible to users but included in data
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
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
  );
}