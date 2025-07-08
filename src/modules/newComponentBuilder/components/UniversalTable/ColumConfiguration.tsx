import { useState, useEffect } from "react";
import { Modal, Tabs, Form, Input, Select, InputNumber, Switch, FormInstance, Space, Button, Checkbox, Tooltip, Divider, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { TemplateData, Column, FieldType } from "./types";
import TextArea from "antd/es/input/TextArea";
import moment from "moment";

// Helper for generating default values based on field type
const getDefaultValueByType = (fieldType: string | undefined, options?: any[]): any => {
    switch (fieldType) {
        case 'text':
            return '';
        case 'number':
            return 0;
        case 'boolean':
            return false;
        case 'enum':
        case 'select':
            return options && options.length > 0 ? options[0].value : '';
        case 'date':
            return null;
        default:
            return '';
    }
};

// Component for different default value inputs based on field type
const DefaultValueInput = ({ fieldType, value, onChange, form }: {
    fieldType: string | undefined;
    value: any;
    onChange: (value: any) => void;
    form: FormInstance;
}) => {
    // Effect to update default value when options change for select/enum fields
    useEffect(() => {
        if ((fieldType === 'select' || fieldType === 'enum')) {
            const options = form.getFieldValue('options') || [];
            const currentValue = value;
            
            // If current value is not in options, use first option or empty
            if (!options.some((opt: any) => opt.value === currentValue)) {
                const newDefault = options.length > 0 ? options[0].value : '';
                onChange(newDefault);
            }
        }
    }, [fieldType, form.getFieldValue('options'), value]);

    if (!fieldType) return <Input value={value} onChange={e => onChange(e.target.value)} />;

    switch (fieldType) {
        case 'text':
            if (form.getFieldValue('multiline')) {
                return <TextArea value={value} onChange={e => onChange(e.target.value)} rows={3} />;
            }
            return <Input value={value} onChange={e => onChange(e.target.value)} />;
        case 'number':
            return <InputNumber
                value={value}
                onChange={val => onChange(val)}
                style={{ width: '100%' }}
                precision={form.getFieldValue('precision') || 1}
            />;
        case 'boolean':
            return <Switch checked={!!value} onChange={val => onChange(val)} />;
        case 'enum':
        case 'select':
            const options = form.getFieldValue('options') || [];
    return (
                <Select
                    value={value}
                    onChange={val => onChange(val)}
                    style={{ width: '100%' }}
                    placeholder="Select a default value"
                    allowClear
                >
                    {options.map((opt: any, index: number) => (
                        <Select.Option key={index} value={opt.value}>
                            {opt.label}
                        </Select.Option>
                    ))}
                </Select>
            );
        case 'date':
            return <DatePicker
                value={value ? moment(value) : null}
                onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : null)}
                style={{ width: '100%' }}
            />;
        case 'lookup':
        case 'formula':
        case 'image':
        case 'file':
        case 'signature':
            // These types typically don't have default values or are computed
            return (
                <Tooltip title="This field type doesn't support default values">
                    <Input
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        disabled
                        placeholder="Not applicable"
                    />
                </Tooltip>
            );
        default:
            return <Input value={value} onChange={e => onChange(e.target.value)} />;
    }
};

const ValidationRulesForm = ({ form, fieldType }: { form: FormInstance; fieldType?: string }) => {
    // Display different validation options based on field type
    const isNumberType = fieldType === 'number';
    const isTextType = fieldType === 'text' || fieldType === 'lookup';
    const isFileType = fieldType === 'file' || fieldType === 'image';

    return (
        <div>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="required"
                    valuePropName="checked"
                    label="Required"
                >
                    <Checkbox>This field is required</Checkbox>
                </Form.Item>

                {isNumberType && (
                    <>
                                <Form.Item
                            name={['validation', 'min']}
                            label="Min Value"
                        >
                            <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                                <Form.Item
                            name={['validation', 'max']}
                            label="Max Value"
                                >
                            <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                    </>
                )}

                {isTextType && (
                    <Form.Item
                        name="max_length"
                        label="Max Length"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                )}

                {isFileType && (
                    <Form.Item
                        name="max_size_mb"
                        label="Max File Size (MB)"
                    >
                        <InputNumber min={0.1} defaultValue={10} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                )}
            </Form>
        </div>
    );
};

export const ColumnConfigModal = ({
    editingColumn,
    isColumnModalVisible,
    setIsColumnModalVisible,
    handleColumnSave,
    templateData,
    form
}: {
    editingColumn: Column | null;
    isColumnModalVisible: boolean;
    setIsColumnModalVisible: (visible: boolean) => void;
    handleColumnSave: () => void;
    templateData: TemplateData;
    form: FormInstance;
}) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [fieldType, setFieldType] = useState<FieldType | undefined>(editingColumn?.fieldType);

    // Update field type when it changes
    const handleFieldTypeChange = (value: FieldType) => {
        setFieldType(value);

        // Reset default value based on new field type
        form.setFieldValue('default_value', getDefaultValueByType(value, editingColumn?.options));

        // Set default precision for number fields
        if (value === 'number' && form.getFieldValue('precision') === undefined) {
            form.setFieldValue('precision', 1);
        }
    };

    // Initialize default value when editing column changes
    useEffect(() => {
        if (editingColumn) {
            setFieldType(editingColumn.fieldType);
        } else {
            setFieldType(undefined);
        }
    }, [editingColumn]);

    return (
        <Modal
            title={`${editingColumn ? 'Edit' : 'Add'} Column`}
            open={isColumnModalVisible}
            onOk={handleColumnSave}
            onCancel={() => setIsColumnModalVisible(false)}
            width={800}
        >
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane tab="Basic Settings" key="basic" style={{padding: 5}}>
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="fieldName"
                            label="Column Name"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="fieldType"
                            label="Field Type"
                            rules={[{ required: true }]}
                        >
                            <Select onChange={handleFieldTypeChange}>
                                <Select.Option value="text">Text</Select.Option>
                                <Select.Option value="number">Number</Select.Option>
                                <Select.Option value="boolean">Boolean</Select.Option>
                                <Select.Option value="enum">Enum</Select.Option>
                                <Select.Option value="select">Select</Select.Option>
                                <Select.Option value="date">Date</Select.Option>
                                <Select.Option value="formula">Formula</Select.Option>
                                <Select.Option value="lookup">Lookup</Select.Option>
                                <Select.Option value="image">Image</Select.Option>
                                <Select.Option value="file">File</Select.Option>
                                <Select.Option value="signature">Signature</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="defaultValue"
                            label="Default Value"
                        >
                            <DefaultValueInput
                                fieldType={fieldType}
                                value={form.getFieldValue('default_value')}
                                onChange={val => form.setFieldValue('default_value', val)}
                                form={form}
                            />
                        </Form.Item>

                        <Form.Item
                            name="readOnly"
                            valuePropName="checked"
                            label={
                                <Space>
                                    Read-only
                                    <Tooltip title="When enabled, users cannot edit this field">
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </Space>
                            }
                        >
                            <Switch />
                        </Form.Item>

                        {fieldType === 'number' && (
                            <>
                        <Form.Item
                            name="unit"
                            label="Unit"
                        >
                                    <Input placeholder="e.g., kg, m, pcs" />
                                </Form.Item>
                                <Form.Item
                                    name="precision"
                                    label="Decimal Precision"
                                >
                                    <InputNumber min={0} max={10} defaultValue={2} style={{ width: '100%' }} />
                                </Form.Item>
                            </>
                        )}

                        {(fieldType === 'enum' || fieldType === 'select') && (
                            <Form.List name="options">
                                {(fields, { add, remove }) => (
                                    <>
                                        <Form.Item label="Options">
                                            <Button
                                                type="dashed"
                                                onClick={() => {
                                                    add({ label: '', value: '' });
                                                    // After adding a new option, check and update default value
                                                    setTimeout(() => {
                                                        const options = form.getFieldValue('options') || [];
                                                        const currentDefault = form.getFieldValue('defaultValue');
                                                        if (!options.some(opt => opt.value === currentDefault)) {
                                                            form.setFieldValue('defaultValue', 
                                                                options.length > 0 ? options[0].value : '');
                                                        }
                                                    }, 0);
                                                }}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                Add Option
                                            </Button>
                                        </Form.Item>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Space
                                                key={key}
                                                style={{ display: 'flex', marginBottom: 8 }}
                                                align="baseline"
                                            >
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'label']}
                                                    rules={[{ required: true, message: 'Label is required' }]}
                                                >
                                                    <Input 
                                                        placeholder="Label" 
                                                        onChange={(e) => {
                                                            // After label change, update form values
                                                            setTimeout(() => {
                                                                const options = form.getFieldValue('options') || [];
                                                                const currentDefault = form.getFieldValue('defaultValue');
                                                                if (!options.some(opt => opt.value === currentDefault)) {
                                                                    form.setFieldValue('defaultValue', 
                                                                        options.length > 0 ? options[0].value : '');
                                                                }
                                                            }, 0);
                                                        }}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'value']}
                                                    rules={[{ required: true, message: 'Value is required' }]}
                                                >
                                                    <Input 
                                                        placeholder="Value"
                                                        onChange={(e) => {
                                                            // After value change, update form values
                                                            setTimeout(() => {
                                                                const options = form.getFieldValue('options') || [];
                                                                const currentDefault = form.getFieldValue('defaultValue');
                                                                if (!options.some(opt => opt.value === currentDefault)) {
                                                                    form.setFieldValue('defaultValue', 
                                                                        options.length > 0 ? options[0].value : '');
                                                                }
                                                            }, 0);
                                                        }}
                                                    />
                                                </Form.Item>
                                                <DeleteOutlined onClick={() => {
                                                    remove(name);
                                                    // After removing an option, check and update default value
                                                    setTimeout(() => {
                                                        const options = form.getFieldValue('options') || [];
                                                        const currentDefault = form.getFieldValue('defaultValue');
                                                        if (!options.some(opt => opt.value === currentDefault)) {
                                                            form.setFieldValue('defaultValue', 
                                                                options.length > 0 ? options[0].value : '');
                                                        }
                                                    }, 0);
                                                }} />
                                            </Space>
                                        ))}
                                    </>
                                )}
                            </Form.List>
                        )}

                        {fieldType === 'formula' && (
                            <>
                                <Form.Item
                                    name="formula"
                                    label="Formula Expression"
                                    tooltip="Use column field_ids in curly braces, e.g. {field1} + {field2}"
                                    extra="Use the buttons below to build your formula"
                                >
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="e.g., ({col_1} + {col_2}) / 2"
                                    />
                                </Form.Item>

                                <Form.Item label="Build Formula">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Space>
                                            <Select
                                                style={{ width: 200 }}
                                                placeholder="Insert column"
                                                onChange={(value) => {
                                                    // Insert column reference at cursor position or append
                                                    const currentFormula = form.getFieldValue('formula') || '';
                                                    const column = templateData.columns.find(col => col.fieldId === value);
                                                    form.setFieldValue('formula', `${currentFormula}{${value}}`);
                                                }}
                                                showSearch
                                                optionFilterProp="children"
                                            >
                                                {templateData.columns
                                                    .filter(col => col.fieldId !== editingColumn?.fieldId && col.fieldType !== 'formula')
                                                    .map(col => (
                                                        <Select.Option key={col.fieldId} value={col.fieldId}>
                                                            {col.fieldName} ({col.fieldType})
                                                        </Select.Option>
                                                    ))
                                                }
                                            </Select>
                                        </Space>
                                        <Space>
                                            <Button
                                                onClick={() => {
                                                    const currentFormula = form.getFieldValue('formula') || '';
                                                    form.setFieldValue('formula', `${currentFormula} + `);
                                                }}
                                            >
                                                + (Add)
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    const currentFormula = form.getFieldValue('formula') || '';
                                                    form.setFieldValue('formula', `${currentFormula} - `);
                                                }}
                                            >
                                                - (Subtract)
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    const currentFormula = form.getFieldValue('formula') || '';
                                                    form.setFieldValue('formula', `${currentFormula} * `);
                                                }}
                                            >
                                                × (Multiply)
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    const currentFormula = form.getFieldValue('formula') || '';
                                                    form.setFieldValue('formula', `${currentFormula} / `);
                                                }}
                                            >
                                                ÷ (Divide)
                                            </Button>
                                        </Space>
                                        <Space>
                                            <Button
                                                onClick={() => {
                                                    const currentFormula = form.getFieldValue('formula') || '';
                                                    form.setFieldValue('formula', `${currentFormula}(`);
                                                }}
                                            >
                                                (
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    const currentFormula = form.getFieldValue('formula') || '';
                                                    form.setFieldValue('formula', `${currentFormula})`);
                                                }}
                                            >
                                                )
                                            </Button>
                                            <Button
                                                danger
                                                onClick={() => {
                                                    form.setFieldValue('formula', '');
                                                }}
                                            >
                                                Clear
                                            </Button>
                                        </Space>
                                    </Space>
                                </Form.Item>
                            </>
                        )}

                        {fieldType === 'lookup' && (
                            <>
                                <Form.Item
                                    name="endpoint"
                                    label="API Endpoint"
                                    rules={[{ required: fieldType === 'lookup', message: 'Endpoint is required for lookup fields' }]}
                                >
                                    <Input placeholder="/api/resource" />
                                </Form.Item>
                                <Form.Item
                                    name="bindField"
                                    label="Bind Field"
                                    rules={[{ required: fieldType === 'lookup', message: 'Bind field is required for lookup fields' }]}
                                >
                                    <Input placeholder="fieldToDisplay" />
                                </Form.Item>
                            </>
                        )}

                        {fieldType === 'text' && (
                            <>
                                <Form.Item
                                    name="multiline"
                                    valuePropName="checked"
                                    label="Multiline Text"
                                >
                                    <Switch />
                                </Form.Item>
                                {form.getFieldValue('multiline') && (
                                    <Form.Item
                                        name="rows"
                                        label="Number of Rows"
                                    >
                                        <InputNumber min={2} defaultValue={3} style={{ width: '100%' }} />
                                    </Form.Item>
                                )}
                            </>
                        )}

                        {fieldType === 'image' && (
                            <>
                                <Form.Item
                                    name="captureCamera"
                                    valuePropName="checked"
                                    label="Allow Camera Capture"
                                >
                                    <Switch />
                                </Form.Item>
                                <Form.Item
                                    name="maxSizeMb"
                                    label="Max File Size (MB)"
                                >
                                    <InputNumber min={0.1} defaultValue={5} step={0.1} style={{ width: '100%' }} />
                                </Form.Item>
                            </>
                        )}

                        {fieldType === 'file' && (
                            <>
                                <Form.Item
                                    name="fileTypes"
                                    label="Allowed File Types"
                                    tooltip="Enter file extensions without the dot, e.g. pdf, docx"
                                >
                                    <Select mode="tags" style={{ width: '100%' }} placeholder="Enter file types">
                                        <Select.Option value="pdf">PDF</Select.Option>
                                        <Select.Option value="doc">DOC</Select.Option>
                                        <Select.Option value="docx">DOCX</Select.Option>
                                        <Select.Option value="xls">XLS</Select.Option>
                                        <Select.Option value="xlsx">XLSX</Select.Option>
                                        <Select.Option value="jpg">JPG</Select.Option>
                                        <Select.Option value="png">PNG</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="maxSizeMb"
                                    label="Max File Size (MB)"
                                >
                                    <InputNumber min={0.1} defaultValue={10} step={0.1} style={{ width: '100%' }} />
                                </Form.Item>
                            </>
                        )}

                        {fieldType === 'signature' && (
                            <Form.Item
                                name="signedByRole"
                                label="Roles Allowed to Sign"
                            >
                                <Select mode="tags" style={{ width: '100%' }} placeholder="Enter roles">
                                    <Select.Option value="QA">QA</Select.Option>
                                    <Select.Option value="Supervisor">Supervisor</Select.Option>
                                    <Select.Option value="Manager">Manager</Select.Option>
                                    <Select.Option value="Operator">Operator</Select.Option>
                                </Select>
                            </Form.Item>
                        )}

                        <Divider />
                        <Form.Item
                            name="visibilityCondition"
                            label="Visibility Condition"
                            tooltip="JavaScript expression that determines when this field is visible, e.g. status == 'fail'"
                        >
                            <Input placeholder="e.g., status == 'fail'" />
                        </Form.Item>
                    </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Validation" key="validation" style={{padding: 5}}>
                    <ValidationRulesForm form={form} fieldType={fieldType} />
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    );
};
