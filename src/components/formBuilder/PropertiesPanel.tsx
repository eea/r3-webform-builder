import { FaCog } from 'react-icons/fa';
import PropertiesInspector from './PropertiesInspector';
import ActionView from '../ActionView';
import { panelStyles, colors } from './styles';
import type { FormField } from '../../types/formBuilder';

interface PropertiesPanelProps {
  selectedFormField: FormField | null;
  handleUpdateFieldProperty: (formId: string, property: string, value: any) => void;
  handleDownloadJSON: () => void;
  handlePushToRN3: () => void;
  onGenerateJSON: () => void;
  handleUploadJSON: (jsonData: any) => void;
}

export default function PropertiesPanel({
  selectedFormField,
  handleUpdateFieldProperty,
  handleDownloadJSON,
  handlePushToRN3,
  onGenerateJSON,
  handleUploadJSON,
}: PropertiesPanelProps) {
  return (
    <div
      style={{
        width: '300px',
        backgroundColor: colors.white,
        borderLeft: `1px solid #DAE8F4`,
        padding: '1.5rem',
        overflow: 'auto',
      }}
    >
      <div style={panelStyles.header}>
        <FaCog style={{ color: '#6c757d' }} />
        <h3 style={panelStyles.title}>Field Properties</h3>
      </div>

      <PropertiesInspector selectedField={selectedFormField} onUpdateField={handleUpdateFieldProperty} />

      <ActionView
        onDownloadJSON={handleDownloadJSON}
        onPushToRN3={handlePushToRN3}
        onGenerateJSON={onGenerateJSON}
        onUploadJSON={handleUploadJSON}
      />
    </div>
  );
}
