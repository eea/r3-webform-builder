import { useState, useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useApp } from '../context/AppContext';
import { FaPlus, FaTable, FaWpforms, FaCog, FaEye, FaEdit } from 'react-icons/fa';
import { getFieldIcon } from '../utils/formBuilder/fieldIcons';
import { generateFormJSON, importFormJSON } from '../utils/formBuilder/jsonHandlers';
import { uploadWebformToRN3 } from '../services/api';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import ActionView from './ActionView';
import DraggableField from './formBuilder/DraggableField';
import DroppableFormArea from './formBuilder/DroppableFormArea';
import PropertiesInspector from './formBuilder/PropertiesInspector';
import FormBlock from './formBuilder/FormBlock';
import SortableFormBlock from './formBuilder/SortableFormBlock';
import PreviewMode from './formBuilder/PreviewMode';
import PushToRN3Modal from './modals/PushToRN3Modal';
import { panelStyles, buttonStyles, colors } from './formBuilder/styles';

import type { Field, FormField, FormBuilderViewProps } from '../types/formBuilder';

export default function FormBuilderPanel({
  selectedFields,
  onRemoveField,
  onGenerateJSON,
  onClearForm,
  onUploadJSON,
}: FormBuilderViewProps) {
  const { state, setSelectedTreeTable, setWebformName, updateTableProperties, addRootTableToTree, addChildTableToTree, removeTableFromTree } = useApp();
  const [showJSON, setShowJSON] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>(selectedFields);
  const [selectedFormField, setSelectedFormField] = useState<FormField | null>(null);
  const [editingTableProperties, setEditingTableProperties] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [blockOrderMap, setBlockOrderMap] = useState<Record<string, number[]>>({});
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [showPushModal, setShowPushModal] = useState(false);

  // Helper functions
  const getSelectedTableFields = (): Field[] => {
    if (!state.selectedTreeTable || !state.selectedDataset) return [];
    const selectedDataset = state.datasets.find((d: any) => d.id === state.selectedDataset);
    if (!selectedDataset) return [];
    const selectedTable = selectedDataset.tables.find((t: any) => t.id === state.selectedTreeTable);
    return selectedTable?.fields || [];
  };

  const getAvailableFields = (): Field[] => {
    const allFields = getSelectedTableFields();
    const usedFieldIds = formFields
      .filter((f) => f.tableId === state.selectedTreeTable)
      .map((f) => f.id);
    return allFields.filter((field) => !usedFieldIds.includes(field.id));
  };

  const getCurrentTableFormFields = (): FormField[] => {
    return formFields.filter((f) => f.tableId === state.selectedTreeTable);
  };

  const getCurrentTableFieldsByBlocks = (): Record<number, FormField[]> => {
    const blocks: Record<number, FormField[]> = {};
    getCurrentTableFormFields().forEach((field) => {
      if (!blocks[field.blockId]) {
        blocks[field.blockId] = [];
      }
      blocks[field.blockId].push(field);
    });
    return blocks;
  };

  const getNextBlockId = (): number => {
    const blockIds = getCurrentTableFormFields().map((f) => f.blockId);
    return blockIds.length === 0 ? 1 : Math.max(...blockIds) + 1;
  };

  const getChildTables = () => {
    if (state.treeStructure.length === 0) return [];
    if (state.hasRootTable) {
      const rootNode = state.treeStructure[0];
      return rootNode.children || [];
    }
    return state.treeStructure;
  };

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

  const availableFields = getAvailableFields();
  const currentTableFormFields = getCurrentTableFormFields();

  // Sync form fields with selected fields prop
  useEffect(() => {
    setFormFields(selectedFields);
  }, [selectedFields]);

  // Initialize and update tab order
  useEffect(() => {
    const childTables = getChildTables();
    const childTableIds = childTables.map((t: any) => t.tableId);

    // Only update if the child tables have actually changed
    if (childTableIds.length > 0) {
      const tabOrderSet = new Set(tabOrder);
      const childTableSet = new Set(childTableIds);

      // Check if they're different
      const needsUpdate =
        childTableIds.length !== tabOrder.length ||
        childTableIds.some(id => !tabOrderSet.has(id)) ||
        tabOrder.some(id => !childTableSet.has(id));

      if (needsUpdate) {
        // Preserve existing order where possible, add new tables at the end
        const newOrder = [...tabOrder.filter(id => childTableSet.has(id))];
        const newTables = childTableIds.filter(id => !tabOrderSet.has(id));
        setTabOrder([...newOrder, ...newTables]);
      }
    } else if (tabOrder.length > 0) {
      // No child tables, clear tab order
      setTabOrder([]);
    }
  }, [state.treeStructure, state.hasRootTable]);

  // Fix existing fields without blockId
  useEffect(() => {
    setFormFields((prev) =>
      prev.map((field) =>
        field.blockId === undefined || field.blockId === null
          ? { ...field, blockId: 1 }
          : field
      )
    );
  }, []);

  // Clear selected field when tree table selection changes
  useEffect(() => {
    if (selectedFormField && selectedFormField.tableId !== state.selectedTreeTable) {
      setSelectedFormField(null);
    }
  }, [state.selectedTreeTable, selectedFormField]);

  // Keep blockOrderMap in sync with actual blocks
  useEffect(() => {
    if (!state.selectedTreeTable) return;

    const tableKey = state.selectedTreeTable;
    const fieldsByBlocks = getCurrentTableFieldsByBlocks();
    const actualBlockIds = Object.keys(fieldsByBlocks).map(Number).sort((a, b) => a - b);

    setBlockOrderMap((prev) => {
      const currentOrder = prev[tableKey] || [];
      const newBlocks = actualBlockIds.filter((id) => !currentOrder.includes(id));

      if (newBlocks.length > 0) {
        return { ...prev, [tableKey]: [...currentOrder, ...newBlocks] };
      }

      const validOrder = currentOrder.filter((id) => actualBlockIds.includes(id));
      if (validOrder.length !== currentOrder.length) {
        return { ...prev, [tableKey]: validOrder };
      }

      return prev;
    });
  }, [formFields, state.selectedTreeTable]);

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

  const handleRemoveField = (formId: string) => {
    setFormFields((prev) => prev.filter((f) => f.formId !== formId));
    onRemoveField(formId);
    if (selectedFormField?.formId === formId) {
      setSelectedFormField(null);
    }
  };

  const handleUpdateFieldProperty = (formId: string, property: string, value: any) => {
    setFormFields((prev) =>
      prev.map((field) => (field.formId === formId ? { ...field, [property]: value } : field))
    );

    if (selectedFormField?.formId === formId) {
      setSelectedFormField((prev) => (prev ? { ...prev, [property]: value } : null));
    }
  };

  const handleAddBlock = () => {
    // Placeholder for adding empty blocks
  };

  const handleRemoveBlock = (blockId: number) => {
    // Placeholder for removing empty blocks
  };

  const selectedTableName = (() => {
    if (!state.selectedTreeTable || !state.selectedDataset) return '';
    const selectedDataset = state.datasets.find((d: any) => d.id === state.selectedDataset);
    const selectedTable = selectedDataset?.tables.find((t: any) => t.id === state.selectedTreeTable);
    return selectedTable?.name || '';
  })();

  const totalFields = getSelectedTableFields().length;

  // Action handlers
  const handleDownloadJSON = () => {
    const jsonData = generateJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = state.webformName
      ? `${state.webformName.replace(/[^a-z0-9_-]/gi, '_')}.json`
      : 'form-config.json';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePushToRN3 = () => {
    // Check if we have a connection and selected dataset
    if (!state.connection) {
      alert('Please connect to ReportNet first using the Connection modal.');
      return;
    }
    if (!state.selectedDataset) {
      alert('Please select a dataset first.');
      return;
    }
    setShowPushModal(true);
  };

  const handlePushConfirm = async (fileName: string, type: 'TABLES' | 'ENTITIES' | 'PAMS' | 'Q&A', uploadedFile?: File) => {
    if (!state.connection || !state.selectedDataset) {
      alert('Connection or dataset not available.');
      return;
    }

    try {
      let jsonContent: string;

      // If user uploaded a file, use that; otherwise use generated JSON
      if (uploadedFile) {
        jsonContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const text = e.target?.result as string;
              // Validate it's valid JSON
              JSON.parse(text);
              resolve(text);
            } catch (error) {
              reject(new Error('Invalid JSON file'));
            }
          };
          reader.onerror = () => reject(new Error('Error reading file'));
          reader.readAsText(uploadedFile);
        });
      } else {
        // Generate JSON from current form
        jsonContent = generateJSON();
      }

      const result = await uploadWebformToRN3({
        connection: state.connection,
        datasetId: state.selectedDataset,
        jsonContent,
        fileName,
        type
      });

      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert(`Error uploading to ReportNet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Push to RN3 error:', error);
    }
  };

  const handleUploadJSON = (jsonData: any) => {
    try {
      const result = importFormJSON(jsonData, state.datasets, state.selectedDataset);

      if (result.webformName) {
        setWebformName(result.webformName);
      }

      // Clear existing state
      setFormFields([]);
      setSelectedFormField(null);

      // Reconstruct tree structure from JSON
      if (jsonData.tables && Array.isArray(jsonData.tables) && jsonData.tables.length > 0) {
        const selectedDatasetObj = state.datasets.find((d: any) => d.id === state.selectedDataset);

        // Clear existing tree (make a copy to avoid mutation during iteration)
        const existingNodes = [...state.treeStructure];
        existingNodes.forEach((node: any) => {
          removeTableFromTree(node.id);
        });

        // Build tree structure from JSON tables
        // First table is the root table (if overview exists, it's a root table structure)
        const hasOverview = jsonData.overview && Array.isArray(jsonData.overview) && jsonData.overview.length > 0;

        jsonData.tables.forEach((table: any, index: number) => {
          const tableData = selectedDatasetObj?.tables.find((t: any) => t.name === table.name);

          if (tableData) {
            if (index === 0 && hasOverview) {
              // First table with overview is the root table
              addRootTableToTree(tableData.id, table.label || table.name, table.title || table.name);
            } else {
              // All other tables are child tables/tabs
              addChildTableToTree(tableData.id, table.label || table.name, table.title || table.name);
            }
          }
        });
      }

      if (result.formFields.length > 0) {
        setFormFields(result.formFields);

        // Notify parent component to update its selectedFields state
        if (onUploadJSON) {
          onUploadJSON(result.formFields);
        }

        // Rebuild block order map for each table
        const newBlockOrderMap: Record<string, number[]> = {};
        const tableIds = [...new Set(result.formFields.map(f => f.tableId))];

        tableIds.forEach(tableId => {
          const tableFields = result.formFields.filter(f => f.tableId === tableId);
          const blockIds = [...new Set(tableFields.map(f => f.blockId))].sort((a, b) => a - b);
          newBlockOrderMap[tableId] = blockIds;
        });

        setBlockOrderMap(newBlockOrderMap);

        // Rebuild tab order from JSON tables (excluding root table if present)
        if (jsonData.tables && Array.isArray(jsonData.tables)) {
          const selectedDatasetObj = state.datasets.find((d: any) => d.id === state.selectedDataset);
          const hasOverview = jsonData.overview && Array.isArray(jsonData.overview) && jsonData.overview.length > 0;

          const tabTableIds = jsonData.tables
            .slice(hasOverview ? 1 : 0) // Skip first table if it's the root table
            .map((table: any) => {
              const tableData = selectedDatasetObj?.tables.find((t: any) => t.name === table.name);
              return tableData?.id;
            })
            .filter((id: string | undefined) => id !== undefined);

          if (tabTableIds.length > 0) {
            setTabOrder(tabTableIds as string[]);
          }
        }

        if (result.firstTableId) {
          setSelectedTreeTable(result.firstTableId);
        }
      } else {
        alert('No matching fields found in the current dataset. Please ensure you have the correct dataset selected.');
      }
    } catch (error) {
      alert('Error processing JSON file. Please check the file format and try again.');
      console.error('JSON upload error:', error);
    }
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

// Extracted sub-components below

function FieldsPanel({
  selectedTableName,
  availableFields,
  totalFields,
  currentTableFormFields,
  selectedTreeTable,
}: any) {
  return (
    <div style={panelStyles.container}>
      <div style={panelStyles.header}>
        <FaTable style={{ color: colors.primary }} />
        <h3 style={panelStyles.title}>Table Fields / Label</h3>
      </div>

      {selectedTreeTable ? (
        <>
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: colors.primaryLight,
              borderRadius: '4px',
              border: `1px solid ${colors.primary}`,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: colors.info }}>
              {selectedTableName}
            </div>
            <div style={{ fontSize: '0.8rem', color: colors.textDark }}>
              {availableFields.length} of {totalFields} fields available
            </div>
            {currentTableFormFields.length > 0 && (
              <div style={{ fontSize: '0.7rem', color: colors.success, marginTop: '0.25rem' }}>
                {currentTableFormFields.length} field{currentTableFormFields.length === 1 ? '' : 's'} in form
              </div>
            )}
          </div>

          <div>
            {availableFields.length > 0 ? (
              availableFields.map((field: Field) => <DraggableField key={field.id} field={field} />)
            ) : (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: colors.textMuted,
                  fontStyle: 'italic',
                }}
              >
                {totalFields > 0 ? 'All fields have been added to the form' : 'No fields available'}
              </div>
            )}
          </div>

          {/* Label Field - Always Available */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: `1px solid ${colors.grayBorder}`,
            }}
          >
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: colors.textMuted,
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}
            >
              Layout Elements
            </div>
            <DraggableField
              key="label-field"
              field={{
                id: 'label',
                name: 'Label',
                type: 'label',
                required: false,
              }}
            />
          </div>
        </>
      ) : (
        <EmptyFieldsPanel />
      )}
    </div>
  );
}

function EmptyFieldsPanel() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        textAlign: 'center',
        color: colors.textMuted,
      }}
    >
      <div>
        <FaTable style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ccc' }} />
        <p>Select a table from the treeview to see its fields</p>
      </div>
    </div>
  );
}

function FormBuilderHeader({
  showPreview,
  showJSON,
  onTogglePreview,
  onToggleJSON,
  onClearTable,
  onClearAll,
  currentTableFormFields,
  formFields,
}: any) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: `1px solid ${colors.grayBorder}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FaWpforms style={{ color: colors.secondary }} />
        <h2
          style={{
            margin: 0,
            fontSize: '1.1rem',
            color: colors.text,
            display: window.innerWidth > 768 ? 'block' : 'none',
          }}
        >
          Form Builder
        </h2>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', margin: '-0.3rem', padding: '0rem' }}>
        <button
          onClick={onTogglePreview}
          style={{
            ...buttonStyles.base,
            ...buttonStyles.primary,
            backgroundColor: showPreview ? colors.primaryDark : colors.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FaEye />
          {showPreview ? 'Edit Mode' : 'Preview'}
        </button>
        <button
          onClick={onToggleJSON}
          style={{
            ...buttonStyles.base,
            ...buttonStyles.secondary,
          }}
        >
          {showJSON ? 'Show Form' : 'JSON'}
        </button>
        <button
          onClick={onClearTable}
          style={{
            ...buttonStyles.base,
            ...(currentTableFormFields.length === 0 ? buttonStyles.disabled : buttonStyles.danger),
          }}
          disabled={currentTableFormFields.length === 0}
        >
          Clear Table
        </button>
        <button
          onClick={onClearAll}
          style={{
            ...buttonStyles.base,
            ...(formFields.length === 0 ? buttonStyles.disabled : buttonStyles.danger),
          }}
          disabled={formFields.length === 0}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

function JSONView({ jsonData }: { jsonData: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Generated JSON:</h3>
      </div>
      <pre
        style={{
          backgroundColor: '#282c34',
          color: '#abb2bf',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          margin: 0,
          flex: 1,
          whiteSpace: 'pre-wrap',
        }}
      >
        {jsonData}
      </pre>
    </div>
  );
}

function FormBuilderArea({
  selectedTreeTable,
  currentTableFormFields,
  selectedTableName,
  editingTableProperties,
  editTitle,
  editLabel,
  setEditTitle,
  setEditLabel,
  setEditingTableProperties,
  updateTableProperties,
  treeStructure,
  blockOrderMap,
  getCurrentTableFieldsByBlocks,
  handleRemoveField,
  handleRemoveBlock,
  handleAddBlock,
  selectedFormField,
  setSelectedFormField,
}: any) {
  if (!selectedTreeTable) {
    return (
      <DroppableFormArea elementCount={0}>
        <EmptyBuilderArea />
      </DroppableFormArea>
    );
  }

  if (currentTableFormFields.length === 0) {
    return (
      <DroppableFormArea elementCount={0}>
        <EmptyTableArea selectedTableName={selectedTableName} />
      </DroppableFormArea>
    );
  }

  return (
    <DroppableFormArea elementCount={currentTableFormFields.length}>
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: colors.text }}>
          {selectedTableName} Form
        </h3>
        <TablePropertiesEditor
          selectedTreeTable={selectedTreeTable}
          treeStructure={treeStructure}
          editingTableProperties={editingTableProperties}
          editTitle={editTitle}
          editLabel={editLabel}
          setEditTitle={setEditTitle}
          setEditLabel={setEditLabel}
          setEditingTableProperties={setEditingTableProperties}
          updateTableProperties={updateTableProperties}
        />
        <BlocksList
          selectedTreeTable={selectedTreeTable}
          blockOrderMap={blockOrderMap}
          getCurrentTableFieldsByBlocks={getCurrentTableFieldsByBlocks}
          handleRemoveField={handleRemoveField}
          handleRemoveBlock={handleRemoveBlock}
          handleAddBlock={handleAddBlock}
          selectedFormField={selectedFormField}
          setSelectedFormField={setSelectedFormField}
        />
      </div>
    </DroppableFormArea>
  );
}

function EmptyBuilderArea() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        color: colors.textMuted,
      }}
    >
      <div>
        <FaTable style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ccc' }} />
        <h3>Select a table to start building</h3>
        <p>Click on a table in the treeview to see its fields and start building your form</p>
      </div>
    </div>
  );
}

function EmptyTableArea({ selectedTableName }: { selectedTableName: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        color: colors.textMuted,
      }}
    >
      <div>
        <FaPlus style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ccc' }} />
        <h3>Drop fields here to build your form</h3>
        <p>
          Drag fields from the left panel for <strong>{selectedTableName}</strong>
        </p>
      </div>
    </div>
  );
}

function TablePropertiesEditor({
  selectedTreeTable,
  treeStructure,
  editingTableProperties,
  editTitle,
  editLabel,
  setEditTitle,
  setEditLabel,
  setEditingTableProperties,
  updateTableProperties,
}: any) {
  const findTableInTree = (nodes: any[]): any => {
    for (const node of nodes) {
      if (node.tableId === selectedTreeTable) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = findTableInTree(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const currentTableNode = findTableInTree(treeStructure);
  if (!currentTableNode) {
    return (
      <div
        style={{
          height: '1px',
          backgroundColor: colors.grayBorder,
          marginBottom: '1rem',
        }}
      />
    );
  }

  const handleStartEdit = () => {
    setEditTitle(currentTableNode.title);
    setEditLabel(currentTableNode.label);
    setEditingTableProperties(true);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editLabel.trim()) {
      updateTableProperties(selectedTreeTable, editLabel.trim(), editTitle.trim());
      setEditingTableProperties(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTableProperties(false);
    setEditTitle('');
    setEditLabel('');
  };

  return (
    <>
      <div
        style={{
          position: 'relative',
          height: '1px',
          backgroundColor: colors.grayBorder,
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '0',
            top: '0.5rem',
            transform: 'translateY(-50%)',
          }}
        >
          <FaEdit
            onClick={handleStartEdit}
            style={{
              color: colors.primary,
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.25rem',
              borderRadius: '3px',
              transition: 'all 0.2s ease',
              marginTop: '0.6rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f8ff';
              e.currentTarget.style.color = '#0066cc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.transparent;
              e.currentTarget.style.color = colors.primary;
            }}
            title="Edit table title and label"
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        {editingTableProperties ? (
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: colors.gray, display: 'block', marginBottom: '0.25rem' }}>
                Title:
              </strong>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${colors.grayBorder}`,
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                }}
                placeholder="Enter title"
              />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: colors.gray, display: 'block', marginBottom: '0.25rem' }}>
                Label:
              </strong>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${colors.grayBorder}`,
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                }}
                placeholder="Enter label"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || !editLabel.trim()}
                style={{
                  padding: '0.4rem 0.8rem',
                  backgroundColor:
                    !editTitle.trim() || !editLabel.trim() ? '#ccc' : colors.secondary,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '4px',
                  cursor:
                    !editTitle.trim() || !editLabel.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '0.4rem 0.8rem',
                  backgroundColor: '#6c757d',
                  color: colors.white,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: colors.gray }}>Title:</strong>
              <span style={{ marginLeft: '0.5rem', color: colors.text }}>
                {currentTableNode.title}
              </span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: colors.gray }}>Label:</strong>
              <span style={{ marginLeft: '0.5rem', color: colors.text }}>
                {currentTableNode.label}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function BlocksList({
  selectedTreeTable,
  blockOrderMap,
  getCurrentTableFieldsByBlocks,
  handleRemoveField,
  handleRemoveBlock,
  handleAddBlock,
  selectedFormField,
  setSelectedFormField,
}: any) {
  const fieldsByBlocks = getCurrentTableFieldsByBlocks();
  const defaultBlockIds = Object.keys(fieldsByBlocks).map(Number).sort((a, b) => a - b);
  const tableKey = selectedTreeTable || '';
  const blockIds = blockOrderMap[tableKey] || defaultBlockIds;

  if (blockIds.length === 0) {
    return (
      <FormBlock
        blockId={1}
        fields={[]}
        onRemoveField={handleRemoveField}
        onRemoveBlock={handleRemoveBlock}
        onAddBlock={handleAddBlock}
        selectedFormField={selectedFormField}
        onFieldClick={setSelectedFormField}
        isLastBlock={true}
      />
    );
  }

  return (
    <SortableContext
      items={blockIds.map((id: number) => `block-${id}`)}
      strategy={verticalListSortingStrategy}
    >
      {blockIds.map((blockId: number, index: number) => (
        <SortableFormBlock
          key={blockId}
          blockId={blockId}
          fields={fieldsByBlocks[blockId] || []}
          onRemoveField={handleRemoveField}
          onRemoveBlock={handleRemoveBlock}
          onAddBlock={handleAddBlock}
          selectedFormField={selectedFormField}
          onFieldClick={setSelectedFormField}
          isLastBlock={index === blockIds.length - 1}
        />
      ))}
    </SortableContext>
  );
}

function PropertiesPanel({
  selectedFormField,
  handleUpdateFieldProperty,
  handleDownloadJSON,
  handlePushToRN3,
  onGenerateJSON,
  handleUploadJSON,
}: any) {
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

function DragPreview({ field }: { field: Field }) {
  return (
    <div
      style={{
        padding: '0.5rem',
        backgroundColor: colors.white,
        border: `2px solid ${colors.primary}`,
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(44,62,76,0.15)',
        transform: 'rotate(5deg)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
      }}
    >
      <div style={{ color: colors.primary }}>{getFieldIcon(field.type)}</div>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: colors.textDark }}>
          {field.name}
        </div>
        <div style={{ fontSize: '0.8rem', color: colors.gray }}>{field.type}</div>
      </div>
    </div>
  );
}
