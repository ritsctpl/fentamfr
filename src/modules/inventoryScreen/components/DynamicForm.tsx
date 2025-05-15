import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Switch, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { DynamicBrowse } from '@components/BrowseComponent';
import { InventoryContext } from '../hooks/InventoryContext';



interface DynamicFormProps {
  data: any;
  fields: string[];
  onValuesChange: (changedValues: any) => void;
}

const typesOptions = [
  { value: 'Production', label: 'Production' },
  { value: 'value', label: 'Value' },
];

const { Option } = Select;


const DynamicForm: React.FC<DynamicFormProps> = ({ data, fields, onValuesChange }) => {
  const { isEditing, erpShift } = useContext(InventoryContext);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [timeZone, setTimeZone] = useState(
    (data.timeZone) || null
  );

  useEffect(() => {
    form.setFieldsValue({
      ...data,
      hireDate: data.hireDate ? moment(data.hireDate, "YYYY-MM-DD") : null,
    });
    setTimeZone((data.timeZone) || null)
  }, [data, form]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value.trimStart();
    // Define regex patterns for validation
    const patterns: { [key: string]: RegExp } = {
      userId: /^[a-z0-9_]*$/,
      firstName: /^[A-Z0-9_]*$/,
      lastName: /^[A-Z0-9_]*$/,
      employeeNumber: /^\d*$/,
      description: /^.*$/,
      employeePersonalNumber: /^\d*$/,
      emailAddress: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      site: /^[A-Z0-9_]*$/,
    };

    // Only remove special characters for fields other than description and site
    if (key !== 'description' && key !== 'site') {
      newValue = newValue.replace(/[^a-zA-Z0-9_]/g, '');
    }


    if (key === 'site') {
      newValue = newValue.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    }

    switch (key) {
      case 'userId':
        if (patterns.userId.test(newValue)) {
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      // case 'site':
      //   if (patterns.employeeNumber.test(newValue)) {
      //     form.setFieldsValue({ [key]: newValue });
      //     onValuesChange({ [key]: newValue });
      //   }
      //   break;
      case 'site':
        newValue = newValue.toUpperCase();  // Convert to uppercase
        if (patterns.site.test(newValue)) {  // Use site-specific pattern
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      case 'lastName':
        newValue = newValue.toUpperCase();
        if (patterns.firstName.test(newValue)) {
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      case 'employeeNumber':
      case 'employeePersonalNumber':
        if (patterns.employeeNumber.test(newValue)) {
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      case 'emailAddress':
        if (patterns.emailAddress.test(newValue)) {
          form.setFieldsValue({ [key]: newValue });
          onValuesChange({ [key]: newValue });
        }
        break;
      case 'description':
        // Allow all characters including spaces
        form.setFieldsValue({ [key]: newValue });
        onValuesChange({ [key]: newValue });
        break;
      default:
        // For keys that don't need special validation, you might want to apply default handling
        form.setFieldsValue({ [key]: newValue });
        onValuesChange({ [key]: newValue });
        break;
    }
  };

  const handleTimeZoneChange = (newValues: any[]) => {

    if (newValues.length === 0) {
      setTimeZone("");
      onValuesChange({ timeZone: '' });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].timeZone;
      setTimeZone(newValue);
      onValuesChange({ timeZone: newValue });
    }
  };


  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={(values) => console.log('Form Values:', values)}
      onValuesChange={(changedValues) => onValuesChange(changedValues as any)}
      style={{ width: '90%' }}
      labelCol={{ span: 8 }}
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

        if (key === 'type') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Select defaultValue={value}>
                {typesOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        if (key === 'site') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={`${t(`${key}`)}`}
              required
            >
              <Input defaultValue={value} disabled={isEditing && erpShift} onChange={(e) => handleInputChange(e, key)} />
            </Form.Item>
          );
        }

        if (key === 'description') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={`${t(`${key}`)}`}
            >
              <Input defaultValue={value} onChange={(e) => handleInputChange(e, key)} />
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
              <Switch checked={value} onChange={(checked) => onValuesChange({ [key]: checked })} />
            </Form.Item>
          );
        }


        if (['employeeNumber', 'erpPersonnelNumber'].includes(key)) {
          const inputType = key === 'employeeNumber' || key === 'erpPersonnelNumber' ? 'number' : 'text';
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input
                type='number'
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }
        if (['firstName', 'lastName'].includes(key)) {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
            </Form.Item>
          );
        }
        if (['user'].includes(key)) {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              required
            >
              <Input
                defaultValue={value}
                onChange={(e) => handleInputChange(e, key)}
              />
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
