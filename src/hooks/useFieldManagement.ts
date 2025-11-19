import type { Dispatch, SetStateAction } from 'react';
import type { FormField } from '../types/formBuilder';

interface UseFieldManagementProps {
  formFields: FormField[];
  setFormFields: Dispatch<SetStateAction<FormField[]>>;
  selectedFormField: FormField | null;
  setSelectedFormField: Dispatch<SetStateAction<FormField | null>>;
  onRemoveField: (formId: string) => void;
}

export function useFieldManagement({
  formFields,
  setFormFields,
  selectedFormField,
  setSelectedFormField,
  onRemoveField,
}: UseFieldManagementProps) {
  /**
   * Remove a field from the form
   */
  const handleRemoveField = (formId: string) => {
    setFormFields((prev) => prev.filter((f) => f.formId !== formId));
    onRemoveField(formId);
    if (selectedFormField?.formId === formId) {
      setSelectedFormField(null);
    }
  };

  /**
   * Update a property of a form field
   */
  const handleUpdateFieldProperty = (formId: string, property: string, value: any) => {
    setFormFields((prev) =>
      prev.map((field) => (field.formId === formId ? { ...field, [property]: value } : field))
    );

    if (selectedFormField?.formId === formId) {
      setSelectedFormField((prev) => (prev ? { ...prev, [property]: value } : null));
    }
  };

  return {
    handleRemoveField,
    handleUpdateFieldProperty,
  };
}
