import React from 'react';
import type { FormField } from '../../types/formBuilder';
import { FaUpload, FaTrash, FaLink, FaExternalLinkAlt, FaMapMarkerAlt } from 'react-icons/fa';

// Render field preview
export function renderFieldPreview(field: FormField) {
  const baseStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.9rem'
  };

  const getCodelistOptions = () => {
    const items = field.customCodelistItems || field.codelistItems || ['Option 1', 'Option 2', 'Option 3'];
    return items;
  };

  switch (field.type.toLowerCase()) {
    case 'text':
    case 'email':
    case 'tel':
    case 'phone':
      return (
        <input
          type={field.type === 'tel' || field.type === 'phone' ? 'tel' : field.type}
          placeholder={`Enter ${field.name.toLowerCase()}`}
          style={baseStyle}
          disabled
        />
      );
    case 'number':
    case 'number_integer':
    case 'number_decimal':
      return (
        <input
          type="number"
          placeholder={`Enter ${field.name.toLowerCase()}`}
          style={baseStyle}
          disabled
          step={field.type === 'number_decimal' ? '0.01' : '1'}
        />
      );
    case 'date':
      return <input type="date" style={baseStyle} disabled />;
    case 'datetime':
      return <input type="datetime-local" style={baseStyle} disabled />;
    case 'select':
    case 'codelist':
      return (
        <select style={baseStyle} disabled>
          <option>Select {field.name.toLowerCase()}</option>
          {getCodelistOptions().map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      );
    case 'multiselect_codelist':
      return (
        <div style={{ ...baseStyle, padding: '0.75rem' }}>
          {getCodelistOptions().slice(0, 3).map((option, index) => (
            <label key={index} style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input type="checkbox" style={{ marginRight: '0.5rem' }} disabled />
              {option}
            </label>
          ))}
          {getCodelistOptions().length > 3 && (
            <div style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
              +{getCodelistOptions().length - 3} more options
            </div>
          )}
        </div>
      );
    case 'textarea':
      return (
        <textarea
          placeholder={`Enter ${field.name.toLowerCase()}`}
          rows={3}
          style={{ ...baseStyle, resize: 'vertical' }}
          disabled
        />
      );
    case 'checkbox':
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" disabled />
          <span>{field.name}</span>
        </label>
      );
    case 'attachment':
      return (
        <div style={{ ...baseStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaUpload style={{ color: '#666' }} />
          <span style={{ color: '#666' }}>Choose file...</span>
          <button
            style={{
              marginLeft: 'auto',
              padding: '0.25rem',
              border: 'none',
              backgroundColor: '#f0f0f0',
              borderRadius: '3px',
              cursor: 'not-allowed'
            }}
            disabled
          >
            <FaTrash style={{ color: '#999' }} />
          </button>
        </div>
      );
    case 'label':
      const level = field.customLevel || field.level || 1;
      const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag style={{
          margin: '0.5rem 0',
          color: '#333',
          fontSize: level === 1 ? '1.5rem' : level === 2 ? '1.3rem' : level === 3 ? '1.1rem' : '1rem'
        }}>
          {field.customTitle || field.name}
        </HeadingTag>
      );
    case 'link':
      return (
        <div style={{ ...baseStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaLink style={{ color: '#47B3FF' }} />
          <input
            type="url"
            placeholder="Enter URL"
            style={{ border: 'none', outline: 'none', flex: 1 }}
            disabled
          />
        </div>
      );
    case 'external_link':
      return (
        <div style={{ ...baseStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaExternalLinkAlt style={{ color: '#47B3FF' }} />
          <input
            type="url"
            placeholder="Enter external URL"
            style={{ border: 'none', outline: 'none', flex: 1 }}
            disabled
          />
        </div>
      );
    case 'point':
    case 'multipoint':
    case 'linestring':
    case 'multilinestring':
    case 'polygon':
    case 'multipolygon':
      return (
        <div style={{ ...baseStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaMapMarkerAlt style={{ color: '#28a745' }} />
          <span style={{ color: '#666' }}>Geographic {field.type} field</span>
        </div>
      );
    default:
      return (
        <input
          type="text"
          placeholder={`Enter ${field.name.toLowerCase()}`}
          style={baseStyle}
          disabled
        />
      );
  }
}

// Render interactive field for preview mode
export function renderInteractiveField(field: FormField) {
  const baseStyle = {
    width: '100%',
    maxWidth: '100%',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const
  };

  const focusStyle = {
    borderColor: '#47B3FF',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(71,179,255,0.1)'
  };

  const title = field.customTitle || field.name;
  const placeholder = field.customPlaceholder || `Enter ${field.name.toLowerCase()}`;
  const isRequired = field.customRequired !== undefined ? field.customRequired : field.required;
  const isReadOnly = field.customReadOnly !== undefined ? field.customReadOnly : field.readOnly;

  const getCodelistOptions = () => {
    const items = field.customCodelistItems || field.codelistItems || ['Option 1', 'Option 2', 'Option 3'];
    return items;
  };

  switch (field.type.toLowerCase()) {
    case 'text':
    case 'email':
    case 'tel':
    case 'phone':
      return (
        <input
          type={field.type === 'tel' || field.type === 'phone' ? 'tel' : field.type}
          placeholder={placeholder}
          style={baseStyle}
          readOnly={isReadOnly}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        />
      );
    case 'number':
    case 'number_integer':
    case 'number_decimal':
      return (
        <input
          type="number"
          placeholder={placeholder}
          style={baseStyle}
          readOnly={isReadOnly}
          step={field.type === 'number_decimal' ? '0.01' : '1'}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        />
      );
    case 'date':
      return (
        <input
          type="date"
          style={baseStyle}
          readOnly={isReadOnly}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        />
      );
    case 'datetime':
      return (
        <input
          type="datetime-local"
          style={baseStyle}
          readOnly={isReadOnly}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        />
      );
    case 'select':
    case 'codelist':
      return (
        <select
          style={baseStyle}
          disabled={isReadOnly}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        >
          <option value="">Select {field.name.toLowerCase()}</option>
          {getCodelistOptions().map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      );
    case 'multiselect_codelist':
      return (
        <div style={{
          ...baseStyle,
          padding: '0.75rem',
          minHeight: '120px',
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: isReadOnly ? '#f5f5f5' : 'white'
        }}>
          {getCodelistOptions().map((option, index) => (
            <label key={index} style={{
              display: 'block',
              marginBottom: '0.5rem',
              cursor: isReadOnly ? 'not-allowed' : 'pointer'
            }}>
              <input
                type="checkbox"
                style={{ marginRight: '0.5rem' }}
                disabled={isReadOnly}
              />
              {option}
            </label>
          ))}
        </div>
      );
    case 'textarea':
      return (
        <textarea
          placeholder={placeholder}
          rows={4}
          style={{ ...baseStyle, resize: 'vertical', minHeight: '100px', maxWidth: '100%' }}
          readOnly={isReadOnly}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        />
      );
    case 'checkbox':
      return (
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: isReadOnly ? 'not-allowed' : 'pointer',
          padding: '0.5rem 0'
        }}>
          <input
            type="checkbox"
            style={{
              width: '18px',
              height: '18px',
              cursor: isReadOnly ? 'not-allowed' : 'pointer',
              accentColor: '#47B3FF'
            }}
            disabled={isReadOnly}
          />
          <span style={{ fontSize: '1rem' }}>{title}</span>
        </label>
      );
    case 'attachment':
      return (
        <div style={{ ...baseStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="file"
            style={{ flex: 1 }}
            disabled={isReadOnly}
          />
          <button
            style={{
              padding: '0.25rem 0.5rem',
              border: '1px solid #ccc',
              backgroundColor: '#f8f9fa',
              borderRadius: '3px',
              cursor: isReadOnly ? 'not-allowed' : 'pointer'
            }}
            disabled={isReadOnly}
          >
            <FaTrash style={{ color: isReadOnly ? '#999' : '#dc3545' }} />
          </button>
        </div>
      );
    case 'label':
      const level = field.customLevel || field.level || 1;
      const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag style={{
          margin: '0.5rem 0',
          color: '#333',
          fontSize: level === 1 ? '1.8rem' : level === 2 ? '1.5rem' : level === 3 ? '1.3rem' : level === 4 ? '1.1rem' : '1rem',
          fontWeight: 'bold'
        }}>
          {title}
        </HeadingTag>
      );
    case 'link':
      return (
        <div style={{ ...baseStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaLink style={{ color: '#47B3FF' }} />
          <input
            type="url"
            placeholder="Enter URL"
            style={{ border: 'none', outline: 'none', flex: 1 }}
            readOnly={isReadOnly}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: 'transparent', boxShadow: 'none' })}
          />
        </div>
      );
    case 'external_link':
      return (
        <div style={{ ...baseStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaExternalLinkAlt style={{ color: '#47B3FF' }} />
          <input
            type="url"
            placeholder="Enter external URL"
            style={{ border: 'none', outline: 'none', flex: 1 }}
            readOnly={isReadOnly}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: 'transparent', boxShadow: 'none' })}
          />
        </div>
      );
    case 'point':
    case 'multipoint':
    case 'linestring':
    case 'multilinestring':
    case 'polygon':
    case 'multipolygon':
      return (
        <div style={{
          ...baseStyle,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#f8f9fa',
          color: '#6c757d'
        }}>
          <FaMapMarkerAlt style={{ color: '#28a745' }} />
          <span>Geographic {field.type} field - Click to edit coordinates</span>
        </div>
      );
    default:
      return (
        <input
          type="text"
          placeholder={placeholder}
          style={baseStyle}
          readOnly={isReadOnly}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        />
      );
  }
}
