import { FaTable, FaPlus, FaEdit } from 'react-icons/fa';
import DroppableFormArea from './DroppableFormArea';
import BlocksList from './BlocksList';
import { colors } from './styles';
import type { FormField } from '../../types/formBuilder';
import type { TreeNode } from '../../context/AppContext';

interface FormBuilderAreaProps {
  selectedTreeTable: string;
  currentTableFormFields: FormField[];
  selectedTableName: string;
  editingTableProperties: boolean;
  editTitle: string;
  editLabel: string;
  setEditTitle: (value: string) => void;
  setEditLabel: (value: string) => void;
  setEditingTableProperties: (value: boolean) => void;
  updateTableProperties: (tableId: string, label: string, title: string) => void;
  treeStructure: TreeNode[];
  blockOrderMap: Record<string, number[]>;
  getCurrentTableFieldsByBlocks: () => Record<number, FormField[]>;
  handleRemoveField: (formId: string) => void;
  handleRemoveBlock: () => void;
  handleAddBlock: () => void;
  selectedFormField: FormField | null;
  setSelectedFormField: (field: FormField | null) => void;
}

export default function FormBuilderArea({
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
}: FormBuilderAreaProps) {
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

export function EmptyBuilderArea() {
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

export function EmptyTableArea({ selectedTableName }: { selectedTableName: string }) {
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

interface TablePropertiesEditorProps {
  selectedTreeTable: string;
  treeStructure: TreeNode[];
  editingTableProperties: boolean;
  editTitle: string;
  editLabel: string;
  setEditTitle: (value: string) => void;
  setEditLabel: (value: string) => void;
  setEditingTableProperties: (value: boolean) => void;
  updateTableProperties: (tableId: string, label: string, title: string) => void;
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
}: TablePropertiesEditorProps) {
  const findTableInTree = (nodes: TreeNode[]): TreeNode | null => {
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
