import React, { useState, useEffect } from 'react';
import { Button, Typography, Table, message } from 'antd';
import { useDroppable } from '@dnd-kit/core';
import { DEFAULT_STYLES } from './hooks/constants';
import {
    TableColumn,
    WidgetStyles,
    FormField,
    FormStyles,
    FormSubmitConfig,
    LayoutConfig,
    EnhancedFormField,
    ConditionalVisibility,
    VisibilityCondition
} from './types';
import Gauge from './components/chart/GaugeChart';
import MainCard from './components/card/MainCard';
import BarChart from './components/chart/BarChart';
import LineChart from './components/chart/LineChart';
import DynamicForm from './components/form/DynamicForm';
import CommonAppBar from '@components/CommonAppBar';
import TextInput from './components/inputs/TextInput';
import Browse from './components/inputs/Browse';

const { Text, Title } = Typography;

interface TableProps {
    columns?: TableColumn[];
    dataSource?: any[];
    size?: 'small' | 'middle' | 'large';
    bordered?: boolean;
    pagination?: {
        pageSize?: number;
        showSizeChanger?: boolean;
    };
}

interface WidgetRendererProps {
    id: string;
    name?: string;
    type: string;
    style?: WidgetStyles;
    isSelected?: boolean;
    onSelect?: () => void;
    children?: React.ReactNode;
    text?: string;
    buttonType?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    size?: 'large' | 'middle' | 'small';
    level?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
    tableProps?: TableProps;
    onWidgetClick?: () => void;
    onWidgetHover?: () => void;
    dataSource?: any[];
    columns?: TableColumn[];
    loading?: boolean;
    hidden?: boolean;
    isEditMode?: boolean;
    formFields?: EnhancedFormField[];
    formLayoutConfig?: LayoutConfig;
    onFormSubmit?: (values: any) => void;
    formSubmit?: FormSubmitConfig;
    onDataUpdate?: (data: any) => void;
    conditionalVisibility?: ConditionalVisibility;
    allComponents?: Record<string, any>;
    formData?: Record<string, any>;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
    id,
    name,
    type,
    style,
    isSelected,
    onSelect,
    onWidgetClick,
    onWidgetHover,
    children,
    text,
    buttonType = 'primary',
    size = 'middle',
    level = 'normal',
    tableProps,
    dataSource,
    columns,
    loading,
    hidden,
    isEditMode = false,
    formFields,
    formLayoutConfig,
    onFormSubmit,
    formSubmit,
    onDataUpdate,
    conditionalVisibility,
    allComponents,
    formData
}) => {
    const { setNodeRef } = useDroppable({ id });
    const [isVisible, setIsVisible] = useState(true);

    // Check conditional visibility
    useEffect(() => {
        console.log('Visibility effect triggered for widget:', id, {
            type,
            conditionalVisibility,
            formData,
            isEditMode
        });

        // Skip visibility check if conditions aren't met
        if (!conditionalVisibility?.enabled || !conditionalVisibility.conditions?.length || isEditMode) {
            console.log('Visibility check skipped for widget:', id, {
                enabled: conditionalVisibility?.enabled,
                hasConditions: !!conditionalVisibility?.conditions?.length,
                isEditMode
            });
            setIsVisible(!hidden);
            return;
        }

        const evaluateCondition = (condition: VisibilityCondition): boolean => {
            const { componentId, field } = condition.referenceComponent;
            let referenceValue = formData?.[componentId]?.[field];

            // If no form data, try getting from component's last submitted values
            if (referenceValue === undefined && allComponents?.[componentId]?.lastSubmittedValues) {
                referenceValue = allComponents[componentId].lastSubmittedValues[field];
                console.log('Using lastSubmittedValues for visibility check:', {
                    componentId,
                    field,
                    referenceValue
                });
            }

            if (referenceValue === undefined) {
                return false;
            }

            // Convert values for comparison
            let compareValue = condition.value;
            let compareRefValue = referenceValue;

            // Handle array values
            if (typeof compareValue === 'string' && compareValue.startsWith('[') && compareValue.endsWith(']')) {
                try {
                    compareValue = JSON.parse(compareValue);
                } catch (e) {
                    console.error('Failed to parse array value:', compareValue);
                    return false;
                }
            }

            // Convert boolean strings
            if (compareValue === 'true') compareValue = true;
            if (compareValue === 'false') compareValue = false;

            console.log('Comparing values for visibility:', {
                compareValue,
                compareRefValue,
                condition: condition.condition,
                isArray: Array.isArray(compareValue),
                refIsArray: Array.isArray(compareRefValue)
            });

            // Array comparison helper function
            const arraysEqual = (a: any[], b: any[]) => {
                if (!Array.isArray(a) || !Array.isArray(b)) return false;
                if (a.length !== b.length) return false;
                return a.every((val, index) => val === b[index]);
            };

            switch (condition.condition) {
                case '==':
                case '===':
                    if (Array.isArray(compareValue) && Array.isArray(compareRefValue)) {
                        return arraysEqual(compareValue, compareRefValue);
                    }
                    return compareRefValue === compareValue;
                case '!=':
                case '!==':
                    if (Array.isArray(compareValue) && Array.isArray(compareRefValue)) {
                        return !arraysEqual(compareValue, compareRefValue);
                    }
                    return compareRefValue !== compareValue;
                case '>':
                    return compareRefValue > compareValue;
                case '>=':
                    return compareRefValue >= compareValue;
                case '<':
                    return compareRefValue < compareValue;
                case '<=':
                    return compareRefValue <= compareValue;
                case 'contains':
                    if (Array.isArray(compareRefValue)) {
                        return Array.isArray(compareValue) ? 
                            compareValue.every(v => compareRefValue.includes(v)) :
                            compareRefValue.includes(compareValue);
                    }
                    return String(compareRefValue).includes(String(compareValue));
                case 'notContains':
                    if (Array.isArray(compareRefValue)) {
                        return Array.isArray(compareValue) ? 
                            !compareValue.every(v => compareRefValue.includes(v)) :
                            !compareRefValue.includes(compareValue);
                    }
                    return !String(compareRefValue).includes(String(compareValue));
                case 'startsWith':
                    return String(compareRefValue).startsWith(String(compareValue));
                case 'endsWith':
                    return String(compareRefValue).endsWith(String(compareValue));
                default:
                    return false;
            }
        };

        // Evaluate conditions sequentially with their operators
        let finalResult = evaluateCondition(conditionalVisibility.conditions[0]);
        
        for (let i = 1; i < conditionalVisibility.conditions.length; i++) {
            const condition = conditionalVisibility.conditions[i];
            const currentResult = evaluateCondition(condition);
            
            if (condition.operator === 'AND') {
                finalResult = finalResult && currentResult;
            } else {
                finalResult = finalResult || currentResult;
            }
        }

        console.log('Visibility evaluation for widget:', id, {
            conditions: conditionalVisibility.conditions.map((c, i) => ({
                index: i,
                operator: c.operator,
                result: evaluateCondition(c)
            })),
            finalResult,
            action: conditionalVisibility.action
        });

        setIsVisible(conditionalVisibility.action === 'show' ? finalResult : !finalResult);
    }, [id, type, conditionalVisibility, hidden, allComponents, formData, isEditMode]);

    if (conditionalVisibility?.enabled && !isVisible && !isEditMode) {
        return null;
    }

    if (hidden) {
        return null;
    }

    const baseStyle: React.CSSProperties = {
        outline: isSelected ? '2px solid #1890ff' : 'none',
        cursor: isEditMode ? 'pointer' : 'default',
        position: style?.position || 'relative',
        zIndex: 1
    };

    const handleClick = (e: React.MouseEvent) => {
        if (isEditMode) {
            e.stopPropagation();
            onSelect?.();
        } else {
            onWidgetClick?.();
        }
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (!isEditMode) {
            onWidgetHover?.();
        }
    };

    const renderTextContent = () => {
        const content = text || '';

        switch (level) {
            case 'h1':
                return <Title level={1}>{content}</Title>;
            case 'h2':
                return <Title level={2}>{content}</Title>;
            case 'h3':
                return <Title level={3}>{content}</Title>;
            case 'h4':
                return <Title level={4}>{content}</Title>;
            case 'h5':
                return <Title level={5}>{content}</Title>;
            default:
                return <Text>{content}</Text>;
        }
    };

    switch (type) {
        case 'button':
            return (
                <Button
                    ref={setNodeRef}
                    type={buttonType}
                    size={size}
                    style={{
                        ...DEFAULT_STYLES.button,
                        ...style,
                        ...baseStyle,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={handleClick}
                    loading={loading}
                    onMouseEnter={handleMouseEnter}
                >
                    {text || 'Button'}
                </Button>
            );

        case 'table':
            const effectiveDataSource = dataSource || tableProps?.dataSource || [];
            const effectiveColumns = columns || tableProps?.columns || [];
            
            // Add logging to track data
            console.log('Table data in WidgetRenderer:', {
                widgetId: id,
                rawDataSource: dataSource,
                tablePropsDataSource: tableProps?.dataSource,
                effectiveDataSource,
                dataLength: effectiveDataSource.length
            });

            // Ensure we have a clean copy of the data and add unique keys
            const cleanDataSource = React.useMemo(() => {
                return Array.isArray(effectiveDataSource) ? 
                    effectiveDataSource.map((record, index) => ({
                        ...record,
                        __uniqueKey: `${id}-${index}-${record.workcenter_id || ''}-${record.day || ''}`
                    })) : 
                    [];
            }, [JSON.stringify(effectiveDataSource), id]);

            return (
                <div
                    ref={setNodeRef}
                    style={{
                        ...DEFAULT_STYLES.table,
                        ...style,
                        ...baseStyle,
                        overflow: 'auto'
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    <Table
                        columns={effectiveColumns}
                        dataSource={cleanDataSource}
                        size={tableProps?.size || 'middle'}
                        bordered={tableProps?.bordered !== false}
                        pagination={false}
                        // scroll={{ x: effectiveColumns?.length * 200, y: '100%' }}
                        rowKey="__uniqueKey"
                        loading={loading}
                    />
                </div>
            );

        case 'text':
            const content = text || '';
            let displayText = content;

            // Handle array data mapping
            if (content.includes('{') && content.includes('}') && dataSource) {
                const matches = content.match(/\{([^}]+)\}/g);
                if (matches) {
                    displayText = matches.reduce((acc, match) => {
                        const key = match.replace(/[{}]/g, '');
                        let value = '';
                        
                        if (Array.isArray(dataSource) && dataSource.length > 0) {
                            // Add debug logs
                            console.log('Data source:', dataSource[0]);
                            console.log('Looking for key:', key);
                            console.log('Found value:', dataSource[0][key]);
                            
                            value = dataSource[0][key];
                            // Format number if needed
                            if (typeof value === 'number') {
                                value = Number(value).toFixed(2);
                            }
                            // Handle undefined or null values
                            if (value === undefined || value === null) {
                                console.warn(`Value for key ${key} is ${value}`);
                                value = '';
                            }
                        } else if (typeof dataSource === 'object' && dataSource !== null) {
                            value = dataSource[key];
                        }
                        
                        const replacedText = acc.replace(match, value || '');
                        console.log('Replacing', match, 'with', value, 'Result:', replacedText);
                        return replacedText;
                    }, content);
                }
            }

            return (
                <div
                    ref={setNodeRef}
                    style={{
                        ...DEFAULT_STYLES.text,
                        ...style,
                        ...baseStyle,
                        width: style?.width || 'auto',
                        minWidth: '50px',
                        textAlign: style?.textAlign || 'left',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    {level === 'h1' ? <Title level={1}>{displayText}</Title> :
                     level === 'h2' ? <Title level={2}>{displayText}</Title> :
                     level === 'h3' ? <Title level={3}>{displayText}</Title> :
                     level === 'h4' ? <Title level={4}>{displayText}</Title> :
                     level === 'h5' ? <Title level={5}>{displayText}</Title> :
                     <Text>{displayText}</Text>}
                </div>
            );

        case 'div':
            return (
                <div
                    ref={setNodeRef}
                    style={{
                        ...DEFAULT_STYLES.div,
                        ...style,
                        ...baseStyle,
                        minHeight: style?.height || DEFAULT_STYLES.div.height,
                        minWidth: style?.width || DEFAULT_STYLES.div.width,
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: style?.flexDirection || 'column',
                        alignItems: style?.alignItems || 'flex-start',
                        justifyContent: style?.justifyContent || 'flex-start',
                        gap: style?.gap || '8px',
                        padding: style?.padding || '16px',
                        backgroundColor: style?.backgroundColor || '#ffffff',
                        border: style?.border || '1px solid #d9d9d9',
                        borderRadius: style?.borderRadius || '4px'
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    {text}
                    {children}
                </div>
            );
        case 'gauge':
            return (
                <div
                    ref={setNodeRef}
                    style={{
                        ...DEFAULT_STYLES.gauge,
                        ...style,
                        ...baseStyle,
                        position: style?.position || 'relative',
                        width: style?.width || DEFAULT_STYLES.gauge.width,
                        height: style?.height || DEFAULT_STYLES.gauge.height,
                        backgroundColor: style?.backgroundColor || DEFAULT_STYLES.gauge.backgroundColor,
                        padding: style?.padding || DEFAULT_STYLES.gauge.padding,
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    <Gauge
                        data={dataSource || 0}
                        loading={loading}
                    />
                </div>
            );
        case 'card':
            return (
                <div
                    ref={setNodeRef}
                    style={{
                        position: style?.position || 'relative',
                        width: style?.width || DEFAULT_STYLES.card.width,
                        height: style?.height || DEFAULT_STYLES.card.height,
                        ...baseStyle,
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    <MainCard
                        title={text || 'Card Title'}
                        style={{
                            width: style?.width || DEFAULT_STYLES.card.width,
                            height: style?.height || DEFAULT_STYLES.card.height,
                            ...DEFAULT_STYLES.card,
                            ...style,
                            backgroundColor: style?.backgroundColor || DEFAULT_STYLES.card.backgroundColor,
                            borderRadius: style?.borderRadius || DEFAULT_STYLES.card.borderRadius,
                            border: style?.border || DEFAULT_STYLES.card.border,
                        }}
                    >
                        {children}
                    </MainCard>
                </div>
            );
        case 'bar':
            return (
                <div
                    ref={setNodeRef}
                    style={{
                        ...DEFAULT_STYLES.bar,
                        ...style,
                        ...baseStyle,
                        position: style?.position || 'relative',
                        width: style?.width || DEFAULT_STYLES.bar.width,
                        height: style?.height || DEFAULT_STYLES.bar.height,
                        backgroundColor: style?.backgroundColor || DEFAULT_STYLES.bar.backgroundColor,
                        padding: style?.padding || DEFAULT_STYLES.bar.padding,
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    <BarChart
                        data={dataSource || []}
                        loading={loading}
                    />
                </div>
            )
        case 'line':
            return (
                <div
                    ref={setNodeRef}
                    style={{
                        ...DEFAULT_STYLES.bar,
                        ...style,
                        ...baseStyle,
                        position: style?.position || 'relative',
                        width: style?.width || DEFAULT_STYLES.bar.width,
                        height: style?.height || DEFAULT_STYLES.bar.height,
                        backgroundColor: style?.backgroundColor || DEFAULT_STYLES.bar.backgroundColor,
                        padding: style?.padding || DEFAULT_STYLES.bar.padding,
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    <LineChart
                        data={dataSource || []}
                        loading={loading}
                    />
                </div>
            )
        case 'form':
            const formStyle = style as FormStyles;
            const defaultSubmitText = 'Submit';
            return (
                <div
                    ref={setNodeRef}
                    style={{
                        position: style?.position || 'relative',
                        width: style?.width || DEFAULT_STYLES.form.width,
                        height: style?.height || DEFAULT_STYLES.form.height,
                        ...baseStyle,
                        backgroundColor: style?.backgroundColor || DEFAULT_STYLES.form.backgroundColor,
                        padding: style?.padding || DEFAULT_STYLES.form.padding,
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    <DynamicForm
                        fields={formFields || []}
                        layout={formStyle?.formLayout || DEFAULT_STYLES.form.formLayout}
                        loading={loading}
                        style={formStyle}
                        layoutConfig={{
                            type: formStyle?.layoutType || 'default',
                            columns: typeof formStyle?.columns === 'number' ? formStyle.columns : 1,
                            gutter: formStyle?.gutter || [16, 16],
                            wrap: formStyle?.wrap !== false,
                            justify: formStyle?.justify || 'start',
                            align: formStyle?.align || 'top',
                            fieldSpacing: typeof formStyle?.fieldSpacing === 'number' ? formStyle.fieldSpacing : 16,
                            grouping: {
                                enabled: formStyle?.grouping?.enabled || false,
                                spacing: formStyle?.grouping?.spacing || 24
                            }
                        }}
                        onSubmit={(values) => {
                            if (isEditMode) {
                                onSelect?.();
                            } else {
                                onFormSubmit?.(values);
                            }
                        }}
                        formSubmit={formSubmit}
                        onDataUpdate={onDataUpdate}
                    />
                </div>
            );
        case 'appbar':
            return (
                <div
                    ref={setNodeRef}
                    style={{
                        ...baseStyle,
                        width: '100%',
                    }}
                >
                    <CommonAppBar appTitle={name || 'App Title'} />
                </div>
            )
        case 'textInput':
            return (
                <div
                    ref={setNodeRef}
                    style={{
                        ...baseStyle,
                        ...style,
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    <TextInput
                        value={style?.textInputConfig?.defaultValue || ''}
                        onChange={(value) => { }}
                        style={style}
                        config={style?.textInputConfig}
                        labelStyle={style?.labelStyle}
                        inputStyle={style?.inputStyle}
                    />
                </div>
            )
        case 'browse':
            return (
                <div
                    ref={setNodeRef}
                    style={{
                        ...baseStyle,
                        ...style,
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    <Browse
                        value={style?.textInputConfig?.defaultValue || ''}
                        onChange={(value) => { }}
                        style={style}
                        config={style?.textInputConfig}
                        labelStyle={style?.labelStyle}
                        inputStyle={style?.inputStyle}
                    />
                </div>
            )
        default:
            return (
                <div
                    ref={setNodeRef}
                    style={{
                        ...baseStyle,
                        padding: '8px',
                        border: '1px dashed #ccc'
                    }}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                >
                    Unknown Widget
                    {children}
                </div>
            );
    }
}; 