import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { connectionCookieUtils } from '../utils/cookies';

interface Table {
  id: string;
  name: string;
  fields: Field[];
}

interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface Dataset {
  id: string;
  name: string;
  tables: Table[];
}

interface ConnectionData {
  environment: string;
  apiKey: string;
  dataflowId: string;
}

interface TreeNode {
  id: string;
  tableId: string;
  label: string;
  title: string;
  children: TreeNode[];
}

interface AppState {
  connection: ConnectionData | null;
  datasets: Dataset[];
  selectedDataset: string;
  selectedTable: string;
  isConnected: boolean;
  rootTables: string[];
  tabs: string[];
  treeStructure: TreeNode[];
  hasRootTable: boolean;
  selectedTreeTable: string;
  webformName: string;
}

interface AppContextType {
  state: AppState;
  setConnection: (connection: ConnectionData) => void;
  setDatasets: (datasets: Dataset[]) => void;
  setSelectedDataset: (datasetId: string) => void;
  setSelectedTable: (tableId: string) => void;
  addRootTable: (tableId: string) => void;
  addTab: (tableId: string) => void;
  addRootTableToTree: (tableId: string, label: string, title: string) => void;
  addChildTableToTree: (tableId: string, label: string, title: string) => void;
  setSelectedTreeTable: (tableId: string) => void;
  setWebformName: (name: string) => void;
  updateTableProperties: (tableId: string, label: string, title: string) => void;
  removeTableFromTree: (nodeId: string) => void;
  reorderChildTables: (oldIndex: number, newIndex: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    connection: null,
    datasets: [],
    selectedDataset: '',
    selectedTable: '',
    isConnected: false,
    rootTables: [],
    tabs: [],
    treeStructure: [],
    hasRootTable: false,
    selectedTreeTable: '',
    webformName: ''
  });

  // Load connection data, webform name, and selected dataset from cookies on component mount
  useEffect(() => {
    const savedConnection = connectionCookieUtils.loadConnection();
    const savedWebformName = connectionCookieUtils.loadWebformName();
    const savedSelectedDataset = connectionCookieUtils.loadSelectedDataset();

    // Only consider connection valid if API key is present
    const hasValidConnection = savedConnection && savedConnection.apiKey && savedConnection.apiKey.trim() !== '';

    if (hasValidConnection || savedWebformName || savedSelectedDataset) {
      setState(prev => ({
        ...prev,
        ...(hasValidConnection && { connection: savedConnection, isConnected: true }),
        ...(savedWebformName && { webformName: savedWebformName }),
        ...(savedSelectedDataset && { selectedDataset: savedSelectedDataset })
      }));
    }
  }, []);

  const setConnection = (connection: ConnectionData) => {
    // Save to cookies
    connectionCookieUtils.saveConnection(connection);

    setState(prev => ({
      ...prev,
      connection,
      isConnected: true
    }));
  };

  const setDatasets = (datasets: Dataset[]) => {
    setState(prev => ({
      ...prev,
      datasets
    }));
  };

  const setSelectedDataset = (datasetId: string) => {
    // Save to cookies
    connectionCookieUtils.saveSelectedDataset(datasetId);

    setState(prev => ({
      ...prev,
      selectedDataset: datasetId,
      selectedTable: '',
      // Clear tree structure and form builder state when dataset changes
      rootTables: [],
      tabs: [],
      treeStructure: [],
      hasRootTable: false,
      selectedTreeTable: ''
    }));
  };

  const setSelectedTable = (tableId: string) => {
    setState(prev => ({
      ...prev,
      selectedTable: tableId
    }));
  };

  const addRootTable = (tableId: string) => {
    setState(prev => ({
      ...prev,
      rootTables: [...prev.rootTables, tableId]
    }));
  };

  const addTab = (tableId: string) => {
    setState(prev => ({
      ...prev,
      tabs: [...prev.tabs, tableId]
    }));
  };

  const addRootTableToTree = (tableId: string, label: string, title: string) => {
    const newRootNode: TreeNode = {
      id: Math.random().toString(36).substr(2, 9),
      tableId,
      label,
      title,
      children: []
    };

    setState(prev => ({
      ...prev,
      treeStructure: [newRootNode],
      hasRootTable: true,
      rootTables: [...prev.rootTables, tableId]
    }));
  };

  const addChildTableToTree = (tableId: string, label: string, title: string) => {
    const newChildNode: TreeNode = {
      id: Math.random().toString(36).substr(2, 9),
      tableId,
      label,
      title,
      children: []
    };

    setState(prev => {
      if (prev.hasRootTable && prev.treeStructure.length > 0) {
        // Add as child to existing root
        return {
          ...prev,
          treeStructure: prev.treeStructure.map(rootNode => ({
            ...rootNode,
            children: [...rootNode.children, newChildNode]
          })),
          tabs: [...prev.tabs, tableId]
        };
      } else {
        // Add as hopeline child (no root table)
        return {
          ...prev,
          treeStructure: [...prev.treeStructure, newChildNode],
          tabs: [...prev.tabs, tableId]
        };
      }
    });
  };

  const setSelectedTreeTable = (tableId: string) => {
    setState(prev => ({
      ...prev,
      selectedTreeTable: tableId
    }));
  };

  const setWebformName = (name: string) => {
    // Save to cookies
    connectionCookieUtils.saveWebformName(name);

    setState(prev => ({
      ...prev,
      webformName: name
    }));
  };

  const updateTableProperties = (tableId: string, label: string, title: string) => {
    const updateNodeRecursively = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.tableId === tableId) {
          return { ...node, label, title };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateNodeRecursively(node.children) };
        }
        return node;
      });
    };

    setState(prev => ({
      ...prev,
      treeStructure: updateNodeRecursively(prev.treeStructure)
    }));
  };

  const removeTableFromTree = (nodeId: string) => {
    const removeNodeRecursively = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .filter(node => node.id !== nodeId)
        .map(node => ({
          ...node,
          children: removeNodeRecursively(node.children)
        }));
    };

    setState(prev => {
      const newTreeStructure = removeNodeRecursively(prev.treeStructure);

      // Check if we removed the root table (first element was removed and hasRootTable was true)
      const removedRoot = prev.hasRootTable && prev.treeStructure.length > 0 && newTreeStructure.length === 0;

      // Find the tableId of the removed node to update rootTables and tabs
      const findTableId = (nodes: TreeNode[], id: string): string | null => {
        for (const node of nodes) {
          if (node.id === id) return node.tableId;
          const found = findTableId(node.children, id);
          if (found) return found;
        }
        return null;
      };

      const removedTableId = findTableId(prev.treeStructure, nodeId);

      return {
        ...prev,
        treeStructure: newTreeStructure,
        hasRootTable: removedRoot ? false : prev.hasRootTable,
        rootTables: removedTableId ? prev.rootTables.filter(id => id !== removedTableId) : prev.rootTables,
        tabs: removedTableId ? prev.tabs.filter(id => id !== removedTableId) : prev.tabs,
        selectedTreeTable: prev.selectedTreeTable === removedTableId ? '' : prev.selectedTreeTable
      };
    });
  };

  const reorderChildTables = (oldIndex: number, newIndex: number) => {
    setState(prev => {
      if (!prev.hasRootTable || prev.treeStructure.length === 0) {
        return prev;
      }

      const rootNode = prev.treeStructure[0];
      const children = [...rootNode.children];

      // Remove the item from old position and insert at new position
      const [movedItem] = children.splice(oldIndex, 1);
      children.splice(newIndex, 0, movedItem);

      return {
        ...prev,
        treeStructure: [
          {
            ...rootNode,
            children
          }
        ]
      };
    });
  };

  return (
    <AppContext.Provider value={{
      state,
      setConnection,
      setDatasets,
      setSelectedDataset,
      setSelectedTable,
      addRootTable,
      addTab,
      addRootTableToTree,
      addChildTableToTree,
      setSelectedTreeTable,
      setWebformName,
      updateTableProperties,
      removeTableFromTree,
      reorderChildTables
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}