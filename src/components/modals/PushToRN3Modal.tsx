import { useState } from 'react';

interface PushToRN3ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPush: (fileName: string, type: 'TABLES' | 'ENTITIES' | 'PAMS' | 'Q&A', uploadedFile?: File) => Promise<void>;
}

export default function PushToRN3Modal({ isOpen, onClose, onPush }: PushToRN3ModalProps) {
  const [fileName, setFileName] = useState('');
  const [selectedType, setSelectedType] = useState<'TABLES' | 'ENTITIES' | 'PAMS' | 'Q&A'>('TABLES');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isPushing, setIsPushing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileName.trim()) {
      alert('Please enter a file name.');
      return;
    }

    setIsPushing(true);
    try {
      await onPush(fileName, selectedType, uploadedFile || undefined);
      onClose();
      setFileName('');
      setUploadedFile(null);
      setSelectedType('TABLES');
    } catch (error) {
      console.error('Error pushing to RN3:', error);
    } finally {
      setIsPushing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setUploadedFile(file);
    } else {
      alert('Please select a JSON file.');
      setUploadedFile(null);
    }
    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2E3E4C' }}>
          Push JSON to ReportNet
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Warning/Info Section */}
          <div style={{
            backgroundColor: '#DAE8F4',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: '#4C677F'
          }}>
            <strong>Design Status</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              This will upload your webform configuration to ReportNet.
            </p>
          </div>

          {/* Upload JSON from file (Optional) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              color: '#4C677F'
            }}>
              Upload JSON from File (Optional)
            </label>
            <p style={{
              fontSize: '0.85rem',
              color: '#6c757d',
              marginTop: '0',
              marginBottom: '0.5rem',
              fontStyle: 'italic'
            }}>
              If you upload a file, it will be used instead of the generated JSON
            </p>

            {uploadedFile ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#e8f5e9',
                borderRadius: '4px',
                border: '1px solid #4caf50'
              }}>
                <span style={{ flex: 1, fontSize: '0.9rem' }}>{uploadedFile.name}</span>
                <button
                  type="button"
                  onClick={handleClearFile}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <label style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#4C677F',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                Choose JSON File
              </label>
            )}
          </div>

          {/* JSON Type Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              color: '#4C677F'
            }}>
              Select JSON Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'TABLES' | 'ENTITIES' | 'PAMS' | 'Q&A')}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value="TABLES">Tables</option>
              <option value="ENTITIES">Entities</option>
              <option value="PAMS">PaMs</option>
              <option value="Q&A">Q&A</option>
            </select>
          </div>

          {/* File Name Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              color: '#4C677F'
            }}>
              File Name*
            </label>
            <p style={{
              fontSize: '0.85rem',
              color: '#6c757d',
              marginTop: '0',
              marginBottom: '0.5rem',
              fontStyle: 'italic'
            }}>
              Note: Same name will overwrite previous version
            </p>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPushing}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isPushing ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                opacity: isPushing ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPushing || !fileName.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isPushing || !fileName.trim() ? '#ccc' : '#006BB8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isPushing || !fileName.trim() ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {isPushing ? 'Pushing...' : 'Push to RN3'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
