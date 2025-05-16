/**
 * Represents a form field node in the tree
 */
export interface FormFieldNode {
  id: string;
  type: string;
  label: string;
  children?: FormFieldNode[];
  placeholder?: string;
  required?: boolean;
  options?: {label: string; value: string}[];
  defaultValue?: any;
  validation?: any;
}

/**
 * Represents a regular form section containing fields
 */
export interface FormSection {
  id: string;
  title: string;
  fields: FormFieldNode[];
}

/**
 * Represents a group section containing multiple form sections
 */
export interface FormGroupSection {
  id: string;
  title: string;
  sections: FormSection[];
}

/**
 * Represents the complete form tree data structure
 */
export interface FormTreeData {
  sections: (FormSection | FormGroupSection)[];
}

/**
 * Props for FormTreeView component
 */
export interface FormTreeViewProps {
  formData: FormTreeData;
} 