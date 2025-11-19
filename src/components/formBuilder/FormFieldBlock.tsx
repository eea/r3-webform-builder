import type { FormField } from '../../types/formBuilder';
import { renderInteractiveField } from '../../utils/formBuilder/fieldRenderers';
import {
  colors,
  getResponsiveFieldStyles,
  fieldBlockStyles,
  labelStyles,
  tooltipStyles,
} from './styles';

interface FormFieldBlockProps {
  fields: FormField[];
}

/**
 * Renders a group of fields, either as a single field or horizontal block
 */
export default function FormFieldBlock({ fields }: FormFieldBlockProps) {
  if (fields.length === 0) return null;

  // Single field rendering
  if (fields.length === 1) {
    return <SingleFieldRenderer field={fields[0]} />;
  }

  // Multiple fields - horizontal block
  return <HorizontalFieldsRenderer fields={fields} />;
}

/**
 * Renders a single field with its label and tooltip
 */
function SingleFieldRenderer({ field }: { field: FormField }) {
  const title = field.customTitle || field.name;
  const isRequired =
    field.customRequired !== undefined ? field.customRequired : field.required;
  const tooltip = field.customTooltip;

  // Label fields render without wrapper
  if (field.type.toLowerCase() === 'label') {
    return (
      <div key={field.formId} style={fieldBlockStyles.container}>
        {renderInteractiveField(field)}
      </div>
    );
  }

  return (
    <div
      key={field.formId}
      style={{
        ...fieldBlockStyles.container,
        ...(field.isPrimary ? fieldBlockStyles.primaryField : {}),
      }}
    >
      <FieldLabel
        title={title}
        isRequired={isRequired}
        isPrimary={field.isPrimary}
      />
      {tooltip && <FieldTooltip tooltip={tooltip} />}
      <FieldInput field={field} />
    </div>
  );
}

/**
 * Renders multiple fields in a horizontal layout
 */
function HorizontalFieldsRenderer({ fields }: { fields: FormField[] }) {
  const fieldCount = fields.length;
  const { gap, minWidth } = getResponsiveFieldStyles(fieldCount);

  return (
    <div
      style={{
        ...fieldBlockStyles.horizontalBlock,
        gap,
      }}
    >
      {fields.map((field) => (
        <HorizontalFieldItem
          key={field.formId}
          field={field}
          fieldCount={fieldCount}
          minWidth={minWidth}
        />
      ))}
    </div>
  );
}

/**
 * Individual field within a horizontal block
 */
function HorizontalFieldItem({
  field,
  fieldCount,
  minWidth,
}: {
  field: FormField;
  fieldCount: number;
  minWidth: string;
}) {
  const title = field.customTitle || field.name;
  const isRequired =
    field.customRequired !== undefined ? field.customRequired : field.required;
  const tooltip = field.customTooltip;

  // Label fields in horizontal blocks
  if (field.type.toLowerCase() === 'label') {
    return (
      <div
        key={field.formId}
        style={{
          flex: '1 1 0',
          minWidth: minWidth,
          maxWidth: fieldCount >= 4 ? '200px' : 'none',
        }}
      >
        {renderInteractiveField(field)}
      </div>
    );
  }

  return (
    <div
      key={field.formId}
      style={{
        flex: '1 1 0',
        minWidth: minWidth,
        maxWidth: fieldCount >= 4 ? '200px' : 'none',
        ...(field.isPrimary ? fieldBlockStyles.primaryFieldInBlock : { padding: '0.25rem' }),
      }}
    >
      <label
        style={{
          ...labelStyles.base,
          fontSize: fieldCount >= 4 ? '0.8rem' : '0.9rem',
          ...(field.isPrimary ? labelStyles.primary : {}),
          lineHeight: '1.2',
        }}
      >
        {title}
        {isRequired && (
          <span style={labelStyles.required}>*</span>
        )}
        {field.isPrimary && (
          <span
            style={{
              ...labelStyles.primaryBadge,
              fontSize: fieldCount >= 4 ? '0.6rem' : '0.7rem',
              marginLeft: '0.3rem',
              padding: '0.1rem 0.3rem',
              borderRadius: '8px',
            }}
          >
            Primary
          </span>
        )}
      </label>

      {tooltip && (
        <div
          style={{
            ...tooltipStyles,
            fontSize: fieldCount >= 4 ? '0.7rem' : '0.8rem',
            lineHeight: '1.2',
          }}
        >
          {tooltip}
        </div>
      )}

      <div
        style={{
          fontSize: fieldCount >= 4 ? '0.8rem' : '0.9rem',
        }}
      >
        <FieldInput field={field} />
      </div>
    </div>
  );
}

/**
 * Reusable field label component
 */
function FieldLabel({
  title,
  isRequired,
  isPrimary,
}: {
  title: string;
  isRequired: boolean;
  isPrimary?: boolean;
}) {
  return (
    <label
      style={{
        ...labelStyles.base,
        ...(isPrimary ? labelStyles.primary : {}),
      }}
    >
      {title}
      {isRequired && <span style={labelStyles.required}>*</span>}
      {isPrimary && (
        <span style={labelStyles.primaryBadge}>Primary</span>
      )}
    </label>
  );
}

/**
 * Reusable field tooltip component
 */
function FieldTooltip({ tooltip }: { tooltip: string }) {
  return <div style={tooltipStyles}>{tooltip}</div>;
}

/**
 * Handles field input rendering with checkbox special case
 */
function FieldInput({ field }: { field: FormField }) {
  if (field.type !== 'checkbox') {
    return <>{renderInteractiveField(field)}</>;
  }

  return (
    <div style={{ marginTop: '0.25rem' }}>
      {renderInteractiveField(field)}
    </div>
  );
}