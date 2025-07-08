import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Space, Button, Tabs, InputNumber, Badge } from 'antd';
import { FormOutlined, LayoutOutlined, LockOutlined, ApiOutlined } from '@ant-design/icons';
import { FormField, FieldType, Option, FieldEditorTab } from '../types';

interface FieldModalProps {
  visible: boolean;
  field?: FormField;
  onSave: (field: FormField) => void;
  onCancel: () => void;
  availableFields?: FormField[];
}

const DEFAULT_FIELD: Partial<FormField> = {
  fieldType: 'text',
  required: false,
  readOnly: false,
  labelPosition: 'left',
  alignment: 'left',
  dataSource: 'user_input',
  instructionLevel: 'field',
  layoutColumn: 1,
  fieldName: '',
  displayMode: '',
  multiline: false,
  content: [''],
  templateText: '',
};

const EDITOR_TABS: FieldEditorTab[] = [
  { key: 'basic', label: 'Basic', icon: <FormOutlined /> },
  { key: 'layout', label: 'Layout', icon: <LayoutOutlined /> },
  { key: 'permissions', label: 'Permissions', icon: <LockOutlined /> },
  { key: 'data', label: 'Data Source', icon: <ApiOutlined /> },
];

const FieldModal: React.FC<FieldModalProps> = ({
  visible,
  field,
  onSave,
  onCancel,
  availableFields = [],
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [formState, setFormState] = useState<Partial<FormField>>(DEFAULT_FIELD);
  const isEdit = !!field;

  // Reset form and state on open/close
  useEffect(() => {
    if (visible) {
      const initialValues = field ? {
        ...DEFAULT_FIELD,
        ...field,
        content: field.content || [''],
        templateText: field.templateText || '',
      } : DEFAULT_FIELD;
      form.setFieldsValue(initialValues);
      setFormState(initialValues);
    } else {
      form.resetFields();
      setFormState(DEFAULT_FIELD);
    }
  }, [visible, field, form]);

  // Keep local state in sync with form
  const handleFormChange = () => {
    const values = form.getFieldsValue(true);
    setFormState(prev => ({ ...prev, ...values }));
  };

  // Add back handleCancel
  const handleCancel = () => {
    form.resetFields();
    setFormState(DEFAULT_FIELD);
    onCancel();
  };

  // Save logic
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let fieldData: FormField = {
        ...DEFAULT_FIELD,
        ...formState,
        ...values,
        fieldId: field?.fieldId || `${values.fieldName
          ? values.fieldName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
          : Date.now()}`,
      } as FormField;
      // Ensure correct storage for text fields
      if (fieldData.fieldType === 'text') {
        if (fieldData.displayMode === 'static') {
          fieldData.templateText = '';
        } else if (fieldData.displayMode === 'prefilled') {
          fieldData.content = undefined;
        }
      }
      onSave(fieldData);
    } catch (error) {
      // Validation error
    }
  };

  // Field type change logic
  const handleFieldTypeChange = (type: FieldType) => {
    const currentValues = form.getFieldsValue(true);
    const updates: Partial<FormField> = {
      ...currentValues,
      fieldType: type,
      instructionLevel: type === 'text' ? 'field' : undefined,
      options: type === 'enum' ? [{ label: '', value: '' }] : undefined,
      required: type !== 'formula',
      readOnly: type === 'formula',
      displayMode: type === 'text',
      dataSource: type === 'formula' ? 'formula' : type === 'lookup' ? 'api' : 'user_input',
      content: type === 'text' ? [''] : undefined,
      templateText: '',
    };
    form.setFieldsValue(updates);
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // --- Modular Renderers ---
  const renderTextFields = () => (
    <>
      <Form.Item name="displayMode" label="Display Mode">
        <Select>
          <Select.Option value="static">Static</Select.Option>
          <Select.Option value="prefilled">Prefilled</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="multiline" valuePropName="checked">
        <Switch checkedChildren="Multiline" unCheckedChildren="Single line" />
      </Form.Item>
      <Form.Item shouldUpdate={(prev, curr) => prev.displayMode !== curr.displayMode || prev.multiline !== curr.multiline}>
        {({ getFieldValue }) => {
          const displayMode = getFieldValue('displayMode');
          const multiline = getFieldValue('multiline');
          if (displayMode === 'static') {
            return (
              <>
                <Form.Item name="instructionLevel" label="Instruction Level">
                  <Select>
                    <Select.Option value="field">Field</Select.Option>
                    <Select.Option value="section">Section</Select.Option>
                    <Select.Option value="step">Step</Select.Option>
                  </Select>
                </Form.Item>
                <Form.List name="content">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, idx) => (
                        <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} styles={{
                          item: {
                            width: '100%'
                          }
                        }}>
                          <Form.Item
                            {...field}
                            label='Instruction'
                            validateTrigger={['onChange', 'onBlur']}
                            rules={[{ required: true, message: 'Please enter instruction' }]}
                          >
                            {multiline ? (
                              <Input.TextArea placeholder={`Instruction ${idx + 1}`} autoSize={{ minRows: 2, maxRows: 6 }} />
                            ) : (
                              <Input placeholder={`Instruction ${idx + 1}`} />
                            )}
                          </Form.Item>
                        </Space>
                      ))}
                    </>
                  )}
                </Form.List>
              </>
            );
          } else if (displayMode === 'prefilled') {
            return (
              <Form.Item name="templateText" label="Template Text" rules={[{ required: true, message: 'Enter template text' }]}>
                {multiline ? (
                  <Input.TextArea placeholder="Enter template text" autoSize={{ minRows: 2, maxRows: 6 }} />
                ) : (
                  <Input placeholder="Enter template text" />
                )}
              </Form.Item>
            );
          }
          return null;
        }}
      </Form.Item>
    </>
  );

  const renderEnumFields = () => (
    <Form.List name="options">
      {(fields, { add, remove }) => (
        <div style={{ marginBottom: 16 }}>
          <Form.Item label="Options">
            {fields.map((field, index) => (
              <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }}>
                <Form.Item
                  {...field}
                  name={[field.name, 'label']}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[{ required: true, message: 'Please enter option label' }]}
                  noStyle
                >
                  <Input placeholder="Option Label" style={{ width: '120px' }} />
                </Form.Item>
                <Form.Item
                  {...field}
                  name={[field.name, 'value']}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[{ required: true, message: 'Please enter option value' }]}
                  noStyle
                >
                  <Input placeholder="Option Value" style={{ width: '120px' }} />
                </Form.Item>
                {fields.length > 1 && (
                  <Button type="link" danger onClick={() => remove(field.name)}>
                    Delete
                  </Button>
                )}
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()} block>
              Add Option
            </Button>
          </Form.Item>
        </div>
      )}
    </Form.List>
  );

  const renderBasicFields = () => (
    <>
      <Form.Item
        name="fieldName"
        label="Field Name"
        rules={[{ required: true, message: 'Please enter field name' }]}
      >
        <Input placeholder="Enter field name" />
      </Form.Item>
      <Form.Item
        name="fieldType"
        label="Field Type"
        rules={[{ required: true }]}
      >
        <Select onChange={handleFieldTypeChange}>
          <Select.Option value="text">Text</Select.Option>
          <Select.Option value="enum">Dropdown</Select.Option>
          <Select.Option value="boolean">Boolean</Select.Option>
          <Select.Option value="lookup">Lookup</Select.Option>
          <Select.Option value="formula">Formula</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.fieldType !== curr.fieldType}>
        {({ getFieldValue }) => {
          const fieldType = getFieldValue('fieldType');
          if (fieldType === 'text') return renderTextFields();
          if (fieldType === 'enum') return renderEnumFields();
          if (fieldType === 'lookup') return (
            <Form.Item name="endpoint" label="Lookup API Endpoint" rules={[{ required: true, message: 'Please enter API endpoint' }]}> <Input placeholder="Enter API endpoint" /> </Form.Item>
          );
          if (fieldType === 'formula') return (
            <>
              <Form.Item name="formula" label="Formula" rules={[{ required: true, message: 'Please enter formula' }]}> <Input.TextArea placeholder="Enter formula (e.g., {field1} + {field2})" rows={3} /> </Form.Item>
              <Form.Item name="precision" label="Decimal Precision"> <InputNumber min={0} max={10} /> </Form.Item>
              <Form.Item name="unit" label="Unit"> <Input placeholder="e.g., %, kg, etc." /> </Form.Item>
              <Badge.Ribbon text="Available fields" placement="start">
                <Space wrap>
                  {availableFields.map(f => (<Badge key={f.fieldId} color="blue" text={`{${f.fieldId}}`} />))}
                </Space>
              </Badge.Ribbon>
            </>
          );
          return null;
        }}
      </Form.Item>
    </>
  );

  const renderLayoutFields = () => (
    <>
      <Form.Item name="layoutColumn" label="Column">
        <Select>
          <Select.Option value={1}>Column 1</Select.Option>
          <Select.Option value={2}>Column 2</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="order" label="Display Order">
        <InputNumber min={0} />
      </Form.Item>

      <Form.Item name="labelPosition" label="Label Position">
        <Select>
          <Select.Option value="left">Left</Select.Option>
          <Select.Option value="top">Top</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="alignment" label="Text Alignment">
        <Select>
          <Select.Option value="left">Left</Select.Option>
          <Select.Option value="center">Center</Select.Option>
          <Select.Option value="right">Right</Select.Option>
        </Select>
      </Form.Item>
    </>
  );

  const renderPermissionFields = () => (
    <>
      <Form.Item name="required" valuePropName="checked">
        <Switch checkedChildren="Required" unCheckedChildren="Optional" />
      </Form.Item>

      <Form.Item name="readOnly" valuePropName="checked">
        <Switch checkedChildren="Read Only" unCheckedChildren="Editable" />
      </Form.Item>

      <Form.Item
        name={['roleControl', 'editableBy']}
        label="Editable By Roles"
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder="Enter roles"
          options={[
            { label: 'Admin', value: 'admin' },
            { label: 'Production', value: 'production' },
            { label: 'QA', value: 'qa' },
            { label: 'Supervisor', value: 'supervisor' },
          ]}
        />
      </Form.Item>
    </>
  );

  const renderDataSourceFields = () => (
    <>
      <Form.Item name="dataSource" label="Data Source">
        <Select>
          <Select.Option value="user_input">User Input</Select.Option>
          <Select.Option value="api">API</Select.Option>
          <Select.Option value="formula">Formula</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.data_source !== curr.data_source}
      >
        {({ getFieldValue }) => {
          const dataSource = getFieldValue('dataSource');
          return dataSource === 'api' ? (
            <Form.Item name="apiEndpoint" label="API Endpoint">
              <Input placeholder="Enter API endpoint" />
            </Form.Item>
          ) : null;
        }}
      </Form.Item>

      <Form.Item name="maxLength" label="Maximum Length">
        <InputNumber min={0} />
      </Form.Item>

      <Form.Item name="defaultValue" label="Default Value">
        <Input placeholder="Enter default value" />
      </Form.Item>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicFields();
      case 'layout':
        return renderLayoutFields();
      case 'permissions':
        return renderPermissionFields();
      case 'data':
        return renderDataSourceFields();
      default:
        return null;
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Field' : 'Add New Field'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>{isEdit ? 'Update' : 'Add'} Field</Button>,
      ]}
      width={800}
      destroyOnClose={false}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        preserve={true}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={EDITOR_TABS.map(tab => ({
            key: tab.key,
            label: (<span>{tab.icon}{tab.label}</span>),
            children: renderTabContent(),
          }))}
        />
      </Form>
    </Modal>
  );
};

export default FieldModal; 