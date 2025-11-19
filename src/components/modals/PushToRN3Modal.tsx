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
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg p-8 w-11/12 max-w-lg shadow-xl">
        <h2 className="mt-0 mb-6 text-2xl font-semibold" style={{ color: '#2E3E4C' }}>
          Push JSON to ReportNet
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Warning/Info Section */}
          <div className="p-4 rounded mb-6 text-sm" style={{ backgroundColor: '#A0D7FF', color: '#4C677F' }}>
            <strong>Design Status</strong>
            <p className="mt-2 mb-0">
              This will upload your webform configuration to ReportNet.
            </p>
          </div>

          {/* Upload JSON from file (Optional) */}
          <div className="mb-6">
            <label className="block mb-2 font-bold" style={{ color: '#4C677F' }}>
              Upload JSON from File (Optional)
            </label>
            <p className="text-xs mt-0 mb-2 italic" style={{ color: '#666' }}>
              If you upload a file, it will be used instead of the generated JSON
            </p>

            {uploadedFile ? (
              <div className="flex items-center gap-2 p-2 rounded border" style={{ backgroundColor: '#e8f5e9', borderColor: '#4caf50' }}>
                <span className="flex-1 text-sm">{uploadedFile.name}</span>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="px-2 py-1 text-white rounded text-xs transition-colors"
                  style={{ backgroundColor: '#f44336' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="inline-block px-4 py-2 text-white rounded cursor-pointer text-sm text-center transition-colors"
                style={{ backgroundColor: '#4C677F' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2E3E4C'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4C677F'}
              >
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                Choose JSON File
              </label>
            )}
          </div>

          {/* JSON Type Selection */}
          <div className="mb-6">
            <label className="block mb-2 font-bold" style={{ color: '#4C677F' }}>
              Select JSON Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'TABLES' | 'ENTITIES' | 'PAMS' | 'Q&A')}
              className="w-full px-3 py-3 text-base border rounded focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#ccc' }}
            >
              <option value="TABLES">Tables</option>
              <option value="ENTITIES">Entities</option>
              <option value="PAMS">PaMs</option>
              <option value="Q&A">Q&A</option>
            </select>
          </div>

          {/* File Name Input */}
          <div className="mb-6">
            <label className="block mb-2 font-bold" style={{ color: '#4C677F' }}>
              File Name*
            </label>
            <p className="text-xs mt-0 mb-2 italic" style={{ color: '#666' }}>
              Note: Same name will overwrite previous version
            </p>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              required
              className="w-full px-3 py-3 text-base border rounded box-border focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#ccc' }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPushing}
              className="px-6 py-3 text-white rounded text-base disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#6c757d' }}
              onMouseEnter={(e) => !isPushing && (e.currentTarget.style.backgroundColor = '#5a6268')}
              onMouseLeave={(e) => !isPushing && (e.currentTarget.style.backgroundColor = '#6c757d')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPushing || !fileName.trim()}
              className="px-6 py-3 text-white rounded text-base font-semibold disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: (isPushing || !fileName.trim()) ? '#ccc' : '#006BB8' }}
              onMouseEnter={(e) => !(isPushing || !fileName.trim()) && (e.currentTarget.style.backgroundColor = '#004B7F')}
              onMouseLeave={(e) => !(isPushing || !fileName.trim()) && (e.currentTarget.style.backgroundColor = '#006BB8')}
            >
              {isPushing ? 'Pushing...' : 'Push to RN3'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
