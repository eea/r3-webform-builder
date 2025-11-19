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
    <div className="border-t border-blue-light pt-4 mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-light">
        <FaCode className="text-primary" />
        <h3 className="m-0 text-base text-text-dark font-bold">
          Actions
        </h3>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Upload JSON Button */}
        <button
          onClick={handleUploadClick}
          className="w-full px-4 py-3 bg-orange text-white border-none rounded-md cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-orange-dark"
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
          className="w-full px-4 py-3 bg-secondary text-white border-none rounded-md cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-secondary-dark"
        >
          <FaDownload />
          Download JSON
        </button>

        {/* Push to RN3 Button */}
        <button
          onClick={onPushToRN3}
          className="w-full px-4 py-3 bg-blue text-white border-none rounded-md cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-blue-dark"
        >
          <FaUpload />
          Push to RN3
        </button>
      </div>

      {/* Info Text */}
      <div className="mt-3 p-2 bg-blue-light rounded text-xs text-gray italic text-center">
        Generate and export your form configuration
      </div>
    </div>
  );
}
