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
    <div style={{
      borderTop: '1px solid #DAE8F4',
      paddingTop: '1rem',
      marginTop: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #DAE8F4'
      }}>
        <FaCode style={{ color: '#47B3FF' }} />
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#2E3E4C', fontWeight: 'bold' }}>
          Actions
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          onClick={handleUploadClick}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: '#E97C00',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s ease'
          }}
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
          style={{ display: 'none' }}
        />

        <button
          onClick={() => {
            onGenerateJSON();
            onDownloadJSON();
          }}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: '#50B0A4',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#289588'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#50B0A4'}
        >
          <FaDownload />
          Download JSON
        </button>

        <button
          onClick={onPushToRN3}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: '#006BB8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004B7F'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#006BB8'}
        >
          <FaUpload />
          Push to RN3
        </button>
      </div>

      <div style={{
        marginTop: '0.75rem',
        padding: '0.5rem',
        backgroundColor: '#DAE8F4',
        borderRadius: '4px',
        fontSize: '0.8rem',
        color: '#4C677F',
        fontStyle: 'italic',
        textAlign: 'center'
      }}>
        Generate and export your form configuration
      </div>
    </div>
  );
}