import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useApp } from '../context/AppContext';
import { generateFormJSON } from '../utils/formBuilder/jsonHandlers';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useFormBuilderState } from '../hooks/useFormBuilderState';
import { useFormBuilderHelpers } from '../hooks/useFormBuilderHelpers';
import { useFieldManagement } from '../hooks/useFieldManagement';
import { useFormBuilderEffects } from '../hooks/useFormBuilderEffects';
import { useFormBuilderHandlers } from '../hooks/useFormBuilderHandlers';
import { useRN3Push } from '../hooks/useRN3Push';
import FieldsPanel from './formBuilder/FieldsPanel';
import FormBuilderHeader from './formBuilder/FormBuilderHeader';
import JSONView from './formBuilder/JSONView';
import FormBuilderArea from './formBuilder/FormBuilderArea';
import PropertiesPanel from './formBuilder/PropertiesPanel';
import DragPreview from './formBuilder/DragPreview';
import PreviewMode from './formBuilder/PreviewMode';
import PushToRN3Modal from './modals/PushToRN3Modal';

import type { FormBuilderViewProps } from '../types/formBuilder';

export default function FormBuilderPanel({
  selectedFields,
  onRemoveField,
  onGenerateJSON,
  onClearForm,
  onUploadJSON,
}: FormBuilderViewProps) {
  const { state, setSelectedTreeTable, setWebformName, updateTableProperties, addRootTableToTree, addChildTableToTree, removeTableFromTree } = useApp();

  // Use custom hooks for state management
  const {
    showJSON,
    setShowJSON,
    showPreview,
    setShowPreview,
    showPushModal,
    setShowPushModal,
    formFields,
    setFormFields,
    selectedFormField,
    setSelectedFormField,
    editingTableProperties,
    setEditingTableProperties,
    editTitle,
    setEditTitle,
    editLabel,
    setEditLabel,
    blockOrderMap,
    setBlockOrderMap,
    tabOrder,
    setTabOrder,
  } = useFormBuilderState({ initialFields: selectedFields });

  // Use custom hooks for helper functions
  const {
    getAvailableFields,
    getCurrentTableFormFields,
    getCurrentTableFieldsByBlocks,
    getNextBlockId,
    getChildTables,
    getSelectedTableName,
    getTotalFields,
  } = useFormBuilderHelpers({ state, formFields });

  // Drag and drop hook
  const { activeField, handleDragStart, handleDragEnd } = useDragAndDrop({
    formFields,
    setFormFields,
    currentTableFormFields: getCurrentTableFormFields(),
    selectedTreeTable: state.selectedTreeTable,
    blockOrderMap,
    setBlockOrderMap,
    getCurrentTableFieldsByBlocks,
    getNextBlockId,
    tabOrder,
    setTabOrder,
  });

  // Use custom hook for field management
  const { handleRemoveField, handleUpdateFieldProperty } = useFieldManagement({
    formFields,
    setFormFields,
    selectedFormField,
    setSelectedFormField,
    onRemoveField,
  });

  // Use custom hook for all useEffect logic
  useFormBuilderEffects({
    selectedFields,
    setFormFields,
    selectedFormField,
    setSelectedFormField,
    selectedTreeTable: state.selectedTreeTable,
    treeStructure: state.treeStructure,
    hasRootTable: state.hasRootTable,
    tabOrder,
    setTabOrder,
    blockOrderMap,
    setBlockOrderMap,
    getChildTables,
    getCurrentTableFieldsByBlocks,
  });

  // Computed values
  const availableFields = getAvailableFields();
  const currentTableFormFields = getCurrentTableFormFields();
  const selectedTableName = getSelectedTableName();
  const totalFields = getTotalFields();

  // Helper function to generate JSON
  const generateJSON = () => {
    return generateFormJSON(
      formFields,
      state.webformName || 'Untitled Webform',
      state.treeStructure,
      state.hasRootTable,
      state.selectedTreeTable,
      state.datasets,
      state.selectedDataset
    );
  };

  // Use custom hook for JSON handlers
  const { handleDownloadJSON, handleUploadJSON } = useFormBuilderHandlers({
    state: {
      webformName: state.webformName,
      datasets: state.datasets,
      selectedDataset: state.selectedDataset,
      treeStructure: state.treeStructure,
    },
    generateJSON,
    setFormFields,
    setSelectedFormField,
    setBlockOrderMap,
    setTabOrder,
    setWebformName,
    setSelectedTreeTable,
    addRootTableToTree,
    addChildTableToTree,
    removeTableFromTree,
    onUploadJSON,
  });

  // Use custom hook for ReportNet push operations
  const { handlePushToRN3, handlePushConfirm } = useRN3Push({
    state: {
      connection: state.connection,
      selectedDataset: state.selectedDataset,
    },
    showPushModal,
    setShowPushModal,
    generateJSON,
  });

  const handleAddBlock = () => {
    // Placeholder for adding empty blocks
  };

  const handleRemoveBlock = () => {
    // Placeholder for removing empty blocks
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        style={{
          flex: 1,
          height: '100%',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Column 1: Table Fields / Label */}
        <FieldsPanel
          selectedTableName={selectedTableName}
          availableFields={availableFields}
          totalFields={totalFields}
          currentTableFormFields={currentTableFormFields}
          selectedTreeTable={state.selectedTreeTable}
        />

        {/* Column 2: Form Builder */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
          }}
        >
          {/* Header */}
          <FormBuilderHeader
            showPreview={showPreview}
            showJSON={showJSON}
            onTogglePreview={() => {
              setShowPreview(!showPreview);
              if (showJSON) setShowJSON(false);
            }}
            onToggleJSON={() => {
              setShowJSON(!showJSON);
              if (!showJSON) onGenerateJSON();
              if (showPreview) setShowPreview(false);
            }}
            onClearTable={() => {
              setFormFields((prev) => prev.filter((f) => f.tableId !== state.selectedTreeTable));
            }}
            onClearAll={() => {
              setFormFields([]);
              onClearForm();
            }}
            currentTableFormFields={currentTableFormFields}
            formFields={formFields}
          />

          {/* Content Area */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {showJSON ? (
              <JSONView jsonData={generateJSON()} />
            ) : showPreview ? (
              <PreviewMode
                treeStructure={state.treeStructure}
                hasRootTable={state.hasRootTable}
                formFields={formFields}
                tabOrder={tabOrder}
                onTabOrderChange={setTabOrder}
              />
            ) : (
              <FormBuilderArea
                selectedTreeTable={state.selectedTreeTable}
                currentTableFormFields={currentTableFormFields}
                selectedTableName={selectedTableName}
                editingTableProperties={editingTableProperties}
                editTitle={editTitle}
                editLabel={editLabel}
                setEditTitle={setEditTitle}
                setEditLabel={setEditLabel}
                setEditingTableProperties={setEditingTableProperties}
                updateTableProperties={updateTableProperties}
                treeStructure={state.treeStructure}
                blockOrderMap={blockOrderMap}
                getCurrentTableFieldsByBlocks={getCurrentTableFieldsByBlocks}
                handleRemoveField={handleRemoveField}
                handleRemoveBlock={handleRemoveBlock}
                handleAddBlock={handleAddBlock}
                selectedFormField={selectedFormField}
                setSelectedFormField={setSelectedFormField}
              />
            )}
          </div>
        </div>

        {/* Column 3: Properties Panel */}
        <PropertiesPanel
          selectedFormField={selectedFormField}
          handleUpdateFieldProperty={handleUpdateFieldProperty}
          handleDownloadJSON={handleDownloadJSON}
          handlePushToRN3={handlePushToRN3}
          onGenerateJSON={onGenerateJSON}
          handleUploadJSON={handleUploadJSON}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeField ? (
          <DragPreview field={activeField} />
        ) : null}
      </DragOverlay>

      {/* Push to RN3 Modal */}
      <PushToRN3Modal
        isOpen={showPushModal}
        onClose={() => setShowPushModal(false)}
        onPush={handlePushConfirm}
      />
    </DndContext>
  );
}
