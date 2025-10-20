import type { FormField } from '../../types/formBuilder';

interface TreeNode {
  id: string;
  tableId: string;
  label: string;
  title: string;
  children: TreeNode[];
}

interface Dataset {
  id: string;
  name: string;
  tables: any[];
}

interface AppState {
  hasRootTable: boolean;
  treeStructure: TreeNode[];
  selectedTreeTable: string;
  datasets: Dataset[];
  selectedDataset: string;
  webformName: string;
}

export function generateFormJSON(
  state: AppState,
  formFields: FormField[]
): string {
  // Generate form structure with webform name
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
    webformName: state.webformName || 'Untitled Webform',
    overview,
    tables,
    hideTabularData: false
  };

  return JSON.stringify(formStructure, null, 2);
}
