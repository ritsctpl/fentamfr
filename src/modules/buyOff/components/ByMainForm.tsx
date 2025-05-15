import React, { forwardRef, useEffect } from 'react';
import { Form, Input, Switch, Select, FormInstance } from 'antd';
import { useBuyOff } from '../hooks/BuyOffContext';

interface ByMainFormProps {
  schema?: any;
}

const ByMainForm = forwardRef<FormInstance, ByMainFormProps>(({ schema }, ref) => {
  const { selectedRowData, setSelectedRowData, setHasChanges } = useBuyOff();
  const [form] = Form.useForm();

  React.useImperativeHandle(ref, () => form);

  useEffect(() => {
    if (selectedRowData) {
      form.setFieldsValue(selectedRowData);
    } else {
      form.resetFields();
    }
  }, [selectedRowData, form]);

  return (
    <div style={{width: '100%', height: 'calc(100vh - 360px)' ,overflow: 'auto'}}>
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onValuesChange={(changedFields, allFields) => {
        setHasChanges(true);
        setSelectedRowData(selectedRowData ? { ...selectedRowData, ...allFields } : allFields);
      }}
      initialValues={selectedRowData || {}}
    >
      <Form.Item 
        style={{width: '60%'}} 
        label="Buy Off" 
        name="buyOff" 
        rules={[{ required: true, message: 'Buy Off is required' }]}
      >
        <Input onInput={(e) => {
          const input = e.target as HTMLInputElement;
          input.value = input.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
          form.setFieldValue('buyOff', input.value);
        }} />
      </Form.Item>

      <Form.Item 
        style={{width: '60%'}} 
        label="Version" 
        name="version" 
        rules={[{ required: true, message: 'Version is required' }]}
      >
        <Input onInput={(e) => {
          const input = e.target as HTMLInputElement;
          input.value = input.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
          form.setFieldValue('version', input.value);
        }} />
      </Form.Item>

      <Form.Item style={{width: '60%'}} label="Description" name="description">
        <Input />
      </Form.Item>

      <Form.Item 
        style={{width: '60%'}} 
        label="Status" 
        name="status" 
        initialValue={'Enabled'} 
        rules={[{ required: true, message: 'Status is required' }]}
      >
        <Select>
          <Select.Option value="Enabled">Enabled</Select.Option>
          <Select.Option value="Disabled">Disabled</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item style={{width: '60%'}} label="Message Type" name="messageType">
        <Input />
      </Form.Item>

      <Form.Item style={{width: '60%'}} label="Partial Allowed" name="partialAllowed" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item style={{width: '60%'}} label="Rejected Allowed" name="rejectAllowed" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item style={{width: '60%'}} label="Skip Allowed" name="skipAllowed" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item style={{width: '60%'}} label="Current Version" name="currentVersion" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Form>
    </div>
  );
});

ByMainForm.displayName = 'ByMainForm';
export default ByMainForm;