// components/FieldCard.tsx
import React, { useState } from 'react';
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
    const [editValue, setEditValue] = useState<FieldValue>(() => {
        if (field.defaultValue === undefined || field.defaultValue === null) {
            return '';
        }
        if (typeof field.defaultValue === 'object') {
            return JSON.stringify(field.defaultValue);
        }
        return field.defaultValue as FieldValue;
    });

    const handleValueChange = (value: FieldValue) => {
        setEditValue(value);
        if (onChange) {
            onChange({
                ...field,
                defaultValue: value,
            });
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
                        />
                    ) : (
                        <Input
                            value={value}
                            disabled
                        />
                    );
                }
                if (field.displayMode === 'prefilled') {
                    return field.multiline ? (
                        <Input.TextArea
                            value={field.templateText || ''}
                            disabled
                            autoSize={{ minRows: 2, maxRows: 6 }}
                        />
                    ) : (
                        <Input
                            value={field.templateText || ''}
                            disabled
                        />
                    );
                }
            }
            // fallback for other types
            return (
                <div className="field-display-value">
                    {String(field.defaultValue ?? '')}
                </div>
            );
        }

        switch (field.fieldType) {
            case 'text':
                if (field.displayMode === 'static') {
                    // Editable: update content array (single or multiline)
                    const value = Array.isArray(field.content) ? field.content.join('\n') : '';
                    const handleStaticChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        const newValue = e.target.value;
                        const newContent = field.multiline ? newValue.split('\n') : [newValue];
                        if (onChange) {
                            onChange({ ...field, content: newContent });
                        }
                    };
                    return field.multiline ? (
                        <Input.TextArea
                            value={value}
                            onChange={handleStaticChange}
                            autoSize={{ minRows: 2, maxRows: 6 }}
                        />
                    ) : (
                        <Input
                            value={value}
                            onChange={handleStaticChange}
                        />
                    );
                }
                // Prefilled/template mode: show template_text in input/textarea (read-only or editable as needed)
                if (field.displayMode === 'prefilled') {
                    const handlePrefilledChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        const newValue = e.target.value;
                        if (onChange) {
                            onChange({ ...field, templateText: newValue });
                        }
                    };
                    return field.multiline ? (
                        <Input.TextArea
                            value={field.templateText || ''}
                            onChange={handlePrefilledChange}
                            autoSize={{ minRows: 2, maxRows: 6 }}
                        />
                    ) : (
                        <Input
                            value={field.templateText || ''}
                            onChange={handlePrefilledChange}
                        />
                    );
                }
                // fallback
                return (
                    <Input
                        value={String(editValue)}
                        onChange={(e) => handleValueChange(e.target.value)}
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
