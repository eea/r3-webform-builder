interface ConnectionData {
  environment: string;
  apiKey: string;
  dataflowId: string;
}

interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface Table {
  id: string;
  name: string;
  fields: Field[];
}

interface Dataset {
  id: string;
  name: string;
  tables: Table[];
}

async function fetchTablesForDataset(connection: ConnectionData, datasetId: string): Promise<Table[]> {
  const { environment, apiKey, dataflowId } = connection;

  const currentEnvironment = environment === 'production' ? '' : `${environment}-`;
  const apiBaseURL = `https://${currentEnvironment}api.reportnet.europa.eu`;

  // The correct API endpoint for dataset schema/tables
  const datasetSchemaURL = `${apiBaseURL}/dataschema/v1/datasetId/${datasetId}`;

  try {
    console.log(`Fetching tables for dataset ${datasetId} from:`, datasetSchemaURL);

    const response = await fetch(datasetSchemaURL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${apiKey}`,
        'Access-Control-Allow-Methods': 'GET',
      }
    });

    console.log(`Dataset ${datasetId} schema response status:`, response.status);

    if (!response.ok) {
      console.warn(`Failed to fetch schema for dataset ${datasetId}: ${response.status}`);
      // Return empty array if schema fetch fails instead of throwing
      return [];
    }

    const schemaData = await response.json();
    console.log(`Dataset ${datasetId} schema response:`, schemaData);

    // Parse the schema response to extract tables
    // Based on the API structure, tables should be in tableSchemas array
    if (schemaData.tableSchemas && Array.isArray(schemaData.tableSchemas)) {
      return schemaData.tableSchemas.map((table: any, index: number) => ({
        id: table.idTableSchema?.toString() || table.tableSchemaId?.toString() || table.id?.toString() || `table_${index}`,
        name: table.nameTableSchema || table.name || 'Unnamed Table',
        fields: parseTableFields(table.recordSchema?.fieldSchema || [])
      }));
    }

    // Also check if it's a direct array of tables
    if (Array.isArray(schemaData)) {
      return schemaData.map((table: any, index: number) => ({
        id: table.idTableSchema?.toString() || table.tableSchemaId?.toString() || table.id?.toString() || `table_${index}`,
        name: table.nameTableSchema || table.name || 'Unnamed Table',
        fields: parseTableFields(table.recordSchema?.fieldSchema || [])
      }));
    }

    // If no tables found in expected format, return empty array
    console.warn(`No tables found in schema for dataset ${datasetId}`, schemaData);
    return [];

  } catch (error) {
    console.error(`Error fetching tables for dataset ${datasetId}:`, error);
    // Return empty array instead of throwing to not break the entire datasets fetch
    return [];
  }
}

function parseTableFields(fieldsData: any[]): Field[] {
  if (!Array.isArray(fieldsData)) {
    return [];
  }

  return fieldsData.map((field: any) => ({
    id: field.id?.toString() || field.fieldSchemaId?.toString() || '',
    name: field.name || field.headerName || 'Unnamed Field',
    type: mapFieldType(field.type || field.typeData),
    required: field.required || field.requiredField || false,
    description: field.description || ''
  }));
}

function mapFieldType(apiType: string): string {
  // Map API field types to form input types
  switch (apiType?.toLowerCase()) {
    case 'text':
    case 'string':
      return 'text';
    case 'email':
      return 'email';
    case 'number':
    case 'integer':
    case 'decimal':
      return 'number';
    case 'date':
    case 'datetime':
      return 'date';
    case 'boolean':
      return 'checkbox';
    case 'textarea':
    case 'longtext':
      return 'textarea';
    case 'select':
    case 'dropdown':
      return 'select';
    case 'phone':
    case 'telephone':
      return 'tel';
    default:
      return 'text';
  }
}

export async function fetchDatasets(connection: ConnectionData): Promise<Dataset[]> {
  const { environment, apiKey, dataflowId } = connection;

  const currentEnvironment = environment === 'production' ? '' : `${environment}-`;
  const apiBaseURL = `https://${currentEnvironment}api.reportnet.europa.eu`;
  const apiDataflowURL = `${apiBaseURL}/dataflow/v1/${dataflowId}`;

  try {
    const response = await fetch(apiDataflowURL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${apiKey}`,
        'Access-Control-Allow-Methods': 'GET',
      }
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dataflow response:', data);

    if (!data.designDatasets || data.designDatasets.length === 0) {
      throw new Error('No datasets found in the dataflow.');
    }

    // Fetch tables for each dataset
    const datasetsWithTables = await Promise.all(
      data.designDatasets.map(async (dataset: any) => {
        const datasetId = dataset.id?.toString() || '';
        const tables = await fetchTablesForDataset(connection, datasetId);

        return {
          id: datasetId,
          name: dataset.dataSetName || 'Unnamed Dataset',
          tables: tables
        };
      })
    );

    return datasetsWithTables;

  } catch (error) {
    console.error('Error fetching datasets:', error);
    throw error;
  }
}