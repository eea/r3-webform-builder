import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { sessionStorageUtils } from '../utils/sessionStorage';

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
    selectedTreeTable: ''
  });

  // Load connection data from session storage on component mount
  useEffect(() => {
    const savedConnection = sessionStorageUtils.loadConnection();
    if (savedConnection) {
      setState(prev => ({
        ...prev,
        connection: savedConnection,
        isConnected: true
      }));
    }
  }, []);

  const setConnection = (connection: ConnectionData) => {
    // Save to session storage
    sessionStorageUtils.saveConnection(connection);

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
    setState(prev => ({
      ...prev,
      selectedDataset: datasetId,
      selectedTable: ''
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
      setSelectedTreeTable
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