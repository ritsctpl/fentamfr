import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { FormValues, ShopOrder, bomTypeOptions, orderTypeOptions, statusOptions, uiPlaner, uiPlanerBom, uiPlanerRouter, uiPlanerWc } from '@modules/shopOrderMaintenance/types/shopTypes';
import { DynamicBrowse } from '@components/BrowseComponent';




interface DynamicFormProps {
  data: ShopOrder;
  fields: string[];
  onValuesChange: (changedValues: FormValues) => void;
}


const { Option } = Select;

const DynamicForm: React.FC<DynamicFormProps> = ({ data, fields, onValuesChange }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [plannedMaterial, setPlannedMaterial] = useState<string | undefined>(data.plannedMaterial);
  const [plannedRouting,setPlannedRouting ] = useState<string | undefined>(data.plannedRouting);
  const [plannedBom,setPlannedBom ] = useState(data.plannedBom);
  const [plannedWorkCenter,setPlannedWorkCenter ] = useState<string | undefined>(data.plannedWorkCenter);


  useEffect(() => {
    form.setFieldsValue({
      ...data,
      plannedStart: data.plannedStart ? dayjs(data.plannedStart, "YYYY-MM-DD") : null,
      plannedCompletion: data.plannedCompletion ? dayjs(data.plannedCompletion, "YYYY-MM-DD") : null,
      scheduledStart: data.scheduledStart ? dayjs(data.scheduledStart, "YYYY-MM-DD") : null,
      scheduledEnd: data.scheduledEnd ? dayjs(data.scheduledEnd, "YYYY-MM-DD") : null,
    });
    setPlannedMaterial(data.plannedMaterial);
    setPlannedRouting(data.plannedRouting);
    setPlannedBom(data.plannedBom);
    setPlannedWorkCenter(data.plannedWorkCenter);
  }, [data, form]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    let newValue = e.target.value.trimStart();

    // Define regex patterns for validation
    const patterns: { [key: string]: RegExp } = {
        plannedMaterial: /^[A-Z0-9_]*$/,
        shopOrder: /^[A-Z0-9_]*$/,
    };

    // Remove special characters except underscores for most cases
    newValue = newValue.replace(/[^a-zA-Z0-9_]/g, '');

    switch (key) {
        case 'userId':
            if (patterns.userId.test(newValue)) {
                form.setFieldsValue({ [key]: newValue });
                onValuesChange({ [key]: newValue });
            }
            break;
        case 'plannedMaterial':
        case 'shopOrder':
        case 'plannedBom':
        case 'materialVersion':
            newValue = newValue.toUpperCase();
            if (patterns.plannedMaterial.test(newValue)) {
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
        default:
            form.setFieldsValue({ [key]: newValue });
            onValuesChange({ [key]: newValue });
            break;
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null, key: string) => {
    const dateString = date;
    console.log(dateString)
    form.setFieldsValue({ [key]: dateString });
    onValuesChange({ [key]: dateString });
  };

  
  const handlePlannedMaterial = (newValues: any[]) => {
    if(newValues.length ===0) {
      setPlannedMaterial("");
      onValuesChange({ plannedMaterial: "",materialVersion:"" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].item;
      const newVersion = newValues[0].revision;
      setPlannedMaterial(newValue);
      onValuesChange({ plannedMaterial: newValue.toUpperCase(),materialVersion:newVersion.toUpperCase() });
    }
  };
  const handlePlannedRouting = (newValues: any[]) => {
    if(newValues.length ===0) {
      setPlannedRouting("");
      onValuesChange({ plannedRouting: "",routingVersion:"" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].routing;
      const newVersion = newValues[0].version;
      setPlannedRouting(newValue);
      onValuesChange({ plannedRouting: newValue.toUpperCase(),routingVersion:newVersion.toUpperCase() });
    }
  };

  

  const handlePlannedBom = (newValues: any[]) => {
    console.log(newValues,"newwww");
    
    if(newValues.length ===0) {
      setPlannedBom("");
      onValuesChange({ plannedBom: "",bomVersion:"" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].bom;
      const newVersion = newValues[0].revision;
      setPlannedBom(newValue);
      onValuesChange({ plannedBom: newValue.toUpperCase(),bomVersion:newVersion.toUpperCase() });
    }
  };
  
  const handlePlannedWc = (newValues: any[]) => {
    if(newValues.length ===0) {
      setPlannedWorkCenter("");
      onValuesChange({ plannedWorkCenter: "" });
    }
    if (newValues.length > 0) {
      const newValue = newValues[0].workCenter;
      setPlannedWorkCenter(newValue);
      onValuesChange({ plannedWorkCenter: newValue.toUpperCase()});
    }
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={(values) => console.log('Form Values:', values)}
      onValuesChange={(changedValues) => onValuesChange(changedValues as FormValues)}
      style={{ width: '60%' }}
      labelCol={{ span: 12 }}
      wrapperCol={{ span: 10 }}
    >
      {fields.map((key) => {
        const value = data[key];
        if (value === undefined) {
          return null;
        }

        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());

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
        if (key === 'orderType') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Select defaultValue={value}>
                {orderTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        if (key === 'bomType') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Select defaultValue={value}>
                {bomTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        if (key === 'orderedQty') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <Input type="number" defaultValue={value} onChange={(e) => handleInputChange(e, key)} />
            </Form.Item>
          );
        }
        if (key === 'priority' || key === 'buildQty') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              required
            >
              <Input type="number" defaultValue={value} onChange={(e) => handleInputChange(e, key)} />
            </Form.Item>
          );
        }
        if (key === 'plannedMaterial') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              required
            >
                <DynamicBrowse 
                uiConfig={uiPlaner} 
                initial={plannedMaterial} 
                onSelectionChange={handlePlannedMaterial} 
              />
            </Form.Item>
          );
        }
        if (key === 'plannedRouting') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              
            >
                <DynamicBrowse 
                uiConfig={uiPlanerRouter} 
                initial={plannedRouting} 
                onSelectionChange={handlePlannedRouting} 
              />
            </Form.Item>
          );
        }
        if (key === 'plannedBom') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
                <DynamicBrowse 
                uiConfig={uiPlanerBom} 
                initial={plannedBom} 
                onSelectionChange={handlePlannedBom} 
              />
            </Form.Item>
          );
        }
        if (key === 'plannedWorkCenter') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
                <DynamicBrowse 
                uiConfig={uiPlanerWc} 
                initial={plannedWorkCenter} 
                onSelectionChange={handlePlannedWc} 
              />
            </Form.Item>
          );
        }
        if (key === 'shopOrder') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
              required
            >
              <Input type="text" defaultValue={value} onChange={(e) => handleInputChange(e, key)} />
            </Form.Item>
          );
        }
        if (key === 'plannedStart' || key === 'plannedCompletion' || key === 'scheduledStart' || key === 'scheduledEnd') {
          return (
            <Form.Item
              key={key}
              name={key}
              label={t(`${key}`)}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD"
                defaultValue={value ? dayjs(value) : null}
                onChange={(date) => handleDateChange(date, key)}
                style={{ width: "100%" }}
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
