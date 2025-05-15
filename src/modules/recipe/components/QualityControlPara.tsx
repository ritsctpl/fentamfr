import React, { useContext, useEffect } from 'react';
import { Form, Input } from 'antd';
import { OperationContext } from '../hooks/recipeContext';
import { useTranslation } from 'react-i18next';

const QualityControlParameters = ({ stepArray, setStep }) => {
  const { t } = useTranslation();
  const { formData, setFormData } = useContext(OperationContext);
  const [form] = Form.useForm();

  useEffect(() => {
    if (stepArray?.qcParameters) {
      const { toolsRequired, ...rest } = stepArray.qcParameters;
      form.setFieldsValue(rest); // Set fields without toolsRequired
    }
  }, []); // Ensure the effect runs when stepArray changes

  const handleValuesChange = (changedValues) => {
    const updatedValues = {
      ...form.getFieldsValue(),
    };

    setStep(prevFormData => ({
      ...prevFormData,
      qcParameters: updatedValues,
    }));

    console.log('Updated Quality Control Values:', updatedValues);
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
      {/* <Form.Item name="qcId" label={t('qcId')} rules={[{ required: true }]}>
        <Input />
      </Form.Item> */}
      <Form.Item name="parameter" label={t('parameter')} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="expectedValue" label={t('expectedValue')} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="monitoringFrequency" label={t('monitoringFrequency')} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="actionsOnFailure" label={t('actionsOnFailure')} rules={[{ required: true }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="actualValue" label={t('actualValue')}>
        <Input />
      </Form.Item>
      <Form.Item name="tolerance" label={t('tolerance')}>
        <Input />
      </Form.Item>
      <Form.Item name="min" label={t('min')} rules={[{ required: true }]}>
        <Input type="number" />
      </Form.Item>
      <Form.Item name="max" label={t('max')} rules={[{ required: true }]}>
        <Input type="number" />
      </Form.Item>
    </Form>
  );
};

export default QualityControlParameters;
