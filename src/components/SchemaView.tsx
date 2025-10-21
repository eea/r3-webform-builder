import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FaTable, FaLayerGroup, FaPlusCircle, FaFolder, FaSitemap, FaWpforms } from 'react-icons/fa';
import './SchemaView.css';

interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface SchemaViewProps {
  onFieldSelect: (field: Field) => void;
}

export default function SchemaView({ onFieldSelect }: SchemaViewProps) {
  const { state, setSelectedDataset, setSelectedTable, addRootTable, addTab, addRootTableToTree, addChildTableToTree, setSelectedTreeTable, setWebformName } = useApp();
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
            backgroundColor: isSelected ? '#0083E0' : (isActualRoot ? '#A0D7FF' : isHopelineChild ? '#FEF6CD' : '#EFEBF2'),
            border: `1px solid ${isSelected ? '#0083E0' : '#87A7C3'}`,
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
            color: isSelected ? 'white' : (isActualRoot ? '#003052' : isHopelineChild ? '#E56B38' : '#4C677F')
          }} />
          <div>
            <div style={{
              fontWeight: 'bold',
              fontSize: '0.9rem',
              color: isSelected ? 'white' : 'inherit'
            }}>
              {node.label}
              {isHopelineChild && !isSelected && <span style={{ fontSize: '0.7rem', color: '#E56B38', marginLeft: '0.5rem' }}>(hopeline)</span>}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: isSelected ? 'rgba(255,255,255,0.8)' : '#4C677F'
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
    <div className="schema-view" style={{ paddingTop: '3rem' }}>
      {/* Schema Title with horizontal bar */}
      <div className="schema-header">
        <h3>Schema</h3>
      </div>

      <div className="schema-content">

        {/* Dataset and Webform Configuration */}
        <div className="dataset-section">
          <div className="section-header">
            <h3>
              <FaLayerGroup style={{ fontSize: '0.85rem' }} /> Dataset
            </h3>
          </div>

          <select
            value={state.selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="dataset-dropdown"
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
            <p className="webform-description">
              Connect first to load schemas
            </p>
          )}

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <div className="section-header">
              <h3>
                <FaWpforms style={{ fontSize: '0.85rem' }} /> Webform Name
              </h3>
            </div>
            <input
              type="text"
              value={state.webformName}
              onChange={(e) => setWebformName(e.target.value)}
              className="webform-input"
              placeholder="Enter webform name"
            />
            <p className="webform-description">
              This name will be used for JSON download/upload
            </p>
          </div>
        </div>

        {/* Table Selection */}
        <div className="table-selection-container">
          <div className="table-selection-header">
            <h4>
              <FaTable style={{ fontSize: '0.85rem' }} /> Table Selection
            </h4>
          </div>

          <select
            value={state.selectedTable}
            onChange={(e) => handleTableSelect(e.target.value)}
            className="tables-dropdown"
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
            <p className="webform-description">
              Select a schema first to load tables
            </p>
          )}

          {state.selectedTable && (
            <div className="table-form">
              <div className="form-group">
                <label>
                  Label: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Enter label"
                />
              </div>

              <div className="form-group">
                <label>
                  Title: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                />
              </div>

              <div className="action-buttons">
                {!state.hasRootTable && (
                  <>
                    <button
                      onClick={handleAddRootTable}
                      disabled={!label || !title}
                      className="action-button root-table-button"
                    >
                      <FaPlusCircle className="button-icon" /> Add as Root Table
                    </button>
                    <button
                      onClick={handleAddTab}
                      disabled={!label || !title}
                      className="action-button table-button"
                    >
                      <FaPlusCircle className="button-icon" /> Add as Table
                    </button>
                  </>
                )}
                {state.hasRootTable && (
                  <button
                    onClick={handleAddTab}
                    disabled={!label || !title}
                    className="action-button table-button"
                  >
                    <FaPlusCircle className="button-icon" /> Add Table
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      {/* TreeView Section */}
      {state.treeStructure.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              marginBottom: '0.25rem'
            }}
            onClick={() => toggleSection('treeview')}
          >
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>
              <FaSitemap style={{ fontSize: '0.85rem' }} /> Table Structure
            </h3>
            <span style={{ fontSize: '0.8rem' }}>{expandedSections.treeview ? '▼' : '▶'}</span>
          </div>

          {expandedSections.treeview && (
            <div style={{
              border: '1px solid #DAE8F4',
              borderRadius: '4px',
              padding: '0.5rem',
              backgroundColor: '#DAE8F4'
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
    </div>
  );
}