'use client'

import React from 'react';
import { Button, Form, Input, InputNumber, Select, Switch } from 'antd';
import { useForm } from 'antd/es/form/Form';

type InputType = 'text' | 'email' | 'textarea' | 'switch' | 'select';

interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  type: InputType;
  label: string;
  name: string;
  value?: string | boolean;
  options?: FormFieldOption[];
  required?: boolean;
  component?: 'dynamicBrowse';
}

interface CommonFormProps {
  schema: FormField[];
  onFinish: (values: any) => void;
  onFinishFailed: (errorInfo: any) => void;
  onSelectChange?: (fieldName: string, value: string) => void;
  selectedRowData: {};
}

const CommonForm: React.FC<CommonFormProps> = ({ schema, onFinish, onFinishFailed, onSelectChange, selectedRowData }) => {
  const [form] = useForm();

  const handleSelectChange = (value: string, fieldName: string) => {
    if (onSelectChange) {
      onSelectChange(fieldName, value);
    }
  };

  React.useEffect(() => {
    form.setFieldsValue(selectedRowData);
  }, [selectedRowData, form]);

  return (
    <Form
      name="dynamic-form"
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={schema.reduce((acc, field) => {
        acc[field.name] = field.value || '';
        return acc;
      }, {} as Record<string, any>)}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      {schema.map((field, index) => (
        <Form.Item
          key={index}
          label={field.label}
          name={field.name}
          rules={field.required ? [{ required: true, message: `${field.label} is required` }] : []}
        >
          {field.type === 'text' || field.type === 'email' ? (
            <Input type={field.type} />
          ) : field.type === 'textarea' ? (
            <Input.TextArea />
          ) : field.type === 'switch' ? (
            <Switch checkedChildren="on" unCheckedChildren="off" />
          ) : field.type === 'select' ? (
            <Select onChange={(value) => handleSelectChange(value, field.name)}>
              {field.options?.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          ) : field.type === 'number' ? (
            <InputNumber />
          ) : null}
        </Form.Item>
      ))}
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CommonForm;