export interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface FormField extends Field {
  formId: string;
  tableId: string;
  customTitle?: string;
  customTooltip?: string;
  customPlaceholder?: string;
  customRequired?: boolean;
  isPrimary?: boolean;
}

export interface FormBuilderViewProps {
  selectedFields: FormField[];
  onRemoveField: (formId: string) => void;
  onGenerateJSON: () => void;
  onClearForm: () => void;
}
