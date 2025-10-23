import type { FormField } from '../../types/formBuilder';

// Render field preview
export function renderFieldPreview(field: FormField) {
  const baseStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.9rem'
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <input
          type={field.type}
          placeholder={`Enter ${field.name.toLowerCase()}`}
          style={baseStyle}
          disabled
        />
      );
    case 'number':
      return (
        <input
          type="number"
          placeholder={`Enter ${field.name.toLowerCase()}`}
          style={baseStyle}
          disabled
        />
      );
    case 'date':
      return <input type="date" style={baseStyle} disabled />;
    case 'select':
      return (
        <select style={baseStyle} disabled>
          <option>Select {field.name.toLowerCase()}</option>
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
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

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <input
          type={field.type}
          placeholder={placeholder}
          style={baseStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          placeholder={placeholder}
          style={baseStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        />
      );
    case 'date':
      return (
        <input
          type="date"
          style={baseStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        />
      );
    case 'select':
      return (
        <select
          style={baseStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        >
          <option value="">Select {field.name.toLowerCase()}</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
      );
    case 'textarea':
      return (
        <textarea
          placeholder={placeholder}
          rows={4}
          style={{ ...baseStyle, resize: 'vertical', minHeight: '100px', maxWidth: '100%' }}
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
          cursor: 'pointer',
          padding: '0.5rem 0'
        }}>
          <input
            type="checkbox"
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: '#47B3FF'
            }}
          />
          <span style={{ fontSize: '1rem' }}>{title}</span>
        </label>
      );
    default:
      return (
        <input
          type="text"
          placeholder={placeholder}
          style={baseStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#ccc', boxShadow: 'none' })}
        />
      );
  }
}
