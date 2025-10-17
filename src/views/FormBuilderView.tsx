import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../context/AppContext';
import { FaGripVertical, FaTimes, FaPlus, FaTable, FaWpforms, FaCog, FaEdit } from 'react-icons/fa';

interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface FormField extends Field {
  formId: string;
  tableId: string;
  customTitle?: string;
  customTooltip?: string;
  customPlaceholder?: string;
  customRequired?: boolean;
  isPrimary?: boolean;
}

interface FormBuilderViewProps {
  selectedFields: FormField[];
  onRemoveField: (formId: string) => void;
  onGenerateJSON: () => void;
  onClearForm: () => void;
}

// Draggable Field Component
function DraggableField({ field }: { field: Field }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: field.id,
    data: field,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab'
      }}
      className="draggable-field"
    >
      <div style={{
        padding: '0.75rem',
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease'
      }}>
        <FaGripVertical style={{ color: '#6c757d', cursor: 'grab' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>
            {field.name}
            {field.required && <span style={{ color: 'red', marginLeft: '0.25rem' }}>*</span>}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            {field.type}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sortable Form Field Component
function SortableFormField({
  field,
  onRemove,
  isSelected,
  onClick
}: {
  field: FormField;
  onRemove: (formId: string) => void;
  isSelected: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.formId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        onClick={onClick}
        style={{
          padding: '1rem',
          backgroundColor: 'white',
          border: `2px solid ${isSelected ? '#47B3FF' : '#dee2e6'}`,
          borderRadius: '4px',
          marginBottom: '0.75rem',
          boxShadow: isSelected ? '0 2px 8px rgba(71,179,255,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaGripVertical
              {...attributes}
              {...listeners}
              style={{ color: '#6c757d', cursor: 'grab' }}
              onClick={(e) => e.stopPropagation()}
            />
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              {field.name}
              {field.required && <span style={{ color: 'red', marginLeft: '0.25rem' }}>*</span>}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(field.formId);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.25rem'
            }}
            title="Remove field"
          >
            <FaTimes />
          </button>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
          Type: {field.type} | {field.required ? 'Required' : 'Optional'}
        </div>
        {renderFieldPreview(field)}
      </div>
    </div>
  );
}

// Droppable Form Area
function DroppableFormArea({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'form-builder',
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: '400px',
        padding: '1rem',
        backgroundColor: isOver ? '#f8f9fa' : 'transparent',
        border: isOver ? '2px dashed #47B3FF' : '2px dashed transparent',
        borderRadius: '8px',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </div>
  );
}

// Render field preview
function renderFieldPreview(field: FormField) {
  const baseStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.9rem'
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <input
          type={field.type}
          placeholder={`Enter ${field.name.toLowerCase()}`}
          style={baseStyle}
          disabled
        />
      );
    case 'number':
      return (
        <input
          type="number"
          placeholder={`Enter ${field.name.toLowerCase()}`}
          style={baseStyle}
          disabled
        />
      );
    case 'date':
      return <input type="date" style={baseStyle} disabled />;
    case 'select':
      return (
        <select style={baseStyle} disabled>
          <option>Select {field.name.toLowerCase()}</option>
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
      );
    case 'textarea':
      return (
        <textarea
          placeholder={`Enter ${field.name.toLowerCase()}`}
          rows={3}
          style={{ ...baseStyle, resize: 'vertical' }}
          disabled
        />
      );
    case 'checkbox':
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" disabled />
          <span>{field.name}</span>
        </label>
      );
    default:
      return (
        <input
          type="text"
          placeholder={`Enter ${field.name.toLowerCase()}`}
          style={baseStyle}
          disabled
        />
      );
  }
}

export default function FormBuilderPanel({
  selectedFields,
  onRemoveField,
  onGenerateJSON,
  onClearForm
}: FormBuilderViewProps) {
  const { state } = useApp();
  const [showJSON, setShowJSON] = useState(false);
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>(selectedFields);
  const [selectedFormField, setSelectedFormField] = useState<FormField | null>(null);

  // Get the selected table's fields
  const getSelectedTableFields = (): Field[] => {
    if (!state.selectedTreeTable || !state.selectedDataset) return [];

    const selectedDataset = state.datasets.find(d => d.id === state.selectedDataset);
    if (!selectedDataset) return [];

    const selectedTable = selectedDataset.tables.find(t => t.id === state.selectedTreeTable);
    return selectedTable?.fields || [];
  };

  // Get available fields (excluding those already in the form for current table)
  const getAvailableFields = (): Field[] => {
    const allFields = getSelectedTableFields();
    const usedFieldIds = formFields
      .filter(f => f.tableId === state.selectedTreeTable)
      .map(f => f.id);
    return allFields.filter(field => !usedFieldIds.includes(field.id));
  };

  const availableFields = getAvailableFields();

  // Get form fields for the currently selected table only
  const getCurrentTableFormFields = (): FormField[] => {
    return formFields.filter(f => f.tableId === state.selectedTreeTable);
  };

  const currentTableFormFields = getCurrentTableFormFields();

  // Clear selected field when the tree table selection changes
  useEffect(() => {
    // If there's a selected field and it's not from the currently selected table, clear it
    if (selectedFormField && selectedFormField.tableId !== state.selectedTreeTable) {
      setSelectedFormField(null);
    }
  }, [state.selectedTreeTable, selectedFormField]);

  const handleDragStart = (event: DragStartEvent) => {
    const field = event.active.data.current as Field;
    setActiveField(field);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveField(null);
      return;
    }

    // Handle dropping field from left panel to form
    if (over.id === 'form-builder' && active.data.current) {
      const field = active.data.current as Field;
      const newFormField: FormField = {
        ...field,
        formId: Math.random().toString(36).substr(2, 9),
        tableId: state.selectedTreeTable || ''
      };
      setFormFields(prev => [...prev, newFormField]);
    }

    setActiveField(null);
  };

  const generateFormJSON = () => {
    // Generate overview section showing the hierarchy
    const overview: any[] = [];

    // Find root table and its fields for overview
    let rootTableFields: FormField[] = [];

    if (state.hasRootTable && state.treeStructure.length > 0) {
      const rootNode = state.treeStructure[0];
      rootTableFields = formFields.filter(f => f.tableId === rootNode.tableId);

      // Add root table fields to overview
      rootTableFields.forEach(field => {
        overview.push({
          field: field.name,
          type: "FIELD",
          header: field.name
        });
      });

      // Add child table references to overview
      rootNode.children.forEach((child: any) => {
        overview.push({
          field: child.label,
          type: "TABLE",
          header: child.title
        });
      });
    } else {
      // If no root table, just show all fields from current selection
      const currentTableFields = formFields.filter(f => f.tableId === state.selectedTreeTable);
      currentTableFields.forEach(field => {
        overview.push({
          field: field.name,
          type: "FIELD",
          header: field.name
        });
      });
    }

    // Generate tables section
    const tables: any[] = [];

    // Group fields by table
    const fieldsByTable = new Map<string, FormField[]>();
    formFields.forEach(field => {
      if (!fieldsByTable.has(field.tableId)) {
        fieldsByTable.set(field.tableId, []);
      }
      fieldsByTable.get(field.tableId)!.push(field);
    });

    // Process each table that has fields
    const processedTables = new Set<string>();

    if (state.treeStructure.length > 0) {
      const processNode = (node: any, isRootTable: boolean = false) => {
        if (!processedTables.has(node.tableId)) {
          const selectedDataset = state.datasets.find(d => d.id === state.selectedDataset);
          const tableData = selectedDataset?.tables.find(t => t.id === node.tableId);
          const nodeFields = fieldsByTable.get(node.tableId) || [];

          if (nodeFields.length > 0) {
            const tableEntry = {
              name: tableData?.name || node.tableId,
              label: node.label,
              title: node.title,
              multipleRecords: false,
              isVisible: !isRootTable,
              ...(isRootTable && { isRootTable: true }),
              elements: nodeFields.map(field => ({
                type: "FIELD",
                name: field.name,
                title: "",
                tooltip: "",
                isPrimary: false,
                showRequiredCharacter: field.required
              }))
            };

            tables.push(tableEntry);
            processedTables.add(node.tableId);
          }
        }

        // Process children
        node.children.forEach((child: any) => processNode(child, false));
      };

      // Process tree structure
      state.treeStructure.forEach((rootNode, index) => {
        if (state.hasRootTable && index === 0) {
          processNode(rootNode, true);
        } else {
          processNode(rootNode, false);
        }
      });
    }

    const formStructure = {
      overview,
      tables,
      hideTabularData: false
    };

    return JSON.stringify(formStructure, null, 2);
  };

  const handleRemoveField = (formId: string) => {
    setFormFields(prev => prev.filter(f => f.formId !== formId));
    onRemoveField(formId);
    // Clear selection if the removed field was selected
    if (selectedFormField?.formId === formId) {
      setSelectedFormField(null);
    }
    // Note: availableFields will automatically update due to the filter in getAvailableFields
  };

  const handleUpdateFieldProperty = (formId: string, property: string, value: any) => {
    setFormFields(prev => prev.map(field =>
      field.formId === formId
        ? { ...field, [property]: value }
        : field
    ));

    // Update the selected field if it's the one being edited
    if (selectedFormField?.formId === formId) {
      setSelectedFormField(prev => prev ? { ...prev, [property]: value } : null);
    }
  };

  const selectedTableName = (() => {
    if (!state.selectedTreeTable || !state.selectedDataset) return '';
    const selectedDataset = state.datasets.find(d => d.id === state.selectedDataset);
    const selectedTable = selectedDataset?.tables.find(t => t.id === state.selectedTreeTable);
    return selectedTable?.name || '';
  })();

  const totalFields = getSelectedTableFields().length;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{
        flex: 1,
        height: '100%',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Column 1: Table Fields */}
        <div style={{
          width: '300px',
          backgroundColor: 'white',
          borderRight: '1px solid #dee2e6',
          padding: '1rem',
          overflow: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #dee2e6'
          }}>
            <FaTable style={{ color: '#47B3FF' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>
              Table Fields
            </h3>
          </div>

          {state.selectedTreeTable ? (
            <>
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                border: '1px solid #bbdefb'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1976d2' }}>
                  {selectedTableName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {availableFields.length} of {totalFields} fields available
                </div>
                {currentTableFormFields.length > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#289588', marginTop: '0.25rem' }}>
                    {currentTableFormFields.length} field{currentTableFormFields.length === 1 ? '' : 's'} in form
                  </div>
                )}
              </div>

              <div>
                {availableFields.length > 0 ? (
                  availableFields.map((field) => (
                    <DraggableField key={field.id} field={field} />
                  ))
                ) : (
                  <div style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    {totalFields > 0
                      ? 'All fields have been added to the form'
                      : 'No fields available'
                    }
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div>
                <FaTable style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ccc' }} />
                <p>Select a table from the treeview to see its fields</p>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Form Builder */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
          overflow: 'auto'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaWpforms style={{ color: '#289588' }} />
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>
                Form Builder
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', margin:'-0.3rem', padding:'0rem' }}>
              <button
                onClick={() => {
                  setShowJSON(!showJSON);
                  if (!showJSON) {
                    onGenerateJSON();
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {showJSON ? 'Show Form' : 'Show JSON'}
              </button>
              <button
                onClick={() => {
                  // Only clear fields from the current table
                  setFormFields(prev => prev.filter(f => f.tableId !== state.selectedTreeTable));
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#E56B38',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                disabled={currentTableFormFields.length === 0}
              >
                Clear Table
              </button>
              <button
                onClick={() => {
                  setFormFields([]);
                  onClearForm();
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#E56B38',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                disabled={formFields.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Content Area */}
          {showJSON ? (
            /* JSON View */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{ margin: 0 }}>Generated JSON:</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      const jsonData = generateFormJSON();
                      const blob = new Blob([jsonData], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'form-config.json';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Download JSON
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement Push to RN3 functionality
                      alert('Push to RN3 functionality will be implemented soon!');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Push to RN3
                  </button>
                </div>
              </div>
              <pre style={{
                backgroundColor: '#282c34',
                color: '#abb2bf',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                margin: 0,
                flex: 1,
                whiteSpace: 'pre-wrap'
              }}>
                {generateFormJSON()}
              </pre>
            </div>
          ) : (
            /* Form Builder Area */
            <DroppableFormArea>
              {!state.selectedTreeTable ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <div>
                    <FaTable style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ccc' }} />
                    <h3>Select a table to start building</h3>
                    <p>Click on a table in the treeview to see its fields and start building your form</p>
                  </div>
                </div>
              ) : currentTableFormFields.length === 0 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <div>
                    <FaPlus style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ccc' }} />
                    <h3>Drop fields here to build your form</h3>
                    <p>Drag fields from the left panel for <strong>{selectedTableName}</strong></p>
                  </div>
                </div>
              ) : (
                <SortableContext items={currentTableFormFields.map(f => f.formId)} strategy={verticalListSortingStrategy}>
                  <div>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>
                      {selectedTableName} Form ({currentTableFormFields.length} fields)
                    </h3>
                    {currentTableFormFields.map((field) => (
                      <SortableFormField
                        key={field.formId}
                        field={field}
                        onRemove={handleRemoveField}
                        isSelected={selectedFormField?.formId === field.formId}
                        onClick={() => setSelectedFormField(field)}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </DroppableFormArea>
          )}
        </div>

        {/* Column 3: Properties Panel */}
        <div style={{
          width: '300px',
          backgroundColor: 'white',
          borderLeft: '1px solid #dee2e6',
          padding: '1rem',
          overflow: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #dee2e6'
          }}>
            <FaCog style={{ color: '#6c757d' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>
              Field Properties
            </h3>
          </div>

          {selectedFormField ? (
            <div>
              {/* Field Info */}
              <div style={{
                marginBottom: '1.5rem',
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  {selectedFormField.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  Type: {selectedFormField.type}
                </div>
              </div>

              {/* Custom Title */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  <FaEdit style={{ marginRight: '0.5rem', color: '#47B3FF' }} />
                  Display Title
                </label>
                <input
                  type="text"
                  value={selectedFormField.customTitle || selectedFormField.name}
                  onChange={(e) => handleUpdateFieldProperty(selectedFormField.formId, 'customTitle', e.target.value)}
                  placeholder={selectedFormField.name}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Custom Tooltip */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Tooltip / Help Text
                </label>
                <textarea
                  value={selectedFormField.customTooltip || ''}
                  onChange={(e) => handleUpdateFieldProperty(selectedFormField.formId, 'customTooltip', e.target.value)}
                  placeholder="Enter helpful text for users..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Custom Placeholder */}
              {['text', 'email', 'tel', 'number', 'textarea'].includes(selectedFormField.type) && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={selectedFormField.customPlaceholder || ''}
                    onChange={(e) => handleUpdateFieldProperty(selectedFormField.formId, 'customPlaceholder', e.target.value)}
                    placeholder={`Enter ${selectedFormField.name.toLowerCase()}`}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              )}

              {/* Required Toggle */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedFormField.customRequired !== undefined ? selectedFormField.customRequired : selectedFormField.required}
                    onChange={(e) => handleUpdateFieldProperty(selectedFormField.formId, 'customRequired', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Required Field
                </label>
              </div>

              {/* Primary Field Toggle */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedFormField.isPrimary || false}
                    onChange={(e) => handleUpdateFieldProperty(selectedFormField.formId, 'isPrimary', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Primary Field
                </label>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                  Primary fields are highlighted in the form
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  handleUpdateFieldProperty(selectedFormField.formId, 'customTitle', undefined);
                  handleUpdateFieldProperty(selectedFormField.formId, 'customTooltip', undefined);
                  handleUpdateFieldProperty(selectedFormField.formId, 'customPlaceholder', undefined);
                  handleUpdateFieldProperty(selectedFormField.formId, 'customRequired', undefined);
                  handleUpdateFieldProperty(selectedFormField.formId, 'isPrimary', false);
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  marginTop: '1rem'
                }}
              >
                Reset to Defaults
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div>
                <FaCog style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ccc' }} />
                <p>Select a field to edit its properties</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeField ? (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'white',
            border: '2px solid #47B3FF',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'rotate(5deg)'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              {activeField.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              {activeField.type}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}