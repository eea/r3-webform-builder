import type { FormField } from '../../types/formBuilder';

// Helper function to add field-specific properties
function addFieldProperties(element: any, field: FormField) {
  // Add placeholder for applicable field types
  if (['text', 'email', 'tel', 'phone', 'number', 'number_integer', 'number_decimal', 'textarea'].includes(field.type.toLowerCase())) {
    element.placeholder = field.customPlaceholder || `Enter ${field.name.toLowerCase()}`;
  }

  // Add level for label fields
  if (field.type.toLowerCase() === 'label') {
    element.level = field.customLevel || field.level || 1;
  }

  // Add auto increment for number fields
  if (['number', 'number_integer'].includes(field.type.toLowerCase())) {
    element.autoIncrement = field.customAutoIncrement !== undefined ? field.customAutoIncrement : (field.autoIncrement || false);
  }

  // Add codelist items for dropdown/multiselect fields
  if (['codelist', 'multiselect_codelist'].includes(field.type.toLowerCase())) {
    element.codelistItems = field.customCodelistItems || field.codelistItems || ['Option 1', 'Option 2', 'Option 3'];
  }

  // Add dependency information if present
  if (field.dependency) {
    element.dependency = {
      field: field.dependency.field,
      value: field.dependency.value
    };
  }

  // Add reference information if present
  if (field.referenceParentField) {
    element.referenceParentField = field.referenceParentField;
  }
  if (field.referenceParentTable) {
    element.referenceParentTable = field.referenceParentTable;
  }
}

export interface FormStructure {
  version: string;
  generatedBy: string;
  generatedAt: string;
  webformName: string;
  overview: any[];
  tables: any[];
  hideTabularData: boolean;
  metadata: {
    totalFields: number;
    totalTables: number;
    fieldTypes: string[];
    hasAdvancedFields: boolean;
  };
}

export function generateFormJSON(
  formFields: FormField[],
  webformName: string,
  treeStructure: any[],
  hasRootTable: boolean,
  selectedTreeTable: string | null,
  datasets: any[],
  selectedDataset: string | null
): string {
  // Generate form structure with webform name
  const overview: any[] = [];

  // Find root table and its fields for overview
  let rootTableFields: FormField[] = [];

  if (hasRootTable && treeStructure.length > 0) {
    const rootNode = treeStructure[0];
    rootTableFields = formFields.filter(f => f.tableId === rootNode.tableId);

    // Add root table fields to overview (grouped by blocks)
    const fieldsByBlock: Record<number, FormField[]> = {};
    rootTableFields.forEach(field => {
      const blockId = field.blockId || 1;
      if (!fieldsByBlock[blockId]) {
        fieldsByBlock[blockId] = [];
      }
      fieldsByBlock[blockId].push(field);
    });

    const sortedBlockIds = Object.keys(fieldsByBlock).map(Number).sort((a, b) => a - b);
    sortedBlockIds.forEach(blockId => {
      const blockFields = fieldsByBlock[blockId];

      if (blockFields.length === 1) {
        // Single field - add directly
        const field = blockFields[0];
        overview.push({
          field: field.name,
          type: "FIELD",
          fieldType: field.type,
          header: field.customTitle || field.name,
          isPrimary: field.isPrimary || false
        });
      } else if (blockFields.length > 1) {
        // Multiple fields - add as block
        overview.push({
          type: "BLOCK",
          elements: blockFields.map(field => ({
            field: field.name,
            type: "FIELD",
            fieldType: field.type,
            header: field.customTitle || field.name,
            isPrimary: field.isPrimary || false
          }))
        });
      }
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
    const currentTableFields = formFields.filter(f => f.tableId === selectedTreeTable);
    currentTableFields.forEach(field => {
      overview.push({
        field: field.name,
        type: "FIELD",
        fieldType: field.type,
        header: field.customTitle || field.name,
        isPrimary: field.isPrimary || false
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

  if (treeStructure.length > 0) {
    const processNode = (node: any, isRootTable: boolean = false) => {
      if (!processedTables.has(node.tableId)) {
        const selectedDatasetObj = datasets.find(d => d.id === selectedDataset);
        const tableData = selectedDatasetObj?.tables.find(t => t.id === node.tableId);
        const nodeFields = fieldsByTable.get(node.tableId) || [];

        if (nodeFields.length > 0) {
          const tableEntry = {
            name: tableData?.name || node.tableId,
            label: node.label,
            title: node.title,
            multipleRecords: false,
            isVisible: !isRootTable,
            ...(isRootTable && { isRootTable: true }),
            elements: (() => {
              // Group fields by blockId
              const fieldsByBlock: Record<number, FormField[]> = {};
              nodeFields.forEach(field => {
                const blockId = field.blockId || 1;
                if (!fieldsByBlock[blockId]) {
                  fieldsByBlock[blockId] = [];
                }
                fieldsByBlock[blockId].push(field);
              });

              const elements: any[] = [];
              const sortedBlockIds = Object.keys(fieldsByBlock).map(Number).sort((a, b) => a - b);

              sortedBlockIds.forEach(blockId => {
                const blockFields = fieldsByBlock[blockId];

                if (blockFields.length === 1) {
                  // Single field - add directly without block wrapper
                  const field = blockFields[0];
                  const element: any = {
                    type: "FIELD",
                    name: field.name,
                    fieldType: field.type,
                    title: field.customTitle || field.name,
                    tooltip: field.customTooltip || field.description || "",
                    isPrimary: field.isPrimary || false,
                    showRequiredCharacter: field.customRequired !== undefined ? field.customRequired : field.required,
                    isVisible: field.customIsVisible !== undefined ? field.customIsVisible : (field.isVisible !== false),
                    readOnly: field.customReadOnly !== undefined ? field.customReadOnly : (field.readOnly || false)
                  };

                  // Add field-specific properties
                  addFieldProperties(element, field);
                  elements.push(element);
                } else if (blockFields.length > 1) {
                  // Multiple fields - wrap in block
                  const blockElement = {
                    type: "BLOCK",
                    elements: blockFields.map(field => {
                      const element: any = {
                        type: "FIELD",
                        name: field.name,
                        fieldType: field.type,
                        title: field.customTitle || field.name,
                        tooltip: field.customTooltip || field.description || "",
                        isPrimary: field.isPrimary || false,
                        showRequiredCharacter: field.customRequired !== undefined ? field.customRequired : field.required,
                        isVisible: field.customIsVisible !== undefined ? field.customIsVisible : (field.isVisible !== false),
                        readOnly: field.customReadOnly !== undefined ? field.customReadOnly : (field.readOnly || false)
                      };

                      // Add field-specific properties
                      addFieldProperties(element, field);
                      return element;
                    })
                  };
                  elements.push(blockElement);
                }
              });

              return elements;
            })()
          };

          tables.push(tableEntry);
          processedTables.add(node.tableId);
        }
      }

      // Process children
      node.children.forEach((child: any) => processNode(child, false));
    };

    // Process tree structure
    treeStructure.forEach((rootNode, index) => {
      if (hasRootTable && index === 0) {
        processNode(rootNode, true);
      } else {
        processNode(rootNode, false);
      }
    });
  }

  const formStructure: FormStructure = {
    version: "2.0",
    generatedBy: "R3 WebForm Builder Enhanced",
    generatedAt: new Date().toISOString(),
    webformName: webformName || 'Untitled Webform',
    overview,
    tables,
    hideTabularData: false,
    metadata: {
      totalFields: formFields.length,
      totalTables: new Set(formFields.map(f => f.tableId)).size,
      fieldTypes: [...new Set(formFields.map(f => f.type))],
      hasAdvancedFields: formFields.some(f =>
        ['codelist', 'multiselect_codelist', 'attachment', 'label', 'link', 'external_link'].includes(f.type.toLowerCase()) ||
        f.isPrimary || f.customReadOnly || f.customAutoIncrement
      )
    }
  };

  return JSON.stringify(formStructure, null, 2);
}

export function importFormJSON(
  jsonData: any,
  datasets: any[],
  selectedDataset: string | null
): {
  formFields: FormField[];
  webformName?: string;
  firstTableId?: string;
} {
  // Validate the JSON structure
  if (!jsonData || !jsonData.tables || !Array.isArray(jsonData.tables)) {
    throw new Error('Invalid JSON format. Expected a form configuration with tables array.');
  }

  // Process tables from JSON and restore form fields
  const restoredFields: FormField[] = [];
  let firstTableId: string | null = null;

  jsonData.tables.forEach((table: any, tableIndex: number) => {
    if (table.elements && Array.isArray(table.elements)) {
      table.elements.forEach((element: any, elementIndex: number) => {
        if (element.type === 'FIELD') {
          // Find the corresponding field in available datasets
          const selectedDatasetObj = datasets.find(d => d.id === selectedDataset);
          const tableData = selectedDatasetObj?.tables.find(t => t.name === table.name);
          const fieldData = tableData?.fields.find(f => f.name === element.name);

          if (fieldData && tableData) {
            // Set the first table ID we encounter
            if (firstTableId === null) {
              firstTableId = tableData.id;
            }

            const formField: FormField = {
              ...fieldData,
              formId: `restored_${tableData.id}_${fieldData.id}_${Date.now()}_${elementIndex}`,
              tableId: tableData.id,

              // Override field type if specified in JSON
              type: element.fieldType || fieldData.type,

              // Basic properties
              customTitle: element.title || fieldData.name,
              customTooltip: element.tooltip || fieldData.description,
              customRequired: element.showRequiredCharacter ?? fieldData.required,
              isPrimary: element.isPrimary || false,

              // Advanced properties
              customReadOnly: element.readOnly ?? fieldData.readOnly,
              customIsVisible: element.isVisible ?? fieldData.isVisible,
              customAutoIncrement: element.autoIncrement ?? fieldData.autoIncrement,
              customLevel: element.level ?? fieldData.level,

              // Placeholder text
              customPlaceholder: element.placeholder,

              // Codelist items
              customCodelistItems: element.codelistItems || fieldData.codelistItems,

              // Dependencies and references
              dependency: element.dependency ? {
                field: element.dependency.field,
                value: element.dependency.value
              } : undefined,
              referenceParentField: element.referenceParentField,
              referenceParentTable: element.referenceParentTable
            };
            restoredFields.push(formField);
          }
        }
      });
    }
  });

  return {
    formFields: restoredFields,
    webformName: jsonData.webformName,
    firstTableId: firstTableId || undefined
  };
}