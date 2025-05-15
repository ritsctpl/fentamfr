import React, { useContext, useEffect } from 'react';
import { Form, Input, Button, Select, Checkbox } from 'antd';
import { OperationContext } from '../hooks/recipeContext';

const { Option } = Select;

const PackagingLabeling: React.FC = () => {
  const { formData, setFormData } = useContext(OperationContext);
  const [form] = Form.useForm();

  useEffect(() => {
    if (formData?.packagingAndLabeling) {
      const { environmentalRequirements, ...rest } = formData?.packagingAndLabeling;
      form.setFieldsValue({
        ...rest,
        storageTemperature: environmentalRequirements.storageTemperature.replace('°C', ''),
        humidityRange: environmentalRequirements.humidityRange.replace('%', ''),
        protectionFromLight: environmentalRequirements.protectionFromLight,
      });
    }
  }, [formData, form]);

  const handleValuesChange = (changedValues: any) => {
    const currentValues = form.getFieldsValue();
    const updatedValues = {
      ...currentValues,
      ...changedValues,
      environmentalRequirements: {
        storageTemperature: `${changedValues.storageTemperature || currentValues.storageTemperature}°C`,
        humidityRange: `${changedValues.humidityRange || currentValues.humidityRange}%`,
        protectionFromLight: changedValues.protectionFromLight !== undefined ? changedValues.protectionFromLight : currentValues.protectionFromLight,
      },
    };

    setFormData(prevFormData => ({
      ...prevFormData,
      packagingAndLabeling: updatedValues,
    }));
    
    console.log('Updated Form Values:', updatedValues);
  };

  return (
    <Form 
      form={form} 
      layout="horizontal" 
      onValuesChange={handleValuesChange} 
      style={{ width: '60%' }}
      labelCol={{ span: 12 }}
      wrapperCol={{ span: 12 }}
    >
      <Form.Item name="packagingType" label="Packaging Type" rules={[{ required: true }]}>
        <Select placeholder="Select packaging type">
          <Option value="box">Box</Option>
          <Option value="bottle">Bottle</Option>
          <Option value="bag">Bag</Option>
        </Select>
      </Form.Item>
      <Form.Item name="primaryPackagingMaterial" label="Primary Packaging Material" >
        <Input />
      </Form.Item>
      <Form.Item name="secondaryPackagingType" label="Secondary Packaging Type">
        <Input />
      </Form.Item>
      <Form.Item name="containerSize" label="Container Size" >
        <Input type="number" />
      </Form.Item>
      <Form.Item name="labelFormat" label="Label Format">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="storageTemperature" label="Storage Temperature (°C)" >
        <Input type="number" />
      </Form.Item>
      <Form.Item name="humidityRange" label="Humidity Range (%)" >
        <Input type="number" />
      </Form.Item>
      <Form.Item name="protectionFromLight" label="Protection from Light" valuePropName="checked">
        <Checkbox />
      </Form.Item>
    </Form>
  );
};

export default PackagingLabeling;
