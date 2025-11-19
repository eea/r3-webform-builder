import { useRef } from 'react';
import { FaDownload, FaUpload, FaCode, FaFileUpload } from 'react-icons/fa';

interface ActionViewProps {
  onDownloadJSON: () => void;
  onPushToRN3: () => void;
  onGenerateJSON: () => void;
  onUploadJSON: (jsonData: any) => void;
}

export default function ActionView({ onDownloadJSON, onPushToRN3, onGenerateJSON, onUploadJSON }: ActionViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          onUploadJSON(jsonData);
        } catch (error) {
          alert('Invalid JSON file. Please select a valid JSON file.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a JSON file.');
    }
    // Reset the input so the same file can be uploaded again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-t pt-4 mt-4" style={{ borderColor: '#DAE8F4' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: '#DAE8F4' }}>
        <FaCode style={{ color: '#47B3FF' }} />
        <h3 className="m-0 text-base font-bold" style={{ color: '#2E3E4C' }}>
          Actions
        </h3>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Upload JSON Button */}
        <button
          onClick={handleUploadClick}
          className="w-full px-4 py-3 text-white border-none rounded-md cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: '#E97C00' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C76800'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E97C00'}
        >
          <FaFileUpload />
          Upload JSON
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          className="hidden"
        />

        {/* Download JSON Button */}
        <button
          onClick={() => {
            onGenerateJSON();
            onDownloadJSON();
          }}
          className="w-full px-4 py-3 text-white border-none rounded-md cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: '#50B0A4' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#289588'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#50B0A4'}
        >
          <FaDownload />
          Download JSON
        </button>

        {/* Push to RN3 Button */}
        <button
          onClick={onPushToRN3}
          className="w-full px-4 py-3 text-white border-none rounded-md cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: '#006BB8' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004B7F'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#006BB8'}
        >
          <FaUpload />
          Push to RN3
        </button>
      </div>

      {/* Info Text */}
      <div className="mt-3 p-2 rounded text-xs italic text-center" style={{ backgroundColor: '#DAE8F4', color: '#4C677F' }}>
        Generate and export your form configuration
      </div>
    </div>
  );
}
