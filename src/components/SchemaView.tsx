import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FaTable, FaLayerGroup, FaPlusCircle, FaSitemap, FaTimes } from 'react-icons/fa';
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
  onDatasetChange?: () => void;
}

export default function SchemaView({ onFieldSelect, onDatasetChange }: SchemaViewProps) {
  const { state, setSelectedDataset, setSelectedTable, addRootTableToTree, addChildTableToTree, setSelectedTreeTable, removeTableFromTree } = useApp();
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

    const containerClass = level > 0 ? 'tree-child-node' : '';

    return (
      <div className={`tree-node ${containerClass}`}>
        <div
          className={`tree-node-content ${isSelected ? 'selected' : ''}`}
          onClick={handleTableClick}
        >
          <div className={`tree-node-indicator ${nodeType} ${isSelected ? 'selected' : ''}`} />

          <FaTable className={`tree-node-icon ${nodeType} ${isSelected ? 'selected' : ''}`} />

          <div className="tree-node-details">
            <div className={`tree-node-label ${isSelected ? 'selected' : ''}`}>
              {node.label}
            </div>
            <div className={`tree-node-subtitle ${isSelected ? 'selected' : ''}`}>
              {node.title} ({tableName})
            </div>
          </div>

          <FaTimes
            className="tree-node-remove"
            onClick={handleRemoveClick}
            title="Remove table"
          />
        </div>

        {node.children.length > 0 && (
          <div className="tree-children">
            {node.children.map((child: any) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
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
            onChange={(e) => {
              setSelectedDataset(e.target.value);
              onDatasetChange?.();
            }}
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
            {filteredTables.map((table) => (
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
          <div className="tree-section">
            <div className="tree-section-header" onClick={() => toggleSection('treeview')}>
              <h3>
                <FaSitemap /> Table Structure
              </h3>
              <span className="section-toggle">{expandedSections.treeview ? '▼' : '▶'}</span>
            </div>

            {expandedSections.treeview && (
              <div className="tree-container">
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