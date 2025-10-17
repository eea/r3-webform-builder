import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ConnectionModal from './modals/ConnectionModal';
import TableSelectionView from './views/TableSelectionView';
import FormBuilderView from './views/FormBuilderView';
import { fetchDatasets } from './services/api';

interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
  formId: string;
  tableId: string;
}

function AppContent() {
  const { state, setConnection, setDatasets } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<FormField[]>([]);

  const handleConnectionSubmit = async (connectionData: {
    environment: string;
    apiKey: string;
    dataflowId: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const datasets = await fetchDatasets(connectionData);
      setConnection(connectionData);
      setDatasets(datasets);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch datasets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldSelect = (field: any) => {
    const formField: FormField = {
      ...field,
      formId: `form_${field.id}_${Date.now()}`,
      tableId: field.tableId ?? ''
    };
    setSelectedFields(prev => [...prev, formField]);
  };

  const handleRemoveField = (formId: string) => {
    setSelectedFields(prev => prev.filter(field => field.formId !== formId));
  };

  const handleClearForm = () => {
    setSelectedFields([]);
  };

  const handleGenerateJSON = () => {
    console.log('Generate JSON clicked');
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onConnectionClick={() => setIsModalOpen(true)}
      />

      <main style={{
        position: 'absolute',
        top: '60px',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        width: '100vw',
        height: 'calc(100vh - 60px)'
      }}>
        {!state.isConnected ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            textAlign: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: '#333' }}>Welcome to R3 WebFormBuilder</h2>
              <p style={{ fontSize: '1.2rem', color: '#666' }}>Click the Connection button to get started.</p>
            </div>
          </div>
        ) : (
          <>
            <TableSelectionView onFieldSelect={handleFieldSelect} />
            <FormBuilderView
              selectedFields={selectedFields}
              onRemoveField={handleRemoveField}
              onGenerateJSON={handleGenerateJSON}
              onClearForm={handleClearForm}
            />
          </>
        )}

        {error && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '400px',
            textAlign: 'center',
            zIndex: 1000
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </main>

      <ConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleConnectionSubmit}
      />

      {isLoading && (
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            Loading datasets...
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
