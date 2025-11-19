import type { MetadataEntry } from '../context/AppContext';

/**
 * Parses an identifier string like "[AirQualityDataFlows].[latest].[AirQualityStatistics].[AirPollutant]"
 * Returns the table name (second to last element) and field name (last element)
 */
export function parseIdentifier(identifier: string): { tableName: string; fieldName: string } | null {
  // Remove quotes if present
  const cleanIdentifier = identifier.replace(/^"|"$/g, '');

  // Extract all parts between brackets
  const parts = cleanIdentifier.match(/\[([^\]]+)\]/g);

  if (!parts || parts.length < 2) {
    return null;
  }

  // Remove brackets from each part
  const cleanParts = parts.map(part => part.replace(/\[|\]/g, ''));

  // Table name is second to last, field name is last
  const fieldName = cleanParts[cleanParts.length - 1];
  const tableName = cleanParts[cleanParts.length - 2];

  return { tableName, fieldName };
}

/**
 * Parses a CSV string containing metadata catalog entries
 * Returns an array of MetadataEntry objects with parsed table and field names
 */
export function parseMetadataCatalog(csvContent: string): MetadataEntry[] {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');

  if (lines.length === 0) {
    return [];
  }

  // Skip header line
  const dataLines = lines.slice(1);
  const entries: MetadataEntry[] = [];

  for (const line of dataLines) {
    // Parse CSV line (handles quoted fields with commas)
    const fields = parseCSVLine(line);

    if (fields.length < 5) {
      continue; // Skip invalid lines
    }

    const identifier = fields[0];
    const parentIdentifier = fields[1];
    const objectType = fields[2];
    const title = fields[3];
    const description = fields[4];

    // Parse the identifier to extract table and field names
    const parsed = parseIdentifier(identifier);

    const entry: MetadataEntry = {
      identifier,
      parentIdentifier,
      objectType,
      title,
      description,
      ...(parsed && {
        tableName: parsed.tableName,
        fieldName: parsed.fieldName
      })
    };

    entries.push(entry);
  }

  return entries;
}

/**
 * Parses a single CSV line, handling quoted fields that may contain commas
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Toggle quote state
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      // End of field
      fields.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Add the last field
  fields.push(currentField.trim());

  return fields;
}

/**
 * Finds the description for a specific field in a table from the metadata catalog
 */
export function findFieldDescription(
  metadataCatalog: MetadataEntry[],
  tableName: string,
  fieldName: string
): string | null {
  const entry = metadataCatalog.find(
    entry =>
      entry.tableName?.toLowerCase() === tableName.toLowerCase() &&
      entry.fieldName?.toLowerCase() === fieldName.toLowerCase() &&
      entry.objectType.toLowerCase() === 'column'
  );

  return entry?.description || null;
}

/**
 * Parses JSON metadata catalog (if the format is JSON instead of CSV)
 */
export function parseMetadataJSON(jsonContent: any): MetadataEntry[] {
  if (!Array.isArray(jsonContent)) {
    return [];
  }

  return jsonContent.map((item: any) => {
    const parsed = parseIdentifier(item.identifier || '');

    return {
      identifier: item.identifier || '',
      parentIdentifier: item.parentIdentifier || '',
      objectType: item.objectType || '',
      title: item.title || '',
      description: item.description || '',
      ...(parsed && {
        tableName: parsed.tableName,
        fieldName: parsed.fieldName
      })
    };
  });
}
