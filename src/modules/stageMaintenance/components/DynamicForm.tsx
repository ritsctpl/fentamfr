import React, { useEffect, useState } from 'react';
import { Form, Input, Switch, Select } from 'antd';
import { stageTypeOptions, statusOptions ,uiDefaultResoureType, uiWc, uiResoureType } from '@modules/stageMaintenance/types/stageTypes';
import { useTranslation } from 'react-i18next';
import { DynamicBrowse } from '@components/BrowseComponent';
import { StageData } from '@modules/stageMaintenance/types/stageTypes';

interface FormValues {
  [key: string]: any;
  workCenter?: string;
  resourceType?: string;
  operationType?: string;
  status?: string;
  defaultResource?: string;
  description?: string; 
}

interface DynamicFormProps {
  data: FormValues;
  fields: string[];
  onValuesChange: (changedValues: FormValues) => void;
}


const { Option } = Select;

const DynamicForm: React.FC<DynamicFormProps> = ({ data, fields, onValuesChange }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<StageData>();
  const [workCenter, setWorkCenter] = useState<string | undefined>(data.workCenter);
  const [resourceType, setResourceType] = useState<string | undefined>(data.resourceType);
  const [defaultResource, setDefaultResource] = useState<string | undefined>(data.defaultResource);

  useEffect(() => {
    form.setFieldsValue({
      ...data,
      workCenter: workCenter,
      resourceType: resourceType,
      defaultResource: defaultResource
    });
    setDefaultResource(data.defaultResource);
    setWorkCenter(data.workCenter);
    setResourceType(data.resourceType);
  }, [data, form, workCenter, resourceType, defaultResource]);

  const handleWorkCenterChange = (newValues: any[]) => {
    if(newValues.length ===0) {
      setWorkCenter("");
      onValuesChange({ workCenter: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].workCenter;
      setWorkCenter(newValue);
      onValuesChange({ workCenter: newValue.toUpperCase() });
    }
  };

  const handleResourceChange = (newValues: any[]) => {
    console.log(newValues,"array");
    
    if(newValues.length ===0) {
      setResourceType("");
      onValuesChange({ resourceType: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].resourceType;
      setResourceType(newValue);
      onValuesChange({ resourceType: newValue.toUpperCase() });
    }
  };

  const handleDefaultResourceChange = (newValues: any[]) => {
    if(newValues.length ===0) {
      setDefaultResource("");
      onValuesChange({ defaultResource: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].resource;
      setDefaultResource(newValue);
      onValuesChange({ defaultResource: newValue.toUpperCase() });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const rawValue = e.target.value;
    let sanitizedValue;

    if (key === 'description') {
      sanitizedValue = rawValue;
    } else {
      sanitizedValue = rawValue
        .replace(/[^a-zA-Z0-9_]/g, '') 
        .toUpperCase(); 
    }

    form.setFieldsValue({ [key]: sanitizedValue });
    onValuesChange({ [key]: sanitizedValue });
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={(values) => console.log('Form Values:', values)}
      onValuesChange={(changedValues) => onValuesChange(changedValues as FormValues)}
      style={{ width: '60%' }}
      labelCol={{ span: 12 }}
      wrapperCol={{ span: 14 }}
    >
      {fields.map((key) => {
        const value = data[key];
        if (value === undefined) {
          return null;
        }

        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());

        if (key === 'operationType') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Select defaultValue={value}>
                {stageTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        if (key === 'status') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Select defaultValue={value}>
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }

        if (key === 'workCenter') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true }]}
            >
              <DynamicBrowse 
                uiConfig={uiWc} 
                initial={workCenter} 
                onSelectionChange={handleWorkCenterChange} 
              />
            </Form.Item>
          );
        }

        if (key === 'resourceType') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={`${t(`${key}`)}`} 
              rules={[{ required: true }]} 
            >
              <DynamicBrowse 
                uiConfig={uiResoureType} 
                initial={resourceType} 
                onSelectionChange={handleResourceChange} 
              />
            </Form.Item>
          );
        }

        if (key === 'defaultResource') {
          return (
            <Form.Item
            key={key}
            name={key}
            label={`${t(`${key}`)}`} 
            rules={[{ required: true }]}
          >
              <DynamicBrowse 
                uiConfig={uiDefaultResoureType} 
                initial={defaultResource} 
                onSelectionChange={handleDefaultResourceChange} 
              />
            </Form.Item>
          );
        }

        if (typeof value === 'boolean') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              valuePropName="checked"
            >
              <Switch checked={value} />
            </Form.Item>
          );
        }
        if (key === 'maxLoopCount') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input type='number' defaultValue={value} onChange={(e) => handleInputChange(e, key)} />
            </Form.Item>
          );
        }
        if (key === 'operation') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true, message: `${t(`${key}`)} is required` }]}
            >
              <Input defaultValue={value} onChange={(e) => handleInputChange(e, key)} />
            </Form.Item>
          );
        }

        if (key === 'revision') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              rules={[{ required: true, message: `${t(`${key}`)} is required` }]}
            >
              <Input defaultValue={value} onChange={(e) => handleInputChange(e, key)} />
            </Form.Item>
          );
        }

        return (
          <Form.Item
            key={key}
            name={key}
            label={t(`${key}`)}
          >
            <Input defaultValue={value} onChange={(e) => handleInputChange(e, key)} />
          </Form.Item>
        );
      })}
    </Form>
  );
};

export default DynamicForm;
