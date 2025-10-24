export interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
  codelistItems?: string[];
  level?: number;
  readOnly?: boolean;
  autoIncrement?: boolean;
  isVisible?: boolean;
  pk?: boolean;
}

export interface FormField extends Field {
  formId: string;
  tableId: string;
  customTitle?: string;
  customTooltip?: string;
  customPlaceholder?: string;
  customRequired?: boolean;
  isPrimary?: boolean;
  customLevel?: number;
  customReadOnly?: boolean;
  customAutoIncrement?: boolean;
  customIsVisible?: boolean;
  customCodelistItems?: string[];
  dependency?: {
    field: string;
    value: string[] | null;
  };
  referenceParentField?: string;
  referenceParentTable?: string;
}

export interface FormBuilderViewProps {
  selectedFields: FormField[];
  onRemoveField: (formId: string) => void;
  onGenerateJSON: () => void;
  onClearForm: () => void;
}
