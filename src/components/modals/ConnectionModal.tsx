import { useState, useEffect } from 'react';
import { connectionCookieUtils } from '../../utils/cookies';

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
  // TODO: Remove default values before production deployment
  // Default development credentials
  const DEV_ENVIRONMENT = 'sandbox';
  const DEV_API_KEY = '2ad75cfa-7021-4332-9557-877cab580268';
  const DEV_DATAFLOW_ID = '11734';

  // Initialize with default values or saved cookies
  const [environment, setEnvironment] = useState(() => {
    const saved = connectionCookieUtils.loadConnection();
    return saved ? saved.environment : DEV_ENVIRONMENT;
  });

  const [apiKey, setApiKey] = useState(() => {
    const saved = connectionCookieUtils.loadConnection();
    return saved ? saved.apiKey : DEV_API_KEY;
  });

  const [dataflowId, setDataflowId] = useState(() => {
    const saved = connectionCookieUtils.loadConnection();
    return saved ? saved.dataflowId : DEV_DATAFLOW_ID;
  });

  const [webformName, setWebformName] = useState(() => {
    const saved = connectionCookieUtils.loadWebformName();
    return saved || '';
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ environment, apiKey, dataflowId, webformName });
  };

  const handleClearSavedCredentials = () => {
    // Clear all saved connection data
    connectionCookieUtils.clearConnection();
    connectionCookieUtils.clearWebformName();

    // Reset to default values
    setEnvironment(DEV_ENVIRONMENT);
    setApiKey(DEV_API_KEY);
    setDataflowId(DEV_DATAFLOW_ID);
    setWebformName('');

    alert('Saved credentials cleared successfully!');
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

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleClearSavedCredentials}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#E56B38',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
              title="Clear saved credentials and reset to defaults"
            >
              Clear Cookie
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          </div>
        </form>
      </div>
    </div>
  );
}