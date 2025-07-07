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
    field_id: string;
    field_name: string;
    field_type: FieldType;
    unit?: string;
    precision?: number;
    required?: boolean;
    read_only?: boolean;
    default_value?: any;
    validation?: ValidationRules;
    options?: FieldOption[];
    formula?: string;
    endpoint?: string;
    bind_field?: string;
    multiline?: boolean;
    max_length?: number;
    rows?: number;
    capture_camera?: boolean;
    file_types?: string[];
    max_size_mb?: number;
    signed_by_role?: string[];
    visibility_condition?: string;
}

export interface HeaderStructure {
    id: string;
    label: string;
    columns?: string[];
    children?: HeaderStructure[];
}

export interface RowControls {
    mode: 'fixed' | 'growing';
    min_rows?: number;
    max_rows?: number;
    allow_add_remove?: boolean;
    initial_rows?: number;
}

export interface PaginationConfig {
    enabled: boolean;
    rows_per_page: number;
}

export interface ColumnLayout {
    column_count: number;
    column_width_mode: 'auto' | 'fixed';
    sticky_headers: boolean;
    resizable_columns: boolean;
}

export interface TableStyle {
    table_border: boolean;
    striped_rows: boolean;
    alternate_row_color: string;
    header_color: string;
    header_font_color: string;
}

export interface TemplateData {
    header_structure?: HeaderStructure[];
    columns: Column[];
    preload_rows?: Record<string, any>[];
    row_controls?: RowControls;
    pagination?: PaginationConfig;
    column_layout?: ColumnLayout;
    style?: TableStyle;
}

export interface UserData {
    [key: string]: any;
}