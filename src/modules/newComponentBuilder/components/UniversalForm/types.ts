import { ReactNode } from 'react';

export type FieldType = 'text' | 'enum' | 'boolean' | 'lookup' | 'formula';
export type DisplayMode = 'static' | 'prefilled'| '';
export type DataSource = 'user_input' | 'api' | 'formula';
export type LabelPosition = 'left' | 'top';
export type Alignment = 'left' | 'right' | 'center';

export interface Option {
  label: string;
  value: string;
}

export interface RoleControl {
  editableBy: string[];
}

export interface BindingFields {
  [key: string]: 'user_input' | 'api';
}

export interface FormField {
  fieldId: string;
  fieldName: string;
  fieldType: FieldType;
  displayMode?: DisplayMode;
  instructionLevel?: string;
  multiline?: boolean;
  rows?: number;
  content?: string[];
  dataSource?: DataSource;
  apiEndpoint?: string;
  endpoint?: string;
  bindField?: string;
  required?: boolean;
  roleControl?: RoleControl;
  readOnly?: boolean;
  labelPosition?: LabelPosition;
  alignment?: Alignment;
  layoutColumn?: number;
  order?: number;
  maxLength?: number;
  options?: Option[];
  defaultValue?: string | boolean | number | object;
  unit?: string;
  precision?: number;
  formula?: string;
  templateText?: string;
  bindingFields?: BindingFields;
}

export interface FieldEditorTab {
  key: string;
  label: string;
  icon?: ReactNode;
}

export interface FieldModalProps {
  visible: boolean;
  field?: FormField;
  onSave: (field: FormField) => void;
  onCancel: () => void;
  availableFields?: FormField[]; // For formula field references
}

export interface FieldListProps {
  templateData: FormField[];
  onEdit?: (field: FormField) => void;
  onDelete?: (field: FormField) => void;
  canEditField: (field: FormField) => boolean;
  showDebugPanel?: boolean;
}

export interface FieldCardProps {
  field: FormField;
  onEdit?: (field: FormField) => void;
  onDelete?: (field: FormField) => void;
  showDebug?: boolean;
}

export interface ToolbarProps {
  onAdd: () => void;
  onSettings: () => void;
  onToggleDebug: () => void;
  showDebug: boolean;
}

export interface TemplateSettings {
  name: string;
  description: string;
  version: string;
  allowedRoles: string[];
}

export interface SettingsPanelProps {
  visible: boolean;
  settings?: TemplateSettings;
  onSave: (settings: TemplateSettings) => void;
  onClose: () => void;
}

export interface UniversalFormProps {
  setFields?
  editMode?: boolean;
  userRole?: string;
  onSave?: (template: { settings: TemplateSettings; fields: FormField[] }) => void;
} 