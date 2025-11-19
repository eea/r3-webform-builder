import { useState, useEffect } from 'react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { FaTable, FaPlus, FaEye, FaChevronDown } from 'react-icons/fa';
import type { FormField } from '../../types/formBuilder';
import type { TreeNode } from '../../context/AppContext';
import FormFieldBlock from './FormFieldBlock';
import SortableTab from './SortableTab';
import { previewStyles } from './styles';


interface PreviewModeProps {
  treeStructure: TreeNode[];
  hasRootTable: boolean;
  formFields: FormField[];
  tabOrder: string[];
  onTabOrderChange: (newOrder: string[]) => void;
}

/**
 * Full form preview with tabs and collapsible sections
 */
export default function PreviewMode({
  treeStructure,
  hasRootTable,
  formFields,
  tabOrder,
  onTabOrderChange,
}: PreviewModeProps) {
  const [isRootCollapsed, setIsRootCollapsed] = useState(false);
  const [activeChildTab, setActiveChildTab] = useState<string>('');

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Get child tables from tree structure
  const getChildTables = (): TreeNode[] => {
    if (treeStructure.length === 0) return [];
    if (hasRootTable) {
      const rootNode = treeStructure[0];
      return rootNode.children || [];
    }
    return treeStructure;
  };

  // Get child tables in sorted order
  const getOrderedChildTables = (): TreeNode[] => {
    const childTables = getChildTables();
    if (tabOrder.length === 0) return childTables;

    return [...childTables].sort((a, b) => {
      const indexA = tabOrder.indexOf(a.tableId);
      const indexB = tabOrder.indexOf(b.tableId);
      return indexA - indexB;
    });
  };

  // Get fields by table ID
  const getFieldsByTableId = (tableId: string): FormField[] => {
    return formFields.filter((f) => f.tableId === tableId);
  };

  // Group fields by blockId for rendering
  const renderFieldsByBlocks = (fields: FormField[]) => {
    const fieldsByBlock: Record<number, FormField[]> = {};
    fields.forEach((field) => {
      const blockId = field.blockId || 1;
      if (!fieldsByBlock[blockId]) {
        fieldsByBlock[blockId] = [];
      }
      fieldsByBlock[blockId].push(field);
    });

    const sortedBlockIds = Object.keys(fieldsByBlock)
      .map(Number)
      .sort((a, b) => a - b);

    return sortedBlockIds.map((blockId) => (
      <FormFieldBlock
        key={`block-${blockId}`}
        fields={fieldsByBlock[blockId]}
      />
    ));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Handle tab reordering
    if (
      active.data.current?.type === 'tab' &&
      over.data.current?.type === 'tab'
    ) {
      const activeTabId = active.data.current.tableId;
      const overTabId = over.data.current.tableId;

      if (activeTabId !== overTabId) {
        const oldIndex = tabOrder.indexOf(activeTabId);
        const newIndex = tabOrder.indexOf(overTabId);

        if (oldIndex !== -1 && newIndex !== -1) {
          onTabOrderChange(arrayMove(tabOrder, oldIndex, newIndex));
        }
      }
    }
  };

  const getTableIcon = () => <FaTable />;
  const childTables = getChildTables();

  // Set initial active tab when childTables change
  useEffect(() => {
    if (childTables.length > 0 && !activeChildTab) {
      setActiveChildTab(childTables[0].tableId);
    }
  }, [childTables, activeChildTab]);

  if (treeStructure.length === 0) {
    return <EmptyPreview />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PreviewHeader />

        <form style={previewStyles.form}>
          {/* Root Table Section */}
          {hasRootTable && treeStructure.length > 0 && (
            <RootTableSection
              rootNode={treeStructure[0]}
              isCollapsed={isRootCollapsed}
              onToggleCollapse={() => setIsRootCollapsed(!isRootCollapsed)}
              fields={getFieldsByTableId(treeStructure[0].tableId)}
              renderFields={renderFieldsByBlocks}
            />
          )}

          {/* Child Tables - Tab System */}
          {childTables.length > 0 && (
            <ChildTablesSection
              hasRootTable={hasRootTable}
              childTables={getOrderedChildTables()}
              tabOrder={tabOrder}
              activeChildTab={activeChildTab}
              onTabChange={setActiveChildTab}
              getTableIcon={getTableIcon}
              getFieldsByTableId={getFieldsByTableId}
              renderFields={renderFieldsByBlocks}
            />
          )}
        </form>
      </div>
    </DndContext>
  );
}

/**
 * Empty state for preview mode
 */
function EmptyPreview() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        color: '#4C677F',
      }}
    >
      <div>
        <FaEye style={{ fontSize: '2rem', marginBottom: '1rem', color: '#87A7C3' }} />
        <h3>No form structure defined</h3>
        <p>Add tables to the tree structure to see the full form preview</p>
      </div>
    </div>
  );
}

/**
 * Preview mode header
 */
function PreviewHeader() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        marginRight: '1rem',
      }}
    >
      <h3 style={{ margin: 0, color: '#50B0A4' }}>Full Form Preview</h3>
      <div
        style={{
          fontSize: '0.9rem',
          color: '#4C677F',
          fontStyle: 'italic',
        }}
      >
        Complete form with all tables
      </div>
    </div>
  );
}

/**
 * Root table section with collapse functionality
 */
function RootTableSection({
  rootNode,
  isCollapsed,
  onToggleCollapse,
  fields,
  renderFields,
}: {
  rootNode: TreeNode;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  fields: FormField[];
  renderFields: (fields: FormField[]) => React.JSX.Element[];
}) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3
        style={{
          margin: '0 0 1rem 0',
          fontSize: '1.2rem',
          color: '#2E3E4C',
          fontWeight: 'bold',
        }}
      >
        Root table
      </h3>
      <div onClick={onToggleCollapse} style={previewStyles.tableHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaTable style={{ color: '#1f2937', fontSize: '1rem' }} />
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              color: '#1f2937',
              fontWeight: 'bold',
            }}
          >
            {rootNode.title}
          </h3>
        </div>
        <div
          style={{
            color: '#1f2937',
            fontSize: '1rem',
            transition: 'transform 0.2s ease',
            transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          <FaChevronDown />
        </div>
      </div>

      {!isCollapsed && (
        <div style={previewStyles.tableContent}>
          {renderFields(fields)}
        </div>
      )}
    </div>
  );
}

/**
 * Child tables with tab navigation
 */
function ChildTablesSection({
  hasRootTable,
  childTables,
  tabOrder,
  activeChildTab,
  onTabChange,
  getTableIcon,
  getFieldsByTableId,
  renderFields,
}: {
  hasRootTable: boolean;
  childTables: TreeNode[];
  tabOrder: string[];
  activeChildTab: string;
  onTabChange: (tableId: string) => void;
  getTableIcon: () => React.JSX.Element;
  getFieldsByTableId: (tableId: string) => FormField[];
  renderFields: (fields: FormField[]) => React.JSX.Element[];
}) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {hasRootTable && (
        <h3
          style={{
            margin: '0 0 1rem 0',
            fontSize: '1.2rem',
            color: '#2E3E4C',
            fontWeight: 'bold',
          }}
        >
          Tabs
        </h3>
      )}

      {/* Tab Headers */}
      <div style={previewStyles.tabContainer}>
        <SortableContext
          items={tabOrder}
          strategy={horizontalListSortingStrategy}
        >
          {childTables.map((childTable) => (
            <SortableTab
              key={childTable.tableId}
              childTable={childTable}
              isActive={activeChildTab === childTable.tableId}
              onClick={() => onTabChange(childTable.tableId)}
              getTableIcon={getTableIcon}
            />
          ))}
        </SortableContext>
      </div>

      {/* Active Tab Content */}
      {activeChildTab && (
        <div style={previewStyles.tabContent}>
          {getFieldsByTableId(activeChildTab).length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#4C677F',
              }}
            >
              <FaPlus style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} />
              <p>No fields added to this table yet</p>
            </div>
          ) : (
            renderFields(getFieldsByTableId(activeChildTab))
          )}
        </div>
      )}
    </div>
  );
}
