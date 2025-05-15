import React, { useContext, useEffect } from 'react';
import { Form, Input, Checkbox, Radio } from 'antd';
import { UserContext } from '../hooks/userContext';
import { useTranslation } from 'react-i18next';

const ProductionQuantitiesForm: React.FC = () => {
    const { formData, setFormData,isEditing ,erpShift,setValueChange} = useContext(UserContext);
  const [form] = Form.useForm();
  const { t } = useTranslation();


  // Initialize form with existing productionQuantities
  React.useEffect(() => {
    // Check if formData and productionQuantities are defined
    if (formData?.productionQuantities && formData?.productionQuantities?.length > 0) {
      form.setFieldsValue(formData?.productionQuantities[0]);
    }
  }, [formData, form]);
  
  useEffect(() => {
    // Check if we are editing and erpShift is false
    if (isEditing === true && erpShift === false) {
      form.resetFields(); // Reset the form fields
    }
  }, [isEditing, erpShift]);

  // Update formData on form values change
  const handleValuesChange = (changedValues: any) => {
    setValueChange(true);
    setFormData({
      ...formData,
      productionQuantities: [{ ...form.getFieldsValue(), ...changedValues }],
    });
  };

  // Inline styles
  const formContainerStyle: React.CSSProperties = {
    width: '50%',
    margin: '0 auto', // Center the form horizontally
  };
  return (
    <div style={formContainerStyle}>
      <Form
        form={form}
        layout="horizontal"
        onValuesChange={handleValuesChange}
        labelCol={{ span: 9 }}
      wrapperCol={{ span: 14 }}
      >
        <Form.Item name="orderedQty" label={t('orderedQty')} initialValue={0}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="underDeliveryTolerance" label={t('underDeliveryTolerance')} initialValue={0}>
          <Input type="number" disabled/>
        </Form.Item>

        <Form.Item name="overDeliveryTolerance" label={t('overDeliveryTolerance')} initialValue={0}>
          <Input type="number" disabled/>
        </Form.Item>

        <Form.Item name="maximumDeliveryQty" label={t('maximumDeliveryQty')} initialValue={0}>
          <Input type="number" />
        </Form.Item>
        <Form.Item name="recommendedBuildQtyToReachMinimumDeliveryQty" label={t('minimumDeliveryQty')} initialValue={0}>
          <Input type="number" />
        </Form.Item>
        <Form.Item
          name="overDeliveryMaximumDeliveryQty"
          label={t('defineDeliveryToleranceIn')}
          initialValue="Numeric" // Set the default value here
        >
          <Radio.Group>
            <Radio value="Numeric">Numeric</Radio>
            <Radio value="Percentage">Percentage</Radio>
          </Radio.Group>
        </Form.Item>

              <Form.Item name="unlimitedOverDelivery" valuePropName="checked" initialValue={false}>
        <span>{t('unlimited_over_delivery')}</span> 
        <Checkbox style={{ marginLeft: 8 }}> 
        
        </Checkbox>
      </Form.Item>

      <Form.Item name="doneQty" label={t('doneQty')} initialValue={0}>
  <Input type="number" disabled/>
</Form.Item>

<Form.Item name="releasedQty" label={t('releasedQty')} initialValue={0}>
  <Input type="number" disabled/>
</Form.Item>

<Form.Item name="qtyInQueueOrWork" label={t('qtyInQueueOrWork')} initialValue={0}>
  <Input type="number" disabled/>
</Form.Item>

<Form.Item name="scrappedQty" label={t('scrappedQty')} initialValue={0}>
  <Input type="number" disabled/>
</Form.Item>

<Form.Item name="unreleasedQty" label={t('unreleasedQty')} initialValue={0}>
  <Input type="number" disabled/>
</Form.Item>

<Form.Item name="buildQty" label={t('buildQty')} initialValue={0}>
  <Input type="number" disabled/>
</Form.Item>

<Form.Item
  name="recommendedBuildQtyToReachOrderedQty"
  label={<span>{t('recommendedBuildQtyToReachOrderedQty')}</span>}
  initialValue={0}
>
  <Input type="number" disabled />
</Form.Item>

<Form.Item
  name="recommendedBuildQtyToReachMinimumDeliveryQty"
  label={<span>{t('recommendedBuildQtyToReachMinimumDeliveryQty')}</span>}
  initialValue={0}
>
  <Input type="number" disabled />
</Form.Item>


      </Form>
    </div>
  );
};

export default ProductionQuantitiesForm;
