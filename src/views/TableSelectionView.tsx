import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FaTable, FaLayerGroup, FaPlusCircle, FaFolder, FaSitemap } from 'react-icons/fa';

interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface TableSelectionViewProps {
  onFieldSelect: (field: Field) => void;
}

export default function TableSelectionView({ onFieldSelect }: TableSelectionViewProps) {
  const { state, setSelectedDataset, setSelectedTable, addRootTable, addTab, addRootTableToTree, addChildTableToTree, setSelectedTreeTable } = useApp();
  const [label, setLabel] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dataset: true,
    tables: true,
    fields: true,
    treeview: true
  });

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
  const selectedTableData = availableTables.find(t => t.id === state.selectedTable);

  const canEnableThirdButton = state.rootTables.length > 0 || state.tabs.length > 0;

  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId);
    setLabel('');
    setTitle('');
  };

  const handleAddRootTable = () => {
    if (state.selectedTable && label && title) {
      addRootTableToTree(state.selectedTable, label, title);
      setLabel('');
      setTitle('');
      setSelectedTable('');
    }
  };

  const handleAddTab = () => {
    if (state.selectedTable && label && title) {
      addChildTableToTree(state.selectedTable, label, title);
      setLabel('');
      setTitle('');
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

    return (
      <div style={{ marginLeft: `${level * 20}px` }}>
        <div
          onClick={handleTableClick}
          style={{
            padding: '0.5rem',
            backgroundColor: isSelected ? '#007bff' : (isActualRoot ? '#e3f2fd' : isHopelineChild ? '#fff3e0' : '#f5f5f5'),
            border: `1px solid ${isSelected ? '#007bff' : '#ddd'}`,
            borderRadius: '4px',
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <FaTable style={{
            color: isSelected ? 'white' : (isActualRoot ? '#1976d2' : isHopelineChild ? '#f57c00' : '#666')
          }} />
          <div>
            <div style={{
              fontWeight: 'bold',
              fontSize: '0.9rem',
              color: isSelected ? 'white' : 'inherit'
            }}>
              {node.label}
              {isHopelineChild && !isSelected && <span style={{ fontSize: '0.7rem', color: '#f57c00', marginLeft: '0.5rem' }}>(hopeline)</span>}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: isSelected ? 'rgba(255,255,255,0.8)' : '#666'
            }}>
              {node.title} ({tableName})
            </div>
          </div>
        </div>
        {node.children.map((child: any) => (
          <TreeNode key={child.id} node={child} level={level + 1} />
        ))}
      </div>
    );
  };

  return (
    <div style={{
      width: '350px',
      height: '100%',
      backgroundColor: 'white',
      borderRight: '1px solid #dee2e6',
      padding: '1rem',
      overflow: 'auto'
    }}>
      {/* Dataset Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '0.5rem'
          }}
          onClick={() => toggleSection('dataset')}
        >
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
            <FaLayerGroup/> Dataset
          </h3>
          <span>{expandedSections.dataset ? '▼' : '▶'}</span>
        </div>

        {expandedSections.dataset && (
          <div>
            <select
              value={state.selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem'
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
              <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0 0 0' }}>
                Connect first to load schemas
              </p>
            )}
          </div>
        )}
      </div>

      {/* Table Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '0.5rem'
          }}
          onClick={() => toggleSection('tables')}
        >
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
            <FaTable/> Tables
          </h3>
          <span>{expandedSections.tables ? '▼' : '▶'}</span>
        </div>

        {expandedSections.tables && (
          <div>
            <select
              value={state.selectedTable}
              onChange={(e) => handleTableSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.9rem',
                marginBottom: '0.5rem'
              }}
              disabled={!state.selectedDataset}
            >
              <option value="">Select Table</option>
              {availableTables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </select>

            {!state.selectedDataset && (
              <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0 0 0' }}>
                Select a schema first to load tables
              </p>
            )}


            {state.selectedTable && (
              <div style={{  borderRadius: '1px' }}>


                <div style={{ marginBottom: '0.3rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '1rem', fontWeight: 'bold' }}>
                    Label: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    style={{
                      width: '80%',
                      padding: '0.25rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}
                    placeholder="Enter label"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '1rem', fontWeight: 'bold' }}>
                    Title: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '80%',
                      padding: '0.25rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}
                    placeholder="Enter title"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {!state.hasRootTable && (
                    <>
                      <button
                        onClick={handleAddRootTable}
                        disabled={!label || !title}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          backgroundColor: label && title ? '#0083E0' : '#A0D7FF',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: label && title ? 'pointer' : 'not-allowed',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <FaPlusCircle /> Root Table
                      </button>
                      <button
                        onClick={handleAddTab}
                        disabled={!label || !title}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          backgroundColor: label && title ? '#0083E0' : '#A0D7FF',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: label && title ? 'pointer' : 'not-allowed',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <FaPlusCircle /> Table
                      </button>
                    </>
                  )}
                  {state.hasRootTable && (
                    <button
                      onClick={handleAddTab}
                      disabled={!label || !title}
                      style={{
                        width: '50%',
                        padding: '0.5rem',
                        backgroundColor: label && title ? '#289588' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: label && title ? 'pointer' : 'not-allowed',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <FaPlusCircle /> Table
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* TreeView Section */}
      {state.treeStructure.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}
            onClick={() => toggleSection('treeview')}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
              <FaSitemap /> Table Structure
            </h3>
            <span>{expandedSections.treeview ? '▼' : '▶'}</span>
          </div>

          {expandedSections.treeview && (
            <div style={{
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '0.5rem',
              backgroundColor: '#fafafa'
            }}>
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

    </div>
  );
}