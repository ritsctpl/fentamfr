import { CSSProperties } from 'react';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface TableColumn {
    title: string;
    dataIndex: string;
    key: string;
    render?: (text: any) => React.ReactNode;
}

export interface TableProps {
    columns?: TableColumn[];
    size?: 'small' | 'middle' | 'large';
    bordered?: boolean;
    pagination?: {
        pageSize?: number;
        showSizeChanger?: boolean;
    };
}

export interface ApiConfig {
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: string;
    bodySource?: {
        type: 'form' | 'manual' | 'both';
        formId?: string;
        mergeStrategy?: 'spread' | 'nested';
        formDataKey?: string;
    };
    responseMapping?: Array<{
        targetProperty: string;
        sourcePath: string;
    }>;
    arrayPath?: string;
    tableResponseKey?: string;
    queryParams?: Record<string, string>;
}

export interface QueryConfig {
    query: string;
    body?: string;
    bodySource?: {
        type: 'form' | 'manual' | 'both';
        formId?: string;
        mergeStrategy?: 'spread' | 'nested';
        formDataKey?: string;
    };
    arrayPath?: string;
    responseMapping?: Array<{
        targetProperty: string;
        sourcePath: string;
    }>;
}

export interface FlowConnectConfig {
    type: 'onClick' | 'onHover' | 'onPageLoad';
    points: ('api' | 'query')[];
    api?: ApiConfig;
    query?: QueryConfig;
    targetComponent?: string;
    data?: any;
}

export interface TextInputConfig {
    label?: string;
    defaultValue?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    size?: 'small' | 'middle' | 'large';
    allowClear?: boolean;
    maxLength?: number;
    showCount?: boolean;
    type?: 'text' | 'password' | 'number' | 'email';
    layout?: 'vertical' | 'horizontal';
    url?: string;
    arrayParameter?: string;
    fieldValue?: string;
    payload?: any;
    customOptions?: any;
    multiple?: any;
}

export interface WidgetStyles extends React.CSSProperties {
    tableProps?: TableProps;
    // TextInput specific styles
    textInputConfig?: TextInputConfig;
    labelStyle?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
    // Card specific styles
    titleColor?: string;
    titleFontSize?: string;
    titleFontWeight?: string | number;
    titleAlign?: 'left' | 'center' | 'right';
    titlePadding?: string;
    contentPadding?: string;
    contentBackground?: string;
    contentLayout?: 'vertical' | 'horizontal';
    contentGap?: string;
    borderStyle?: string;
    borderWidth?: string;
    borderColor?: string;
    shadowType?: 'none' | 'light' | 'medium' | 'strong' | 'custom';
    hoverShadow?: string;
    hoverScale?: string;
    hoverBorderColor?: string;
}

export interface FormFieldOption {
    label: string;
    value: string | number;
}

export interface FormFieldRule {
    required?: boolean;
    message?: string;
    pattern?: RegExp;
    min?: number;
    max?: number;
}

export interface FormField {
    name: string;
    label?: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: Array<{ label: string; value: any }>;
    group?: string;
    rules?: any[];
    defaultValue?: any;
    props?: Record<string, any>;
    disabled?: boolean;
    url?: string;
    arrayParameter?: string;
    fieldName?: string;
    fieldValue?: string;
    payload?: any;
    startTimeFieldName?: string;
    endTimeFieldName?: string;
    customOptions?: any;
    multiple?: any;
}

export interface EnhancedFormField extends FormField {
    layout?: FieldLayout;
    group?: string;
}

export interface ButtonConfig {
    text?: string;
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    size?: 'small' | 'middle' | 'large';
    style?: React.CSSProperties;
    visible?: boolean;
    onClick?: () => void;
    hidden?: boolean;
}

export interface FormButtonsConfig {
    submit?: ButtonConfig;
    cancel?: ButtonConfig;
    buttonSpacing?: number;
    buttonAlign?: 'left' | 'center' | 'right' | 'space-between' | 'space-around';
}

export interface FormStyles extends WidgetStyles {
    formLayout?: 'horizontal' | 'vertical' | 'inline';
    labelWidth?: string | number;
    fieldSpacing?: number;
    labelAlign?: 'left' | 'right';
    submitText?: string;
    // Layout customization
    layoutType?: 'default' | 'grid' | 'flex';
    columns?: number;
    gutter?: [number, number];
    wrap?: boolean;
    justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around';
    align?: 'top' | 'middle' | 'bottom';
    grouping?: {
        enabled: boolean;
        spacing: number;
    };
    containerStyle?: React.CSSProperties;
    contentStyle?: React.CSSProperties;
    buttonContainerStyle?: React.CSSProperties;
    fieldStyle?: React.CSSProperties;
    groupStyle?: {
        container?: React.CSSProperties;
        title?: React.CSSProperties;
        content?: React.CSSProperties;
    };
    buttons?: FormButtonsConfig;
}

export interface FormSubmitConfig {
    targetComponent: string;
    api?: ApiConfig;
    updateType?: 'data' | 'text' | 'props'; // How to update the target component
}

export interface VisibilityCondition {
    referenceComponent: {
        componentId: string;
        field: string;
    };
    condition: string;
    value: any;
    operator?: 'AND' | 'OR';
}

export interface ConditionalVisibility {
    enabled?: boolean;
    conditions: VisibilityCondition[];
    action?: 'show' | 'hide';
}

export interface DashboardWidget {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    parentId?: string;
    children: string[];
    lastSubmittedValues?: Record<string, any>;
    props: {
        style?: WidgetStyles | FormStyles;
        text?: string;
        buttonType?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
        size?: 'large' | 'middle' | 'small';
        level?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
        flowConnect?: FlowConnectConfig;
        tableProps?: TableProps;
        customCss?: string;
        hidden?: boolean;
        formFields?: FormField[];
        formSubmit?: FormSubmitConfig;
        conditionalVisibility?: ConditionalVisibility;
    };
}

export interface LayoutConfig {
    type: 'default' | 'grid' | 'flex';
    columns: number;
    gutter: [number, number];
    justify: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
    align: 'top' | 'middle' | 'bottom';
    wrap: boolean;
    fieldSpacing: number;
    grouping: {
        enabled: boolean;
        spacing: number;
    };
}

export interface FieldLayout {
    span?: number;
    offset?: number;
    order?: number;
} 