import { useState } from 'react';
import type { FormField } from '../types/formBuilder';

interface UseFormBuilderStateProps {
  initialFields: FormField[];
}

export function useFormBuilderState({ initialFields }: UseFormBuilderStateProps) {
  // UI State
  const [showJSON, setShowJSON] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);

  // Form State
  const [formFields, setFormFields] = useState<FormField[]>(initialFields);
  const [selectedFormField, setSelectedFormField] = useState<FormField | null>(null);

  // Table Properties Editing State
  const [editingTableProperties, setEditingTableProperties] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editLabel, setEditLabel] = useState('');

  // Layout State
  const [blockOrderMap, setBlockOrderMap] = useState<Record<string, number[]>>({});
  const [tabOrder, setTabOrder] = useState<string[]>([]);

  return {
    // UI State
    showJSON,
    setShowJSON,
    showPreview,
    setShowPreview,
    showPushModal,
    setShowPushModal,

    // Form State
    formFields,
    setFormFields,
    selectedFormField,
    setSelectedFormField,

    // Table Properties Editing State
    editingTableProperties,
    setEditingTableProperties,
    editTitle,
    setEditTitle,
    editLabel,
    setEditLabel,

    // Layout State
    blockOrderMap,
    setBlockOrderMap,
    tabOrder,
    setTabOrder,
  };
}
