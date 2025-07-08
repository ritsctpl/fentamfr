export type FieldType = 
  | "text"
  | "number"
  | "date"
  | "select"
  | "boolean"
  | "lookup"
  | "formula"
  | "enum"
  | "image"
  | "file"
  | "signature";

export interface ValidationRules {
  min?: number;
  max?: number;
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface ColumnOption {
    label: string;
    value: string;
}

export interface ValidationRule {
    type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
    value?: any;
    message?: string;
    pattern?: string;
    customValidator?: (value: any) => boolean;
}

export interface Validation {
    min?: number;
    max?: number;
    maxLength?: number;
    required?: boolean;
    pattern?: string;
    customRule?: ValidationRule[];
}

export interface Column {
    fieldId: string;
    fieldName: string;
    fieldType: FieldType;
    unit?: string;
    precision?: number;
    required?: boolean;
    readOnly?: boolean;
    defaultValue?: any;
    validation?: ValidationRules;
    options?: FieldOption[];
    formula?: string;
    endpoint?: string;
    bindField?: string;
    multiline?: boolean;
    maxLength?: number;
    rows?: number;
    captureCamera?: boolean;
    fileTypes?: string[];
    maxSizeMb?: number;
    signedByRole?: string[];
    visibilityCondition?: string;
}

export interface HeaderStructure {
    id: string;
    label: string;
    columns?: string[];
    children?: HeaderStructure[];
}

export interface RowControls {
    mode: 'fixed' | 'growing';
    minRows?: number;
    maxRows?: number;
    allowAddRemove?: boolean;
    initialRows?: number;
}

export interface PaginationConfig {
    enabled: boolean;
    rowsPerPage: number;
}

export interface ColumnLayout {
    columnCount: number;
    columnWidthMode: 'auto' | 'fixed';
    stickyHeaders: boolean;
    resizableColumns: boolean;
}

export interface TableStyle {
    tableBorder: boolean;
    stripedRows: boolean;
    alternateRowColor: string;
    headerColor: string;
    headerFontColor: string;
}

export interface TemplateData {
    headerStructure?: HeaderStructure[];
    columns: Column[];
    preloadRows?: Record<string, any>[];
    rowControls?: RowControls;
    pagination?: PaginationConfig;
    columnLayout?: ColumnLayout;
    style?: TableStyle;
}

export interface UserData {
    [key: string]: any;
}