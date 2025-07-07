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
  editable_by: string[];
}

export interface BindingFields {
  [key: string]: 'user_input' | 'api';
}

export interface FormField {
  field_id: string;
  field_name: string;
  field_type: FieldType;
  display_mode?: DisplayMode;
  instruction_level?: string;
  multiline?: boolean;
  rows?: number;
  content?: string[];
  data_source?: DataSource;
  api_endpoint?: string;
  endpoint?: string;
  bind_field?: string;
  required?: boolean;
  role_control?: RoleControl;
  read_only?: boolean;
  label_position?: LabelPosition;
  alignment?: Alignment;
  layout_column?: number;
  order?: number;
  max_length?: number;
  options?: Option[];
  default_value?: string | boolean | number | object;
  unit?: string;
  precision?: number;
  formula?: string;
  template_text?: string;
  binding_fields?: BindingFields;
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