import { useState, useEffect } from 'react';
import { sessionStorageUtils } from '../../utils/sessionStorage';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    environment: string;
    apiKey: string;
    dataflowId: string;
    webformName?: string;
  }) => void;
}

export default function ConnectionModal({ isOpen, onClose, onSubmit }: ConnectionModalProps) {
  // TODO: Remove hardcoded default values before production
  const [environment, setEnvironment] = useState('sandbox');
  const [apiKey, setApiKey] = useState('2ad75cfa-7021-4332-9557-877cab580268');
  const [dataflowId, setDataflowId] = useState('11734');
  const [webformName, setWebformName] = useState('');

  // Load saved connection settings when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedConnection = sessionStorageUtils.loadConnection();
      if (savedConnection) {
        setEnvironment(savedConnection.environment);
        setApiKey(savedConnection.apiKey);
        setDataflowId(savedConnection.dataflowId);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ environment, apiKey, dataflowId, webformName });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%'
      }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>Connection Settings</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Environment:<span style={{ color: '#B83230', marginLeft: '0.25rem' }}>*</span>
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              required
            >
              <option value="">Select Environment</option>
              <option value="production">Production</option>
              <option value="test">Test</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              API Key:<span style={{ color: '#B83230', marginLeft: '0.25rem' }}>*</span>
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Dataflow ID:<span style={{ color: '#B83230', marginLeft: '0.25rem' }}>*</span>
            </label>
            <input
              type="text"
              value={dataflowId}
              onChange={(e) => setDataflowId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Webform Name:
            </label>
            <input
              type="text"
              value={webformName}
              onChange={(e) => setWebformName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter webform name (optional)"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0083E0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}