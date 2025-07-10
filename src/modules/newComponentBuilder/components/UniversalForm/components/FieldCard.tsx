// components/FieldCard.tsx
import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Card, Tag, Tooltip, Input, Switch, Select, InputNumber } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    LockOutlined,
    ApiOutlined,
    FormOutlined,
    CalculatorOutlined,
    OrderedListOutlined,
} from '@ant-design/icons';
import { FormField } from '../types';
import '../UniversalForm.css';

interface FieldCardProps {
    field: FormField;
    onEdit?: (field: FormField) => void;
    onDelete?: (field: FormField) => void;
    showDebug?: boolean;
    onChange?: (updatedField: FormField) => void;
}

type FieldValue = string | number | boolean | null;

const FieldCard: React.FC<FieldCardProps> = ({
    field,
    onEdit,
    onDelete,
    showDebug,
    onChange,
}) => {
    // Initialize editValue based on field type and display mode
    const [editValue, setEditValue] = useState<FieldValue>(() => {
        if (field.fieldType === 'text') {
            if (field.displayMode === 'static' && field.content) {
                return Array.isArray(field.content) ? field.content.join('\n') : '';
            }
            if (field.displayMode === 'prefilled') {
                return field.templateText || '';
            }
            if (field.multiline && field.defaultValue) {
                return Array.isArray(field.defaultValue) 
                    ? field.defaultValue.join('\n')
                    : String(field.defaultValue);
            }
        }
        
        if (field.defaultValue === undefined || field.defaultValue === null) {
            return '';
        }
        if (typeof field.defaultValue === 'object') {
            if (Array.isArray(field.defaultValue)) {
                return field.defaultValue.join('\n');
            }
            return JSON.stringify(field.defaultValue);
        }
        return field.defaultValue as FieldValue;
    });

    // Update editValue when field changes
    useEffect(() => {
        if (field.fieldType === 'text') {
            if (field.displayMode === 'static' && field.content) {
                setEditValue(Array.isArray(field.content) ? field.content.join('\n') : '');
            } else if (field.displayMode === 'prefilled') {
                setEditValue(field.templateText || '');
            } else if (field.multiline && field.defaultValue) {
                setEditValue(Array.isArray(field.defaultValue) 
                    ? field.defaultValue.join('\n')
                    : String(field.defaultValue));
            }
        } else if (field.defaultValue !== undefined && field.defaultValue !== null) {
            if (typeof field.defaultValue === 'object') {
                if (Array.isArray(field.defaultValue)) {
                    setEditValue(field.defaultValue.join('\n'));
                } else {
                    setEditValue(JSON.stringify(field.defaultValue));
                }
            } else {
                setEditValue(field.defaultValue as FieldValue);
            }
        } else {
            setEditValue('');
        }
    }, [field]);

    const handleValueChange = (value: FieldValue) => {
        setEditValue(value);
        if (onChange) {
            if (field.fieldType === 'text') {
                if (field.displayMode === 'static') {
                    // For static text, always store as array
                    const contentArray = String(value)
                        .split('\n')
                        .filter(line => line.trim() !== '');
                    
                    onChange({
                        ...field,
                        content: contentArray,
                    });
                } else if (field.displayMode === 'prefilled') {
                    // For prefilled text
                    onChange({
                        ...field,
                        templateText: String(value),
                    });
                } else if (field.multiline) {
                    // For regular multiline text fields
                    const lines = String(value)
                        .split('\n')
                        .filter(line => line.trim() !== '');
                    
                    onChange({
                        ...field,
                        defaultValue: lines,
                    });
                } else {
                    // For single line text fields
                    onChange({
                        ...field,
                        defaultValue: value,
                    });
                }
            } else {
                // For non-text fields
                onChange({
                    ...field,
                    defaultValue: value,
                });
            }
        }
    };

    const getFieldTypeIcon = () => {
        switch (field.fieldType) {
            case 'text':
                return field.displayMode === 'static' ? <OrderedListOutlined /> : <FormOutlined />;
            case 'enum':
                return <FormOutlined />;
            case 'boolean':
                return <FormOutlined />;
            case 'lookup':
                return <ApiOutlined />;
            case 'formula':
                return <CalculatorOutlined />;
            default:
                return <FormOutlined />;
        }
    };

    const getFieldTypeDisplay = () => {
        switch (field.fieldType) {
            case 'text':
                if (field.displayMode === 'static') return 'Static Text';
                if (field.displayMode === 'prefilled') return 'Template Text';
                return field.multiline ? 'Multiline Text' : 'Text';
            case 'enum':
                return `Dropdown (${field.options?.length || 0} options)`;
            case 'boolean':
                return 'Boolean';
            case 'lookup':
                return 'Lookup';
            case 'formula':
                return `Formula ${field.unit ? `(${field.unit})` : ''}`;
            default:
                return 'Unknown Type';
        }
    };

    const getFieldTags = () => {
        const tags: JSX.Element[] = [];

        if (field.required) {
            tags.push(<Tag key="required" color="red">Required</Tag>);
        }

        if (field.readOnly) {
            tags.push(<Tag key="readonly" color="default" icon={<LockOutlined />}>Read Only</Tag>);
        }

        if (field.roleControl?.editableBy?.length) {
            tags.push(
                <Tooltip key="roles" title={`Editable by: ${field.roleControl.editableBy.join(', ')}`}>
                    <Tag color="blue">Role Restricted</Tag>
                </Tooltip>
            );
        }

        if (field.dataSource === 'api') {
            tags.push(<Tag key="api" color="green" icon={<ApiOutlined />}>API Data</Tag>);
        }

        return tags;
    };

    const renderEditableContent = () => {
        if (field.readOnly) {
            if (field.fieldType === 'text') {
                if (field.displayMode === 'static') {
                    const value = Array.isArray(field.content) ? field.content.join('\n') : '';
                    return field.multiline ? (
                        <Input.TextArea
                            value={value}
                            disabled
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            className="static-text-area"
                        />
                    ) : (
                        <Input
                            value={value}
                            disabled
                            className="static-text-input"
                        />
                    );
                }
                if (field.displayMode === 'prefilled') {
                    return field.multiline ? (
                        <Input.TextArea
                            value={field.templateText || ''}
                            disabled
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            className="prefilled-text-area"
                        />
                    ) : (
                        <Input
                            value={field.templateText || ''}
                            disabled
                            className="prefilled-text-input"
                        />
                    );
                }
            }
            return (
                <div className="field-display-value">
                    {String(field.defaultValue ?? '')}
                </div>
            );
        }

        switch (field.fieldType) {
            case 'text':
                if (field.displayMode === 'static') {
                    return field.multiline ? (
                        <Input.TextArea
                            value={String(editValue)}
                            onChange={(e) => handleValueChange(e.target.value)}
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                            className="static-text-area"
                        />
                    ) : (
                        <Input
                            value={String(editValue)}
                            onChange={(e) => handleValueChange(e.target.value)}
                            placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                            className="static-text-input"
                        />
                    );
                }
                if (field.displayMode === 'prefilled') {
                    return field.multiline ? (
                        <Input.TextArea
                            value={String(editValue)}
                            onChange={(e) => handleValueChange(e.target.value)}
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            placeholder="Enter template text"
                            className="prefilled-text-area"
                        />
                    ) : (
                        <Input
                            value={String(editValue)}
                            onChange={(e) => handleValueChange(e.target.value)}
                            placeholder="Enter template text"
                            className="prefilled-text-input"
                        />
                    );
                }
                // Default text input
                return (
                    <Input
                        value={String(editValue)}
                        onChange={(e) => handleValueChange(e.target.value)}
                        placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                        className="default-text-input"
                    />
                );

            case 'enum':
                return (
                    <div className="field-select-wrapper">
                        <Select
                            value={String(editValue)}
                            onChange={(value) => handleValueChange(value)}
                            options={field.options}
                            bordered={true}
                            placeholder="Select option"
                            dropdownMatchSelectWidth={false}
                        />
                    </div>
                );

            case 'boolean':
                return (
                    <div className="field-switch-wrapper">
                        <Switch
                            checked={Boolean(editValue)}
                            onChange={(checked) => handleValueChange(checked)}
                            size="small"
                        />
                        <span className="switch-label">{Boolean(editValue) ? 'Yes' : 'No'}</span>
                    </div>
                );

            case 'formula':
                return (
                    <div className="formula-preview">
                        {field.formula}
                        {field.unit && ` (${field.unit})`}
                    </div>
                );

            case 'lookup':
                return (
                    <div className="field-select-wrapper">
                        <Select
                            value={String(editValue)}
                            onChange={(value) => handleValueChange(value)}
                            bordered={true}
                            loading={true}
                            placeholder="Loading options..."
                            dropdownMatchSelectWidth={false}
                        />
                    </div>
                );

            default:
                return null;
        }
    };


    const renderDebugInfo = () => {
        if (!showDebug) return null;

        return (
            <div className="debug-info">
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    ID: {field.fieldId}
                    {field.layoutColumn && `, Column: ${field.layoutColumn}`}
                    {field.order !== undefined && `, Order: ${field.order}`}
                    {field.alignment && `, Align: ${field.alignment}`}
                    {field.maxLength && `, Max Length: ${field.maxLength}`}
                </Typography.Text>
            </div>
        );
    };

    return (
        <Card
            size="small"
            className={`field-card ${field.fieldType} ${field.readOnly ? 'read-only' : ''}`}
            style={{
                marginBottom: 12,
                gridColumn: field.layoutColumn ? `span ${field.layoutColumn}` : 'span 1',
            }}
            bodyStyle={{ padding: 12 }}
            bordered
        >
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
                <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Space>
                        <span className="field-icon">{getFieldTypeIcon()}</span>
                        <Typography.Text
                            strong
                            style={{
                                textAlign: field.alignment || 'left',
                                marginBottom: field.labelPosition === 'top' ? 8 : 0,
                            }}
                        >
                            {field.fieldName}
                        </Typography.Text>
                    </Space>
                    <Space>
                        <Space wrap size={[0, 4]}>
                            <Tag color="processing">{getFieldTypeDisplay()}</Tag>
                            {getFieldTags()}
                        </Space>
                        {onEdit && (
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => onEdit(field)}
                            />
                        )}
                        {onDelete && (
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                onClick={() => onDelete(field)}
                            />
                        )}
                    </Space>
                </Space>
                {renderEditableContent()}
                {renderDebugInfo()}
            </Space>
        </Card>
    );
};

export default FieldCard;
