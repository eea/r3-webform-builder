import { useState, useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useApp } from '../context/AppContext';
import { FaPlus, FaTable, FaWpforms, FaCog, FaChevronDown, FaEye, FaEdit } from 'react-icons/fa';
import { getFieldIcon } from '../utils/formBuilder/fieldIcons';
import { renderInteractiveField } from '../utils/formBuilder/fieldRenderers';
import { generateFormJSON, importFormJSON } from '../utils/formBuilder/jsonHandlers';
import ActionView from './ActionView';
import DraggableField from './formBuilder/DraggableField';
import SortableFormField from './formBuilder/SortableFormField';
import DroppableFormArea from './formBuilder/DroppableFormArea';
import PropertiesInspector from './formBuilder/PropertiesInspector';
import FormBlock from './formBuilder/FormBlock';
import SortableFormBlock from './formBuilder/SortableFormBlock';

import type { Field, FormField, FormBuilderViewProps } from '../types/formBuilder';



export default function FormBuilderPanel({
  selectedFields,
  onRemoveField,
  onGenerateJSON,
  onClearForm
}: FormBuilderViewProps) {
  const { state, setSelectedTreeTable, setWebformName, updateTableProperties } = useApp();
  const [showJSON, setShowJSON] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>(selectedFields);
  const [selectedFormField, setSelectedFormField] = useState<FormField | null>(null);
  const [isRootCollapsed, setIsRootCollapsed] = useState(false);
  const [activeChildTab, setActiveChildTab] = useState<string>('');
  const [editingTableProperties, setEditingTableProperties] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [blockOrderMap, setBlockOrderMap] = useState<Record<string, number[]>>({});

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

  // Group fields by blockId for the current table
  const getCurrentTableFieldsByBlocks = (): Record<number, FormField[]> => {
    const blocks: Record<number, FormField[]> = {};
    currentTableFormFields.forEach(field => {
      if (!blocks[field.blockId]) {
        blocks[field.blockId] = [];
      }
      blocks[field.blockId].push(field);
    });
    return blocks;
  };

  // Get next available block ID
  const getNextBlockId = (): number => {
    const blockIds = currentTableFormFields.map(f => f.blockId);
    return blockIds.length === 0 ? 1 : Math.max(...blockIds) + 1;
  };

  // Helper function to render fields grouped by blocks for preview
  const renderFieldsByBlocks = (fields: FormField[]) => {
    // Group fields by blockId
    const fieldsByBlock: Record<number, FormField[]> = {};
    fields.forEach(field => {
      const blockId = field.blockId || 1;
      if (!fieldsByBlock[blockId]) {
        fieldsByBlock[blockId] = [];
      }
      fieldsByBlock[blockId].push(field);
    });

    const sortedBlockIds = Object.keys(fieldsByBlock).map(Number).sort((a, b) => a - b);

    return sortedBlockIds.map(blockId => {
      const blockFields = fieldsByBlock[blockId];

      if (blockFields.length === 1) {
        // Single field - render normally
        const field = blockFields[0];
        const title = field.customTitle || field.name;
        const isRequired = field.customRequired !== undefined ? field.customRequired : field.required;
        const tooltip = field.customTooltip;

        return (
          <div key={field.formId} style={{
            marginBottom: '1rem',
            padding: field.isPrimary ? '0.75rem' : '0',
            backgroundColor: field.isPrimary ? 'white' : 'transparent',
            border: field.isPrimary ? '2px solid #9E84B6' : 'none',
            borderRadius: field.isPrimary ? '6px' : '0'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontSize: '0.9rem',
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
                  fontSize: '0.7rem',
                  backgroundColor: '#9E84B6',
                  color: 'white',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '10px'
                }}>
                  Primary
                </span>
              )}
            </label>

            {tooltip && (
              <div style={{
                marginBottom: '0.25rem',
                fontSize: '0.8rem',
                color: '#4C677F',
                fontStyle: 'italic'
              }}>
                {tooltip}
              </div>
            )}

            {field.type !== 'checkbox' ? renderInteractiveField(field) : (
              <div style={{ marginTop: '0.25rem' }}>
                {renderInteractiveField(field)}
              </div>
            )}
          </div>
        );
      } else {
        // Multiple fields - render as horizontal block (table row)
        const fieldCount = blockFields.length;
        // Calculate responsive sizes based on field count
        const getResponsiveStyles = (count: number) => {
          if (count === 2) return { gap: '0.75rem', minWidth: '180px' };
          if (count === 3) return { gap: '0.5rem', minWidth: '150px' };
          if (count >= 4) return { gap: '0.4rem', minWidth: '120px' };
          return { gap: '1rem', minWidth: '200px' };
        };

        const { gap, minWidth } = getResponsiveStyles(fieldCount);

        return (
          <div key={`block-${blockId}`} style={{
            display: 'flex',
            gap: gap,
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            {blockFields.map((field) => {
              const title = field.customTitle || field.name;
              const isRequired = field.customRequired !== undefined ? field.customRequired : field.required;
              const tooltip = field.customTooltip;

              return (
                <div key={field.formId} style={{
                  flex: '1 1 0',
                  minWidth: minWidth,
                  maxWidth: fieldCount >= 4 ? '200px' : 'none',
                  padding: field.isPrimary ? '0.5rem' : '0.25rem',
                  backgroundColor: field.isPrimary ? 'white' : 'transparent',
                  border: field.isPrimary ? '2px solid #9E84B6' : 'none',
                  borderRadius: field.isPrimary ? '4px' : '0'
                }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.25rem',
                    fontSize: fieldCount >= 4 ? '0.8rem' : '0.9rem',
                    fontWeight: field.isPrimary ? 'bold' : '600',
                    color: field.isPrimary ? '#5C3285' : '#2E3E4C',
                    lineHeight: '1.2'
                  }}>
                    {title}
                    {isRequired && (
                      <span style={{ color: '#B83230', marginLeft: '0.2rem' }}>*</span>
                    )}
                    {field.isPrimary && (
                      <span style={{
                        marginLeft: '0.3rem',
                        fontSize: fieldCount >= 4 ? '0.6rem' : '0.7rem',
                        backgroundColor: '#9E84B6',
                        color: 'white',
                        padding: '0.1rem 0.3rem',
                        borderRadius: '8px'
                      }}>
                        Primary
                      </span>
                    )}
                  </label>

                  {tooltip && (
                    <div style={{
                      marginBottom: '0.25rem',
                      fontSize: fieldCount >= 4 ? '0.7rem' : '0.8rem',
                      color: '#4C677F',
                      fontStyle: 'italic',
                      lineHeight: '1.2'
                    }}>
                      {tooltip}
                    </div>
                  )}

                  <div style={{
                    fontSize: fieldCount >= 4 ? '0.8rem' : '0.9rem'
                  }}>
                    {field.type !== 'checkbox' ? renderInteractiveField(field) : (
                      <div style={{ marginTop: '0.25rem' }}>
                        {renderInteractiveField(field)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
    });
  };

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

  // Get consistent icon for all child table tabs
  const getTableIcon = () => {
    return <FaTable />;
  };

  // Initialize active child tab
  useEffect(() => {
    const childTables = getChildTables();
    if (childTables.length > 0 && !activeChildTab) {
      setActiveChildTab(childTables[0].tableId);
    }
  }, [state.treeStructure, activeChildTab]);

  // Fix existing fields without blockId
  useEffect(() => {
    setFormFields(prev => prev.map(field =>
      field.blockId === undefined || field.blockId === null
        ? { ...field, blockId: 1 }
        : field
    ));
  }, []);

  // Clear selected field when the tree table selection changes
  useEffect(() => {
    // If there's a selected field and it's not from the currently selected table, clear it
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

    console.log('useEffect - actualBlockIds:', actualBlockIds);

    setBlockOrderMap(prev => {
      const currentOrder = prev[tableKey] || [];

      console.log('useEffect - currentOrder:', currentOrder);

      // Check if there are new blocks not in the current order
      const newBlocks = actualBlockIds.filter(id => !currentOrder.includes(id));

      if (newBlocks.length > 0) {
        console.log('useEffect - Adding new blocks:', newBlocks);
        // Add new blocks to the end of the order
        return { ...prev, [tableKey]: [...currentOrder, ...newBlocks] };
      }

      // Check if there are blocks in order that no longer exist
      const validOrder = currentOrder.filter(id => actualBlockIds.includes(id));

      if (validOrder.length !== currentOrder.length) {
        console.log('useEffect - Removing invalid blocks');
        // Remove blocks that no longer exist
        return { ...prev, [tableKey]: validOrder };
      }

      return prev;
    });
  }, [formFields, state.selectedTreeTable]);

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

    // Handle block reordering
    if (active.data.current?.type === 'block' && over.data.current?.type === 'block') {
      const activeBlockId = active.data.current.blockId;
      const overBlockId = over.data.current.blockId;

      console.log('Block reorder detected:', { activeBlockId, overBlockId });

      if (activeBlockId !== overBlockId && state.selectedTreeTable) {
        setBlockOrderMap(prev => {
          const tableKey = state.selectedTreeTable || '';

          // Get current order or default to sorted blockIds
          const fieldsByBlocks = getCurrentTableFieldsByBlocks();
          const blockIds = Object.keys(fieldsByBlocks).map(Number).sort((a, b) => a - b);
          const currentOrder = prev[tableKey] || blockIds;

          console.log('Current order:', currentOrder, 'Block IDs:', blockIds);

          const oldIndex = currentOrder.indexOf(activeBlockId);
          const newIndex = currentOrder.indexOf(overBlockId);

          console.log('Indices:', { oldIndex, newIndex });

          if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
            console.log('New order:', newOrder);
            return { ...prev, [tableKey]: newOrder };
          }

          return prev;
        });
      }
      setActiveField(null);
      return;
    }

    // Handle dropping field from left panel to form
    if ((over.id === 'form-builder' || over.id?.toString().startsWith('droppable-block-')) && active.data.current && !active.data.current.formId) {
      const field = active.data.current as Field;
      let blockId = 1; // Default to block 1

      // If dropped on a specific block, use that block ID
      if (over.id?.toString().startsWith('droppable-block-')) {
        blockId = over.data.current?.blockId || 1;
      } else {
        // If dropped on general form area, use next available block
        blockId = getNextBlockId();
      }

      const newFormField: FormField = {
        ...field,
        formId: Math.random().toString(36).substr(2, 9),
        tableId: state.selectedTreeTable || '',
        blockId
      };
      setFormFields(prev => [...prev, newFormField]);
    }

    // Handle moving field between blocks
    if (active.data.current?.formId && over.id?.toString().startsWith('droppable-block-')) {
      const fieldId = active.id as string;
      const targetBlockId = over.data.current?.blockId;

      if (targetBlockId) {
        setFormFields(prev => prev.map(field =>
          field.formId === fieldId
            ? { ...field, blockId: targetBlockId }
            : field
        ));
      }
    }

    // Handle reordering existing fields within the same block
    if (active.id !== over.id && active.data.current?.formId && over.data.current?.formId) {
      const activeField = formFields.find(f => f.formId === active.id);
      const overField = formFields.find(f => f.formId === over.id);

      if (activeField && overField && activeField.blockId === overField.blockId) {
        const blockFields = currentTableFormFields.filter(f => f.blockId === activeField.blockId);
        const oldIndex = blockFields.findIndex(field => field.formId === active.id);
        const newIndex = blockFields.findIndex(field => field.formId === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedBlockFields = arrayMove(blockFields, oldIndex, newIndex);

          // Update the main formFields array
          setFormFields(prev => {
            const otherFields = prev.filter(f =>
              f.tableId !== state.selectedTreeTable || f.blockId !== activeField.blockId
            );
            return [...otherFields, ...reorderedBlockFields];
          });
        }
      }
    }

    setActiveField(null);
  };

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

  // Block management functions
  const handleAddBlock = () => {
    // Add block is handled by dropping fields into new blocks
    // This could be used for adding empty blocks if needed
  };

  const handleRemoveBlock = (blockId: number) => {
    // Only remove if block is empty
    const blockFields = currentTableFormFields.filter(f => f.blockId === blockId);
    if (blockFields.length === 0) {
      // No fields to remove, block is already empty
      // Could add logic here to clean up empty block references if needed
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
    const jsonData = generateJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Use webform name as filename, or default to 'form-config.json'
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
    // TODO: Implement Push to RN3 functionality
    alert('Push to RN3 functionality will be implemented soon!');
  };

  const handleUploadJSON = (jsonData: any) => {
    try {
      const result = importFormJSON(jsonData, state.datasets, state.selectedDataset);

      // Extract and set webform name if present
      if (result.webformName) {
        setWebformName(result.webformName);
      }

      // Clear existing form state
      setFormFields([]);
      setSelectedFormField(null);

      if (result.formFields.length > 0) {
        setFormFields(result.formFields);

        // Automatically select the first table that has restored fields
        if (result.firstTableId) {
          setSelectedTreeTable(result.firstTableId);
        }

        alert(`Successfully restored form with ${result.formFields.length} fields from JSON.`);
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
          backgroundColor: '#f8f9fa',
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
                padding: '0.5rem',
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
          padding: '1rem'
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
          <div style={{ flex: 1, overflow: 'auto' }}>
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
                {generateJSON()}
              </pre>
            </div>
          ) : showPreview ? (
            /* Full Form Preview Mode */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                marginRight: '1rem'
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
                <form style={{
                  maxWidth: '700px',
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                  padding: '2rem',
                  marginRight: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #94a3b8',
                  boxShadow: `
                    0 20px 40px rgba(0, 0, 0, 0.15),
                    0 10px 20px rgba(0, 0, 0, 0.1),
                    0 4px 8px rgba(0, 0, 0, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                  `,
                  position: 'relative'
                }}>
                    {/* Root Table Section */}
                    {state.hasRootTable && state.treeStructure.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{
                          margin: '0 0 1rem 0',
                          fontSize: '1.2rem',
                          color: '#2E3E4C',
                          fontWeight: 'bold'
                        }}>
                          Root table
                        </h3>
                        <div
                          onClick={() => setIsRootCollapsed(!isRootCollapsed)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaTable style={{ color: '#1f2937', fontSize: '1rem' }} />
                            <h3 style={{
                              margin: 0,
                              fontSize: '1rem',
                              color: '#1f2937',
                              fontWeight: 'bold'
                            }}>
                              {state.treeStructure[0].title}
                            </h3>
                          </div>
                          <div style={{
                            color: '#1f2937',
                            fontSize: '1rem',
                            transition: 'transform 0.2s ease',
                            transform: isRootCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'
                          }}>
                            <FaChevronDown />
                          </div>
                        </div>

                        {!isRootCollapsed && (
                          <div style={{
                            padding: '1rem',
                            backgroundColor: '#EFEBF2',
                            borderRadius: '8px',
                            border: '1px solid #BEADCE',
                            marginBottom: '1rem'
                          }}>
                            {renderFieldsByBlocks(getFieldsByTableId(state.treeStructure[0].tableId))}
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
                          Tabs
                        </h3>

                        {/* Tab Headers */}
                        <div style={{
                          display: 'flex',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          padding: '4px',
                          marginBottom: '1.5rem',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #e2e8f0'
                        }}>
                          {getChildTables().map((childTable, index) => (
                            <button
                              key={childTable.tableId}
                              type="button"
                              onClick={() => setActiveChildTab(childTable.tableId)}
                              style={{
                                flex: 1,
                                padding: '0.75rem 1.5rem',
                                backgroundColor: activeChildTab === childTable.tableId ? 'white' : 'transparent',
                                color: activeChildTab === childTable.tableId ? '#1f2937' : '#6b7280',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: activeChildTab === childTable.tableId ? '600' : '500',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                marginRight: index < getChildTables().length - 1 ? '2px' : '0',
                                boxShadow: activeChildTab === childTable.tableId ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                                transform: activeChildTab === childTable.tableId ? 'translateY(-1px)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start'
                              }}
                              onMouseEnter={(e) => {
                                if (activeChildTab !== childTable.tableId) {
                                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                                  e.currentTarget.style.color = '#374151';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (activeChildTab !== childTable.tableId) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '#6b7280';
                                }
                              }}
                            >
                              <span style={{ marginRight: '0.5rem' }}>
                                {getTableIcon()}
                              </span>
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
                              renderFieldsByBlocks(getFieldsByTableId(activeChildTab))
                            )}
                          </div>
                        )}
                      </div>
                    )}

                </form>
              )}
            </div>
          ) : (
            /* Form Builder Area */
            <DroppableFormArea elementCount={currentTableFormFields.length}>
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
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>
                    {selectedTableName} Form
                  </h3>
                  {/* Gray line separator with edit icon */}
                  {(() => {
                    // Find the current table in tree structure
                    const findTableInTree = (nodes: any[]): any => {
                      for (const node of nodes) {
                        if (node.tableId === state.selectedTreeTable) {
                          return node;
                        }
                        if (node.children && node.children.length > 0) {
                          const found = findTableInTree(node.children);
                          if (found) return found;
                        }
                      }
                      return null;
                    };

                    const currentTableNode = findTableInTree(state.treeStructure);

                    if (currentTableNode) {
                      const handleStartEdit = () => {
                        setEditTitle(currentTableNode.title);
                        setEditLabel(currentTableNode.label);
                        setEditingTableProperties(true);
                      };

                      const handleSaveEdit = () => {
                        if (editTitle.trim() && editLabel.trim()) {
                          updateTableProperties(state.selectedTreeTable, editLabel.trim(), editTitle.trim());
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
                          {/* Gray line with edit icon */}
                          <div style={{
                            position: 'relative',
                            height: '1px',
                            backgroundColor: '#dee2e6',
                            marginBottom: '1rem'
                          }}>
                            <div style={{
                              position: 'absolute',
                              right: '0',
                              top: '0.5rem',
                              transform: 'translateY(-50%)'
                            }}>
                              <FaEdit
                                onClick={handleStartEdit}
                                style={{
                                  color: '#47B3FF',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  padding: '0.25rem',
                                  borderRadius: '3px',
                                  transition: 'all 0.2s ease',
                                  marginTop:'0.6rem',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f0f8ff';
                                  e.currentTarget.style.color = '#0066cc';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '#47B3FF';
                                }}
                                title="Edit table title and label"
                              />
                            </div>
                          </div>

                          {/* Table title and label display/edit */}
                          <div style={{ marginBottom: '1.5rem' }}>
                            {editingTableProperties ? (
                              // Edit mode
                              <div>
                                <div style={{ marginBottom: '0.75rem' }}>
                                  <strong style={{ color: '#4C677F', display: 'block', marginBottom: '0.25rem' }}>Title:</strong>
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '1px solid #dee2e6',
                                      borderRadius: '4px',
                                      fontSize: '0.9rem'
                                    }}
                                    placeholder="Enter title"
                                  />
                                </div>
                                <div style={{ marginBottom: '0.75rem' }}>
                                  <strong style={{ color: '#4C677F', display: 'block', marginBottom: '0.25rem' }}>Label:</strong>
                                  <input
                                    type="text"
                                    value={editLabel}
                                    onChange={(e) => setEditLabel(e.target.value)}
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      border: '1px solid #dee2e6',
                                      borderRadius: '4px',
                                      fontSize: '0.9rem'
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
                                      backgroundColor: (!editTitle.trim() || !editLabel.trim()) ? '#ccc' : '#289588',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: (!editTitle.trim() || !editLabel.trim()) ? 'not-allowed' : 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    style={{
                                      padding: '0.4rem 0.8rem',
                                      backgroundColor: '#6c757d',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Display mode
                              <div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong style={{ color: '#4C677F' }}>Title:</strong>
                                  <span style={{ marginLeft: '0.5rem', color: '#333' }}>{currentTableNode.title}</span>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong style={{ color: '#4C677F' }}>Label:</strong>
                                  <span style={{ marginLeft: '0.5rem', color: '#333' }}>{currentTableNode.label}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    }

                    // If no table found, just show the gray line
                    return (
                      <div style={{
                        height: '1px',
                        backgroundColor: '#dee2e6',
                        marginBottom: '1rem'
                      }} />
                    );
                  })()}
                  {(() => {
                    const fieldsByBlocks = getCurrentTableFieldsByBlocks();
                    const defaultBlockIds = Object.keys(fieldsByBlocks).map(Number).sort((a, b) => a - b);

                    // Use custom order if available, otherwise use default sorted order
                    const tableKey = state.selectedTreeTable || '';
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
                        items={blockIds.map(id => `block-${id}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {blockIds.map((blockId, index) => (
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
                  })()}
                </div>
              )}
            </DroppableFormArea>
          )}
          </div>
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

          <PropertiesInspector
            selectedField={selectedFormField}
            onUpdateField={handleUpdateFieldProperty}
          />

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
            padding: '0.5rem',
            backgroundColor: 'white',
            border: '2px solid #47B3FF',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(44,62,76,0.15)',
            transform: 'rotate(5deg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem'
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