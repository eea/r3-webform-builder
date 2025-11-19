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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-11/12 max-w-lg shadow-xl">
        <h2 className="mt-0 mb-6 text-text-dark text-2xl font-semibold">
          Push JSON to ReportNet
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Warning/Info Section */}
          <div className="bg-primary-light p-4 rounded mb-6 text-sm text-gray">
            <strong>Design Status</strong>
            <p className="mt-2 mb-0">
              This will upload your webform configuration to ReportNet.
            </p>
          </div>

          {/* Upload JSON from file (Optional) */}
          <div className="mb-6">
            <label className="block mb-2 font-bold text-gray">
              Upload JSON from File (Optional)
            </label>
            <p className="text-xs text-text-muted mt-0 mb-2 italic">
              If you upload a file, it will be used instead of the generated JSON
            </p>

            {uploadedFile ? (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-500">
                <span className="flex-1 text-sm">{uploadedFile.name}</span>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="inline-block px-4 py-2 bg-gray text-white rounded cursor-pointer text-sm text-center hover:bg-gray-dark transition-colors">
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
            <label className="block mb-2 font-bold text-gray">
              Select JSON Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'TABLES' | 'ENTITIES' | 'PAMS' | 'Q&A')}
              className="w-full px-3 py-3 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="TABLES">Tables</option>
              <option value="ENTITIES">Entities</option>
              <option value="PAMS">PaMs</option>
              <option value="Q&A">Q&A</option>
            </select>
          </div>

          {/* File Name Input */}
          <div className="mb-6">
            <label className="block mb-2 font-bold text-gray">
              File Name*
            </label>
            <p className="text-xs text-text-muted mt-0 mb-2 italic">
              Note: Same name will overwrite previous version
            </p>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              required
              className="w-full px-3 py-3 text-base border border-gray-300 rounded box-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPushing}
              className="px-6 py-3 bg-gray-500 text-white rounded text-base hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPushing || !fileName.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded text-base font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isPushing ? 'Pushing...' : 'Push to RN3'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
