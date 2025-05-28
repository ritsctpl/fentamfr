import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Input, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface ConfigureTabProps {
  selectedRow: any;
  onConfigChange?: (handle: string, config: ConfigureFormData) => void;
}

interface ConfigureFormData {
  type: 'header' | 'body' | 'footer';
  logo: string;
  pageOccurrence: 'all' | null;
  margin: string | number;
  height: string | number;
  alignment: 'left' | 'center' | 'right';
}

export const ConfigureTab: React.FC<ConfigureTabProps> = ({
  selectedRow,
  onConfigChange
}) => {
  console.log(selectedRow, 'selectedRow');
  
  const [form] = Form.useForm<ConfigureFormData>();
  const [imageUrl, setImageUrl] = useState<string>('');

  // Reset form and update values when selected row changes
  useEffect(() => {
    if (selectedRow) {
      // Reset form first
      form.resetFields();

      const config = selectedRow.config || {
        type: 'body',
        logo: '',
        pageOccurrence: 'all',
        margin: 10,
        height: 10,
        alignment: 'center'
      };

      // Set new values
      form.setFieldsValue({
        type: config.type || 'body',
        logo: config.logo || '',
        pageOccurrence: config.pageOccurrence || 'all',
        margin: Number(config.margin) || 10,
        height: Number(config.height) || 10,
        alignment: config.alignment || 'center'
      });

      setImageUrl(config.logo || '');
    } else {
      // Reset form when no row is selected
      form.resetFields();
      setImageUrl('');
    }
  }, [selectedRow, form]);

  // Handle form value changes
  const handleValuesChange = (_: any, allValues: ConfigureFormData) => {
    if (selectedRow && onConfigChange) {
      // Convert margin and height to numbers
      const updatedValues = {
        ...allValues,
        margin: Number(allValues.margin) || 10,
        height: Number(allValues.height) || 10
      };
      onConfigChange(selectedRow.handle, updatedValues);
    }
  };

  if (!selectedRow) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#999'
      }}>
        Select a component to configure
      </div>
    );
  }

  return (
    <Card
      title={selectedRow.componentLabel || selectedRow.sectionLabel || selectedRow.groupLabel || selectedRow.label}
      bordered={false}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <div>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          initialValues={{
            type: 'body',
            pageOccurrence: 'all',
            alignment: 'center',
            margin: 10,
            height: 10
          }}
        >
          {/* Type Selection */}
          <Form.Item
            name="type"
            label="Type"
          >
            <Select>
              <Select.Option value="header">Header</Select.Option>
              <Select.Option value="body">Body</Select.Option>
              <Select.Option value="footer">Footer</Select.Option>
            </Select>
          </Form.Item>

          {/* Logo Upload */}
          <Form.Item
            name="logo"
            label="Logo"
          >
            <Input.Group compact>
              <Input
                style={{ width: 'calc(100% - 32px)' }}
                placeholder="Enter logo URL"
                value={imageUrl}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setImageUrl(newValue);
                  form.setFieldsValue({ logo: newValue });
                  if (selectedRow && onConfigChange) {
                    const currentValues = form.getFieldsValue();
                    onConfigChange(selectedRow.handle, {
                      ...currentValues,
                      margin: Number(currentValues.margin) || 10,
                      height: Number(currentValues.height) || 10
                    });
                  }
                }}
              />
              <Upload
                accept="image/*"
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (reader.result) {
                      const url = reader.result.toString();
                      setImageUrl(url);
                      form.setFieldsValue({ logo: url });
                      if (selectedRow && onConfigChange) {
                        const currentValues = form.getFieldsValue();
                        onConfigChange(selectedRow.handle, {
                          ...currentValues,
                          margin: Number(currentValues.margin) || 10,
                          height: Number(currentValues.height) || 10
                        });
                      }
                      onSuccess?.(reader.result);
                    }
                  };
                  reader.readAsDataURL(file as Blob);
                }}
              >
                <Button icon={<UploadOutlined />} />
              </Upload>
            </Input.Group>
          </Form.Item>

          {/* Page Occurrence */}
          <Form.Item
            name="pageOccurrence"
            label="Page Occurrence"
          >
            <Select>
              <Select.Option value="all">All Pages</Select.Option>
            </Select>
          </Form.Item>

          {/* Margin */}
          <Form.Item
            name="margin"
            label="Margin"
          >
            <Input
              placeholder="Enter Margin"
              type="number"
              min={0}
              defaultValue={10}
            />
          </Form.Item>

          {/* Height */}
          <Form.Item
            name="height"
            label="Height"
          >
            <Input
              placeholder="Enter Height"
              type="number"
              min={0}
              defaultValue={10}
            />
          </Form.Item>

          {/* Alignment */}
          <Form.Item
            name="alignment"
            label="Alignment"
          >
            <Select>
              <Select.Option value="left">Left</Select.Option>
              <Select.Option value="center">Center</Select.Option>
              <Select.Option value="right">Right</Select.Option>
            </Select>
          </Form.Item>

          {/* Preview of uploaded logo */}
          {imageUrl && (
            <div style={{ marginBottom: 16 }}>
              <img
                src={imageUrl}
                alt="Logo preview"
                style={{ maxWidth: '100%', maxHeight: 200 }}
              />
            </div>
          )}
        </Form>
      </div>
    </Card>
  );
}; 