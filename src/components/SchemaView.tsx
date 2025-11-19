import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FaTable, FaLayerGroup, FaPlusCircle, FaSitemap, FaTimes, FaFileUpload, FaDatabase } from 'react-icons/fa';
import { parseMetadataCatalog, parseMetadataJSON } from '../utils/metadataParser';

interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface SchemaViewProps {
  onFieldSelect: (field: Field) => void;
  onDatasetChange?: () => void;
}

export default function SchemaView({ onFieldSelect, onDatasetChange }: SchemaViewProps) {
  const { state, setSelectedDataset, setSelectedTable, addRootTableToTree, addChildTableToTree, setSelectedTreeTable, removeTableFromTree, setMetadataCatalog } = useApp();
  const [label, setLabel] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dataset: true,
    tables: true,
    fields: true,
    treeview: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFieldClick = (field: Field) => {
    onFieldSelect(field);
  };

  const selectedDatasetObj = state.datasets.find(d => d.id === state.selectedDataset);
  const availableTables = selectedDatasetObj?.tables || [];

  // Filter out root tables when adding child tables
  const filteredTables = state.hasRootTable
    ? availableTables.filter(table => !state.rootTables.includes(table.id))
    : availableTables;

  const selectedTableData = availableTables.find(t => t.id === state.selectedTable);

  const canEnableThirdButton = state.rootTables.length > 0 || state.tabs.length > 0;

  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId);
    setLabel('');
    setTitle('');
  };

  const handleMetadataUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let metadata;

        // Check if it's JSON or CSV based on file type or content
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          metadata = parseMetadataJSON(jsonData);
        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          metadata = parseMetadataCatalog(content);
        } else {
          // Try to detect format
          if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
            const jsonData = JSON.parse(content);
            metadata = parseMetadataJSON(jsonData);
          } else {
            metadata = parseMetadataCatalog(content);
          }
        }

        setMetadataCatalog(metadata);
        setUploadedFileName(file.name);
      } catch (error) {
        console.error('Error parsing metadata catalog:', error);
        alert('Invalid file format. Please select a valid JSON or CSV metadata catalog file.');
        setUploadedFileName('');
      }
    };
    reader.readAsText(file);

    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddRootTable = () => {
    if (state.selectedTable && label && title) {
      addRootTableToTree(state.selectedTable, label, title);
      setLabel('');
      setTitle('');
      // Clear selection since the table is now a root table and cannot be selected again
      setSelectedTable('');
    }
  };

  const handleAddTab = () => {
    if (state.selectedTable && label && title) {
      addChildTableToTree(state.selectedTable, label, title);
      setLabel('');
      setTitle('');
      // Clear selection after adding as child table
      setSelectedTable('');
    }
  };

  const TreeNode = ({ node, level = 0, isRootNode = false }: { node: any; level?: number; isRootNode?: boolean }) => {
    const selectedTableData = availableTables.find(t => t.id === node.tableId);
    const tableName = selectedTableData?.name || node.tableId;

    // Determine if this is a root table or a hopeline child
    const isActualRoot = isRootNode && state.hasRootTable;
    const isHopelineChild = level === 0 && !state.hasRootTable;
    const isSelected = state.selectedTreeTable === node.tableId;

    const handleTableClick = () => {
      setSelectedTreeTable(node.tableId);
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      removeTableFromTree(node.id);
    };

    // Determine node type for styling
    const nodeType = isActualRoot ? 'root' : isHopelineChild ? 'hopeline' : 'child';

    const getIndicatorColor = () => {
      if (isSelected) return '#3b82f6';
      if (nodeType === 'root') return '#10b981';
      if (nodeType === 'hopeline') return '#f59e0b';
      return '#6366f1';
    };

    const getIconColor = () => {
      if (isSelected) return '#3b82f6';
      if (nodeType === 'root') return '#10b981';
      if (nodeType === 'hopeline') return '#f59e0b';
      return '#6366f1';
    };

    return (
      <div className={level > 0 ? 'relative' : ''} style={level > 0 ? { marginLeft: '2rem' } : {}}>
        <div
          className="flex items-center px-3 py-1.5 cursor-pointer border-b relative transition-all"
          style={{
            backgroundColor: isSelected ? '#dbeafe' : 'transparent',
            borderColor: isSelected ? '#3b82f6' : '#f3f4f6'
          }}
          onClick={handleTableClick}
          onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '#f9fafb')}
          onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {/* Indicator bar */}
          <div
            className="absolute left-0 top-0 transition-all"
            style={{
              width: '4px',
              height: '100%',
              backgroundColor: getIndicatorColor()
            }}
          />

          <FaTable
            className="mr-2 transition-colors"
            style={{
              fontSize: '0.9rem',
              color: getIconColor()
            }}
          />

          <div className="flex-1 min-w-0">
            <div
              className="font-semibold flex items-center gap-1.5 mb-0.5"
              style={{
                fontSize: '0.85rem',
                color: isSelected ? '#1e40af' : '#1f2937'
              }}
            >
              {node.label}
            </div>
            <div
              className="leading-tight"
              style={{
                fontSize: '0.75rem',
                color: isSelected ? '#3730a3' : '#6b7280'
              }}
            >
              {node.title} ({tableName})
            </div>
          </div>

          <FaTimes
            className="ml-2 cursor-pointer transition-all rounded p-1"
            style={{
              fontSize: '1rem',
              color: '#dc2626',
              opacity: 0
            }}
            onClick={handleRemoveClick}
            title="Remove table"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.color = '#991b1b';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.opacity = '0';
            }}
          />
        </div>

        {level > 0 && (
          <div
            className="absolute"
            style={{
              left: '-2rem',
              top: '50%',
              width: '1rem',
              height: '2px',
              backgroundColor: '#e5e7eb'
            }}
          />
        )}

        {node.children.length > 0 && (
          <div className="relative">
            <div
              className="absolute"
              style={{
                left: '1rem',
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: '#e5e7eb'
              }}
            />
            {node.children.map((child: any) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Schema Title with horizontal bar */}
      <div
        className="flex items-center gap-2 px-3 py-4 border-b bg-white"
        style={{
          paddingLeft: '2.2rem',
          borderColor: '#dee2e6'
        }}
      >
        <h3 className="m-0" style={{ fontSize: '1.1rem', color: '#333' }}>Schema</h3>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">

        {/* Dataset and Webform Configuration */}
        <div
          className="rounded-md p-4 mb-4"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}
        >
          <div className="flex justify-between items-center cursor-pointer mb-1">
            <h3 className="m-0 font-bold flex items-center gap-1" style={{ fontSize: '0.9rem' }}>
              <FaLayerGroup style={{ fontSize: '0.85rem' }} /> Dataset
            </h3>
          </div>

          <select
            value={state.selectedDataset}
            onChange={(e) => {
              setSelectedDataset(e.target.value);
              onDatasetChange?.();
            }}
            className="w-full px-2 py-2 border rounded box-border"
            style={{
              borderColor: '#ccc',
              backgroundColor: state.isConnected ? 'white' : '#f3f4f6',
              color: state.isConnected ? '#374151' : '#9ca3af',
              fontSize: '1rem',
              cursor: state.isConnected ? 'pointer' : 'not-allowed'
            }}
            disabled={!state.isConnected}
          >
            <option value="">Select Schema</option>
            {state.datasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.name}
              </option>
            ))}
          </select>

          {!state.isConnected && (
            <p className="m-0 mt-1" style={{ fontSize: '0.7rem', color: '#4C677F' }}>
              Connect first to load schemas
            </p>
          )}

        </div>

        {/* Table Selection */}
        <div
          className="rounded-md p-4 mb-4"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}
        >
          <div className="mb-3">
            <h4 className="m-0 font-semibold" style={{ color: '#1f2937', fontSize: '1rem' }}>
              <FaTable style={{ fontSize: '0.85rem' }} /> Table Selection
            </h4>
          </div>

          <select
            value={state.selectedTable}
            onChange={(e) => handleTableSelect(e.target.value)}
            className="w-full px-2 py-2 border rounded box-border mb-4"
            style={{
              borderColor: '#ccc',
              backgroundColor: state.selectedDataset ? 'white' : '#f3f4f6',
              color: state.selectedDataset ? '#374151' : '#9ca3af',
              fontSize: '1rem',
              cursor: state.selectedDataset ? 'pointer' : 'not-allowed'
            }}
            disabled={!state.selectedDataset}
          >
            <option value="">Select Table</option>
            {filteredTables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.name}
              </option>
            ))}
          </select>

          {!state.selectedDataset && (
            <p className="m-0" style={{ fontSize: '0.7rem', color: '#4C677F' }}>
              Select a schema first to load tables
            </p>
          )}

          {state.selectedTable && (
            <div className="border-t pt-4 mt-4" style={{ borderColor: '#e2e8f0' }}>
              <div className="mb-4">
                <label className="block mb-2 font-medium" style={{ color: '#374151', fontSize: '0.875rem' }}>
                  Label: <span style={{ color: '#dc2626', fontWeight: '600' }}>*</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Enter label"
                  className="w-full px-2 py-2 border rounded box-border focus:outline-none"
                  style={{
                    borderColor: '#ccc',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '1rem'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#ccc'}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium" style={{ color: '#374151', fontSize: '0.875rem' }}>
                  Title: <span style={{ color: '#dc2626', fontWeight: '600' }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="w-full px-2 py-2 border rounded box-border focus:outline-none"
                  style={{
                    borderColor: '#ccc',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '1rem'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#ccc'}
                />
              </div>

              <div className="flex flex-col gap-3 mt-6">
                {!state.hasRootTable && (
                  <>
                    <button
                      onClick={handleAddRootTable}
                      disabled={!label || !title}
                      className="flex items-center justify-center gap-2 px-4 py-3 border-none rounded-md cursor-pointer font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: !label || !title ? '#ccc' : '#50B0A4',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                      onMouseEnter={(e) => (!label || !title) ? null : e.currentTarget.style.backgroundColor = '#289588'}
                      onMouseLeave={(e) => (!label || !title) ? null : e.currentTarget.style.backgroundColor = '#50B0A4'}
                    >
                      <FaPlusCircle /> Add as Root Table
                    </button>
                    <button
                      onClick={handleAddTab}
                      disabled={!label || !title}
                      className="flex items-center justify-center gap-2 px-4 py-3 border-none rounded-md cursor-pointer font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: !label || !title ? '#ccc' : '#006BB8',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                      onMouseEnter={(e) => (!label || !title) ? null : e.currentTarget.style.backgroundColor = '#004B7F'}
                      onMouseLeave={(e) => (!label || !title) ? null : e.currentTarget.style.backgroundColor = '#006BB8'}
                    >
                      <FaPlusCircle /> Add as Table
                    </button>
                  </>
                )}
                {state.hasRootTable && (
                  <button
                    onClick={handleAddTab}
                    disabled={!label || !title}
                    className="flex items-center justify-center gap-2 px-4 py-3 border-none rounded-md cursor-pointer font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: !label || !title ? '#ccc' : '#006BB8',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                    onMouseEnter={(e) => (!label || !title) ? null : e.currentTarget.style.backgroundColor = '#004B7F'}
                    onMouseLeave={(e) => (!label || !title) ? null : e.currentTarget.style.backgroundColor = '#006BB8'}
                  >
                    <FaPlusCircle /> Add Table
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TreeView Section */}
        {state.treeStructure.length > 0 && (
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <div
              className="flex justify-between items-center cursor-pointer mb-3 pb-2 border-b"
              style={{ borderColor: '#e2e8f0' }}
              onClick={() => toggleSection('treeview')}
            >
              <h3 className="m-0 font-semibold flex items-center gap-2" style={{ fontSize: '1rem', color: '#1f2937' }}>
                <FaSitemap /> Table Structure
              </h3>
              <span style={{ fontSize: '0.8rem' }}>{expandedSections.treeview ? '▼' : '▶'}</span>
            </div>

            {expandedSections.treeview && (
              <div
                className="bg-white rounded-md border overflow-hidden"
                style={{ borderColor: '#e5e7eb' }}
              >
                {state.treeStructure.map((rootNode, index) => (
                  <TreeNode
                    key={rootNode.id}
                    node={rootNode}
                    isRootNode={state.hasRootTable && index === 0}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Metadata Catalog Upload Section */}
        {state.treeStructure.length > 0 && (
          <div
            className="rounded-md p-4 mb-4"
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <div className="mb-3">
              <h4 className="m-0 font-semibold flex items-center gap-2" style={{ color: '#1f2937', fontSize: '1rem' }}>
                <FaDatabase style={{ fontSize: '0.85rem' }} /> Metadata Catalog
              </h4>
              <p className="m-0 mt-2" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Upload a metadata catalog JSON or CSV file to enhance field descriptions
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMetadataUpload}
              accept=".json,.csv"
              className="hidden"
            />

            <button
              onClick={handleUploadClick}
              className="w-full px-4 py-2.5 text-white border-none rounded-md cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              style={{ backgroundColor: '#50B0A4' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#289588'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#50B0A4'}
            >
              <FaFileUpload />
              Upload Metadata Catalog
            </button>

            {uploadedFileName && (
              <div
                className="mt-2 px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: '#e0f2f1',
                  color: '#00695c',
                  borderLeft: '3px solid #50B0A4'
                }}
              >
                <span style={{ fontWeight: '600' }}>Uploaded: </span>
                {uploadedFileName}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}