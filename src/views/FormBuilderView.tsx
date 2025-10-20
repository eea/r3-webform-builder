import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../context/AppContext';
import { FaGripVertical, FaTimes, FaPlus, FaTable, FaWpforms, FaCog, FaEdit, FaChevronLeft, FaChevronRight, FaEye, FaFont, FaEnvelope, FaPhone, FaHashtag, FaCalendarAlt, FaCaretDown, FaAlignLeft, FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ActionView from './ActionView';

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

// Get icon for field type
function getFieldIcon(fieldType: string) {
  const iconStyle = { fontSize: '1.1rem' };

  switch (fieldType) {
    case 'text':
      return <FaFont style={iconStyle} />;
    case 'email':
      return <FaEnvelope style={iconStyle} />;
    case 'tel':
      return <FaPhone style={iconStyle} />;
    case 'number':
      return <FaHashtag style={iconStyle} />;
    case 'date':
      return <FaCalendarAlt style={iconStyle} />;
    case 'select':
      return <FaCaretDown style={iconStyle} />;
    case 'textarea':
      return <FaAlignLeft style={iconStyle} />;
    case 'checkbox':
      return <FaCheck style={iconStyle} />;
    default:
      return <FaFont style={iconStyle} />;
  }
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
        border: '1px solid #DAE8F4',
        borderRadius: '4px',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 1px 3px rgba(44,62,76,0.1)',
        transition: 'all 0.2s ease'
      }}>
        <FaGripVertical style={{ color: '#4C677F', cursor: 'grab' }} />
        <div style={{ color: '#47B3FF', marginRight: '0.5rem' }}>
          {getFieldIcon(field.type)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#2E3E4C' }}>
            {field.name}
            {field.required && <span style={{ color: '#B83230', marginLeft: '0.25rem' }}>*</span>}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#4C677F' }}>
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
          border: `2px solid ${isSelected ? '#47B3FF' : '#DAE8F4'}`,
          borderRadius: '4px',
          marginBottom: '0.75rem',
          boxShadow: isSelected ? '0 2px 8px rgba(71,179,255,0.3)' : '0 1px 3px rgba(44,62,76,0.1)',
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
              style={{ color: '#4C677F', cursor: 'grab' }}
              onClick={(e) => e.stopPropagation()}
            />
            <div style={{ color: '#47B3FF', marginRight: '0.25rem' }}>
              {getFieldIcon(field.type)}
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              {field.name}
              {field.required && <span style={{ color: '#B83230', marginLeft: '0.25rem' }}>*</span>}
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
              color: '#B83230',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.25rem'
            }}
            title="Remove field"
          >
            <FaTimes />
          </button>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#4C677F' }}>
          Type: {field.type} | {field.required ? 'Required' : 'Optional'}
        </div>
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
        backgroundColor: isOver ? '#DAE8F4' : 'transparent',
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

// Render interactive field for preview mode
function renderInteractiveField(field: FormField) {
  const baseStyle = {
    width: '100%',
    maxWidth: '100%',
    padding: '0.75rem',
    border: '2px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const
  };

  const focusStyle = {
    borderColor: '#47B3FF',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(71,179,255,0.1)'
  };

  const title = field.customTitle || field.name;
  const placeholder = field.customPlaceholder || `Enter ${field.name.toLowerCase()}`;
  const isRequired = field.customRequired !== undefined ? field.customRequired : field.required;

  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      return (
        <input
          type={field.type}
          placeholder={placeholder}
          style={baseStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#dee2e6', boxShadow: 'none' })}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          placeholder={placeholder}
          style={baseStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#dee2e6', boxShadow: 'none' })}
        />
      );
    case 'date':
      return (
        <input
          type="date"
          style={baseStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#dee2e6', boxShadow: 'none' })}
        />
      );
    case 'select':
      return (
        <select
          style={baseStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#dee2e6', boxShadow: 'none' })}
        >
          <option value="">Select {field.name.toLowerCase()}</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
      );
    case 'textarea':
      return (
        <textarea
          placeholder={placeholder}
          rows={4}
          style={{ ...baseStyle, resize: 'vertical', minHeight: '100px', maxWidth: '100%' }}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#dee2e6', boxShadow: 'none' })}
        />
      );
    case 'checkbox':
      return (
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          padding: '0.5rem 0'
        }}>
          <input
            type="checkbox"
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: '#47B3FF'
            }}
          />
          <span style={{ fontSize: '1rem' }}>{title}</span>
        </label>
      );
    default:
      return (
        <input
          type="text"
          placeholder={placeholder}
          style={baseStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: '#dee2e6', boxShadow: 'none' })}
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
  const { state, setSelectedTreeTable } = useApp();
  const [showJSON, setShowJSON] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>(selectedFields);
  const [selectedFormField, setSelectedFormField] = useState<FormField | null>(null);
  const [isRootCollapsed, setIsRootCollapsed] = useState(false);
  const [activeChildTab, setActiveChildTab] = useState<string>('');

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

  // Get fields by table ID
  const getFieldsByTableId = (tableId: string): FormField[] => {
    return formFields.filter(f => f.tableId === tableId);
  };

  // Get child tables from tree structure
  const getChildTables = () => {
    if (!state.hasRootTable || state.treeStructure.length === 0) return [];
    const rootNode = state.treeStructure[0];
    return rootNode.children || [];
  };

  // Initialize active child tab
  useEffect(() => {
    const childTables = getChildTables();
    if (childTables.length > 0 && !activeChildTab) {
      setActiveChildTab(childTables[0].tableId);
    }
  }, [state.treeStructure, activeChildTab]);

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
    if (over.id === 'form-builder' && active.data.current && !active.data.current.formId) {
      const field = active.data.current as Field;
      const newFormField: FormField = {
        ...field,
        formId: Math.random().toString(36).substr(2, 9),
        tableId: state.selectedTreeTable || ''
      };
      setFormFields(prev => [...prev, newFormField]);
    }

    // Handle reordering existing fields
    if (active.id !== over.id) {
      const currentTableFields = getCurrentTableFormFields();
      const oldIndex = currentTableFields.findIndex(field => field.formId === active.id);
      const newIndex = currentTableFields.findIndex(field => field.formId === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedFields = arrayMove(currentTableFields, oldIndex, newIndex);

        // Update the main formFields array while preserving fields from other tables
        setFormFields(prev => {
          const otherTableFields = prev.filter(f => f.tableId !== state.selectedTreeTable);
          return [...otherTableFields, ...reorderedFields];
        });
      }
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

  // Action handlers for ActionView
  const handleDownloadJSON = () => {
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
  };

  const handlePushToRN3 = () => {
    // TODO: Implement Push to RN3 functionality
    alert('Push to RN3 functionality will be implemented soon!');
  };

  const handleUploadJSON = (jsonData: any) => {
    try {
      // Validate the JSON structure
      if (!jsonData || !jsonData.tables || !Array.isArray(jsonData.tables)) {
        alert('Invalid JSON format. Expected a form configuration with tables array.');
        return;
      }

      // Clear existing form state
      setFormFields([]);
      setSelectedFormField(null);

      // Process tables from JSON and restore form fields
      const restoredFields: FormField[] = [];
      let firstTableId: string | null = null;

      jsonData.tables.forEach((table: any, tableIndex: number) => {
        if (table.elements && Array.isArray(table.elements)) {
          table.elements.forEach((element: any, elementIndex: number) => {
            if (element.type === 'FIELD') {
              // Find the corresponding field in available datasets
              const selectedDataset = state.datasets.find(d => d.id === state.selectedDataset);
              const tableData = selectedDataset?.tables.find(t => t.name === table.name);
              const fieldData = tableData?.fields.find(f => f.name === element.name);

              if (fieldData && tableData) {
                // Set the first table ID we encounter
                if (firstTableId === null) {
                  firstTableId = tableData.id;
                }

                const formField: FormField = {
                  ...fieldData,
                  formId: `restored_${tableData.id}_${fieldData.id}_${Date.now()}_${elementIndex}`,
                  tableId: tableData.id,
                  customTitle: element.title || fieldData.name,
                  customTooltip: element.tooltip || fieldData.description,
                  customRequired: element.showRequiredCharacter ?? fieldData.required,
                  isPrimary: element.isPrimary || false
                };
                restoredFields.push(formField);
              }
            }
          });
        }
      });

      if (restoredFields.length > 0) {
        setFormFields(restoredFields);

        // Automatically select the first table that has restored fields
        if (firstTableId) {
          setSelectedTreeTable(firstTableId);
        }

        alert(`Successfully restored form with ${restoredFields.length} fields from JSON.`);
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
                backgroundColor: '#A0D7FF',
                borderRadius: '4px',
                border: '1px solid #47B3FF'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#003052' }}>
                  {selectedTableName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#2E3E4C' }}>
                  {availableFields.length} of {totalFields} fields available
                </div>
                {currentTableFormFields.length > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#007B6C', marginTop: '0.25rem' }}>
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
              <h2 style={{
                margin: 0,
                fontSize: '1.1rem',
                color: '#333',
                display: window.innerWidth > 768 ? 'block' : 'none'
              }}>
                Form Builder
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', margin:'-0.3rem', padding:'0rem' }}>
              <button
                onClick={() => {
                  setShowPreview(!showPreview);
                  if (showJSON) setShowJSON(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: showPreview ? '#0083E0' : '#47B3FF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FaEye />
                {showPreview ? 'Edit Mode' : 'Preview'}
              </button>
              <button
                onClick={() => {
                  setShowJSON(!showJSON);
                  if (!showJSON) {
                    onGenerateJSON();
                  }
                  if (showPreview) setShowPreview(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4C677F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {showJSON ? 'Show Form' : 'JSON'}
              </button>
              <button
                onClick={() => {
                  // Only clear fields from the current table
                  setFormFields(prev => prev.filter(f => f.tableId !== state.selectedTreeTable));
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentTableFormFields.length === 0 ? '#FFEDD8' : '#E56B38',
                  color: currentTableFormFields.length === 0 ? '#8B5E34' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentTableFormFields.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  opacity: currentTableFormFields.length === 0 ? 0.6 : 1
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
                  backgroundColor: formFields.length === 0 ? '#FFEDD8' : '#E56B38',
                  color: formFields.length === 0 ? '#8B5E34' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: formFields.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  opacity: formFields.length === 0 ? 0.6 : 1
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
                marginBottom: '1rem'
              }}>
                <h3 style={{ margin: 0 }}>Generated JSON:</h3>
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
          ) : showPreview ? (
            /* Full Form Preview Mode */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{ margin: 0, color: '#50B0A4' }}>Full Form Preview</h3>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#4C677F',
                  fontStyle: 'italic'
                }}>
                  Complete form with all tables
                </div>
              </div>

              {state.treeStructure.length === 0 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  color: '#4C677F'
                }}>
                  <div>
                    <FaEye style={{ fontSize: '2rem', marginBottom: '1rem', color: '#87A7C3' }} />
                    <h3>No form structure defined</h3>
                    <p>Add tables to the tree structure to see the full form preview</p>
                  </div>
                </div>
              ) : (
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  border: '1px solid #DAE8F4',
                  boxShadow: '0 2px 8px rgba(44,62,76,0.1)',
                  overflow: 'auto'
                }}>
                  {/* Form Header */}
                  <div style={{
                    marginBottom: '2rem',
                    paddingBottom: '1rem',
                    borderBottom: '2px solid #DAE8F4'
                  }}>
                    <h2 style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      color: '#2E3E4C',
                      fontWeight: 'bold'
                    }}>
                      {state.hasRootTable ? 'Complete Form' : 'Data Collection Form'}
                    </h2>
                    <p style={{
                      margin: '0.5rem 0 0 0',
                      color: '#4C677F',
                      fontSize: '1rem'
                    }}>
                      Please fill out all required information
                    </p>
                  </div>

                  <form style={{ maxWidth: '700px' }}>
                    {/* Root Table Section */}
                    {state.hasRootTable && state.treeStructure.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <div
                          onClick={() => setIsRootCollapsed(!isRootCollapsed)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                            padding: '1rem',
                            backgroundColor: '#A0D7FF',
                            borderRadius: '8px',
                            border: '1px solid #47B3FF',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <h3 style={{
                            margin: 0,
                            fontSize: '1.2rem',
                            color: '#003052',
                            fontWeight: 'bold'
                          }}>
                            {state.treeStructure[0].title}
                          </h3>
                          <div style={{
                            color: '#003052',
                            fontSize: '1.2rem',
                            transition: 'transform 0.2s ease',
                            transform: isRootCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'
                          }}>
                            <FaChevronDown />
                          </div>
                        </div>

                        {!isRootCollapsed && (
                          <div style={{
                            padding: '1rem',
                            backgroundColor: '#DAE8F4',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                          }}>
                            {getFieldsByTableId(state.treeStructure[0].tableId).map((field) => {
                              const title = field.customTitle || field.name;
                              const isRequired = field.customRequired !== undefined ? field.customRequired : field.required;
                              const tooltip = field.customTooltip;

                              return (
                                <div key={field.formId} style={{
                                  marginBottom: '1.5rem',
                                  padding: field.isPrimary ? '1rem' : '0',
                                  backgroundColor: field.isPrimary ? 'white' : 'transparent',
                                  border: field.isPrimary ? '2px solid #47B3FF' : 'none',
                                  borderRadius: field.isPrimary ? '6px' : '0'
                                }}>
                                  <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '1rem',
                                    fontWeight: field.isPrimary ? 'bold' : '600',
                                    color: field.isPrimary ? '#003052' : '#2E3E4C'
                                  }}>
                                    {title}
                                    {isRequired && (
                                      <span style={{ color: '#B83230', marginLeft: '0.25rem' }}>*</span>
                                    )}
                                    {field.isPrimary && (
                                      <span style={{
                                        marginLeft: '0.5rem',
                                        fontSize: '0.8rem',
                                        backgroundColor: '#47B3FF',
                                        color: 'white',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '12px'
                                      }}>
                                        Primary
                                      </span>
                                    )}
                                  </label>

                                  {tooltip && (
                                    <div style={{
                                      marginBottom: '0.5rem',
                                      fontSize: '0.9rem',
                                      color: '#4C677F',
                                      fontStyle: 'italic'
                                    }}>
                                      {tooltip}
                                    </div>
                                  )}

                                  {field.type !== 'checkbox' ? renderInteractiveField(field) : (
                                    <div style={{ marginTop: '0.5rem' }}>
                                      {renderInteractiveField(field)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Child Tables - Tab System */}
                    {getChildTables().length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{
                          margin: '0 0 1rem 0',
                          fontSize: '1.2rem',
                          color: '#2E3E4C',
                          fontWeight: 'bold'
                        }}>
                          Additional Information
                        </h3>

                        {/* Tab Headers */}
                        <div style={{
                          display: 'flex',
                          borderBottom: '2px solid #DAE8F4',
                          marginBottom: '1rem'
                        }}>
                          {getChildTables().map((childTable) => (
                            <button
                              key={childTable.tableId}
                              type="button"
                              onClick={() => setActiveChildTab(childTable.tableId)}
                              style={{
                                padding: '1rem 1.5rem',
                                backgroundColor: activeChildTab === childTable.tableId ? '#47B3FF' : 'transparent',
                                color: activeChildTab === childTable.tableId ? 'white' : '#4C677F',
                                border: 'none',
                                borderBottom: activeChildTab === childTable.tableId ? '3px solid #003052' : '3px solid transparent',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: activeChildTab === childTable.tableId ? 'bold' : 'normal',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {childTable.title}
                            </button>
                          ))}
                        </div>

                        {/* Active Tab Content */}
                        {activeChildTab && (
                          <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#EFEBF2',
                            borderRadius: '8px',
                            border: '1px solid #BEADCE'
                          }}>
                            {getFieldsByTableId(activeChildTab).length === 0 ? (
                              <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#4C677F'
                              }}>
                                <FaPlus style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                                <p>No fields added to this table yet</p>
                              </div>
                            ) : (
                              getFieldsByTableId(activeChildTab).map((field) => {
                                const title = field.customTitle || field.name;
                                const isRequired = field.customRequired !== undefined ? field.customRequired : field.required;
                                const tooltip = field.customTooltip;

                                return (
                                  <div key={field.formId} style={{
                                    marginBottom: '1.5rem',
                                    padding: field.isPrimary ? '1rem' : '0',
                                    backgroundColor: field.isPrimary ? 'white' : 'transparent',
                                    border: field.isPrimary ? '2px solid #9E84B6' : 'none',
                                    borderRadius: field.isPrimary ? '6px' : '0'
                                  }}>
                                    <label style={{
                                      display: 'block',
                                      marginBottom: '0.5rem',
                                      fontSize: '1rem',
                                      fontWeight: field.isPrimary ? 'bold' : '600',
                                      color: field.isPrimary ? '#5C3285' : '#2E3E4C'
                                    }}>
                                      {title}
                                      {isRequired && (
                                        <span style={{ color: '#B83230', marginLeft: '0.25rem' }}>*</span>
                                      )}
                                      {field.isPrimary && (
                                        <span style={{
                                          marginLeft: '0.5rem',
                                          fontSize: '0.8rem',
                                          backgroundColor: '#9E84B6',
                                          color: 'white',
                                          padding: '0.2rem 0.5rem',
                                          borderRadius: '12px'
                                        }}>
                                          Primary
                                        </span>
                                      )}
                                    </label>

                                    {tooltip && (
                                      <div style={{
                                        marginBottom: '0.5rem',
                                        fontSize: '0.9rem',
                                        color: '#4C677F',
                                        fontStyle: 'italic'
                                      }}>
                                        {tooltip}
                                      </div>
                                    )}

                                    {field.type !== 'checkbox' ? renderInteractiveField(field) : (
                                      <div style={{ marginTop: '0.5rem' }}>
                                        {renderInteractiveField(field)}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </form>
                </div>
              )}
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
          borderLeft: '1px solid #DAE8F4',
          padding: '1.5rem',
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
            <div style={{ paddingRight: '1.5rem' }}>
              {/* Field Info */}
              <div style={{
                marginBottom: '1.5rem',
                padding: '0.5rem',
                backgroundColor: '#DAE8F4',
                borderRadius: '4px',
                border: '1px solid #87A7C3',
                marginRight:'-1rem'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  {selectedFormField.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#4C677F' }}>
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
                    border: '1px solid #87A7C3',
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
                    border: '1px solid #87A7C3',
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
                <div style={{ fontSize: '0.8rem', color: '#4C677F', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
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
                  backgroundColor: '#4C677F',
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

          {/* Action View - Always visible */}
          <ActionView
            onDownloadJSON={handleDownloadJSON}
            onPushToRN3={handlePushToRN3}
            onGenerateJSON={onGenerateJSON}
            onUploadJSON={handleUploadJSON}
          />
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
            boxShadow: '0 4px 12px rgba(44,62,76,0.15)',
            transform: 'rotate(5deg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ color: '#47B3FF' }}>
              {getFieldIcon(activeField.type)}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#2E3E4C' }}>
                {activeField.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4C677F' }}>
                {activeField.type}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}