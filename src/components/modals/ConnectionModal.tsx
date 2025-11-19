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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
      <div className="bg-white p-8 rounded-lg w-[400px] max-w-[90%]">
        <h2 className="m-0 mb-4 text-2xl font-bold">Connection Settings</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">
              Environment:<span className="text-[#B83230] ml-1">*</span>
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded box-border"
              required
            >
              <option value="">Select Environment</option>
              <option value="production">Production</option>
              <option value="test">Test</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              API Key:<span className="text-[#B83230] ml-1">*</span>
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded box-border"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              Dataflow ID:<span className="text-[#B83230] ml-1">*</span>
            </label>
            <input
              type="text"
              value={dataflowId}
              onChange={(e) => setDataflowId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded box-border"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2">
              Webform Name:
            </label>
            <input
              type="text"
              value={webformName}
              onChange={(e) => setWebformName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded box-border"
              placeholder="Enter webform name (optional)"
            />
          </div>

          <div className="flex gap-4 justify-between items-center">
            <button
              type="button"
              onClick={handleClearSavedCredentials}
              className="text-white border-none rounded cursor-pointer"
              style={{ backgroundColor: '#E56B38', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
              title="Clear saved credentials and reset to defaults"
            >
              Clear Cookie
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-white border-none rounded cursor-pointer"
                style={{ backgroundColor: '#6c757d', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-white border-none rounded cursor-pointer"
                style={{ backgroundColor: '#0083E0', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
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