import React, { useState } from 'react';
import { Form, Input, Button, Col, Row, Upload, message,Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;

const FormMaterialsOutward: React.FC = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState<string>('Material');

  // Define initial values for the outward form
  const initialValues = {
    materialCode: '', // Set your default value here
    materialDescription: '',
    shipmentOrderNumber: '',
    deliveryNumber: '',
    recipientName: '',
    recipientId: '',
    warehouseCode: '',
    vehicleNumber: '',
    dispatchDateTime: '',
    gateDockNumber: '',
    document: null,
  };

  const handleScan = () => {
    const boxNumber = form.getFieldValue('id');
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:mm:ss'
    // Example: Fetching data based on box number
    const dataFromScan = {
      materialCode: 'DEFAULT_CODE', // Set your default value here
    materialDescription: 'Default description',
    shipmentOrderNumber: '12345',
    deliveryNumber: '67890',
    recipientName: 'Name',
    recipientId: 'R123456',
    warehouseCode: 'WH001',
    vehicleNumber: 'V1234',
    dispatchDateTime: '2024-09-26 10:00',
    gateDockNumber: 'GD001',
    document: null,
    type:'People Movement'
    };

    form.setFieldsValue(dataFromScan);
  };
  const onFinish = (values: any) => {
    console.log('Form values:', values);
    // Handle form submission logic here
  };

  const handleUploadChange = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const h2Style = { color: '#BEA260', marginBottom: '16px' };

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={onFinish}
      initialValues={initialValues} // This ensures the form starts with the specified values
      style={{ maxWidth: '90%', margin: '0 auto', padding: '20px' }}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 14 }}
    >
       <Row gutter={8} style={{ alignItems: 'center' }}>
  <Col span={12}>
    <Form.Item
      label={t('boxNumber')}
      name="id"
      rules={[{ required: true, message: t('inputMaterialCode') }]}
      style={{ width: '100%' }} // Use 100% width for proper alignment
    >
      <Row gutter={8} style={{ alignItems: 'center' }}>
        <Col flex="auto">
          <Input style={{ height: '40px', width: '100%' }} />
        </Col>
        <Col>
          <Button
            style={{
              height: '40px',
              backgroundColor: '#BEA260',
              color: 'white',
              borderColor: '#BEA260',
            }}
            onClick={handleScan}
          >
            {t('scan')}
          </Button>
        </Col>
      </Row>
    </Form.Item>
  </Col>
  
  <Col span={12}>
    <Form.Item
      label={t('classification')}
      name="type" // Change name to 'type' to avoid duplication with the previous Form.Item
      rules={[{ required: true, message: t('inputMaterialCode') }]}
      style={{ width: '100%' }} // Use 100% width for proper alignment
    >
      <Select
        placeholder="Select an option"
        value={selectedValue}
        style={{ width: '100%' }} // Ensures the Select has the same width as the Input
      >
         <Option value="Material">Material</Option>
  <Option value="People Movement">People Movement</Option>
  <Option value="Engineering">Engineering</Option>
      </Select>
    </Form.Item>
  </Col>
</Row>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <h2 style={h2Style}>{t('generalInfo')}</h2>
          <Form.Item
            label={t('materialCode')}
            name="materialCode"
            rules={[{ required: true, message: t('inputMaterialCode') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('materialDescription')}
            name="materialDescription"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label={t('shipmentOrderNumber')}
            name="shipmentOrderNumber"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('deliveryNumber')}
            name="deliveryNumber"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <h2 style={h2Style}>{t('recipientInfo')}</h2>
          <Form.Item
            label={t('recipientName')}
            name="recipientName"
            rules={[{ required: true, message: t('inputRecipientName') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('recipientId')}
            name="recipientId"
            rules={[{ required: true, message: t('inputRecipientID') }]}
          >
            <Input />
          </Form.Item>
        </Col>

        {/* <Col span={8}>
          <h2 style={h2Style}>{t('storageLocation')}</h2>
          <Form.Item
            label={t('warehouseCode')}
            name="warehouseCode"
          >
            <Input />
          </Form.Item>
        </Col> */}
         <Col span={8}>
          <h2 style={h2Style}>{t('dispatchInfo')}</h2>
          <Form.Item
            label={t('vehicleNumber')}
            name="vehicleNumber"
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
       

        <Col span={8}>
          <h2 style={h2Style}>{t('dispatchDetails')}</h2>
          <Form.Item
            label={t('dispatchDateTime')}
            name="dispatchDateTime"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('gateDockNumber')}
            name="gateDockNumber"
            rules={[{ required: true, message: t('inputGateDockNumber') }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <h2 style={h2Style}>{t('attachment')}</h2>
          <Form.Item
            label={t('document')}
            name="document"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => Array.isArray(e) ? e : e && e.fileList}
            rules={[{ required: true, message: t('inputDocument') }]}
          >
            <Upload
              name="files"
              action="/upload.do" // Change this to your upload URL
              onChange={handleUploadChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}></Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>

    </Form>
  );
};

export default FormMaterialsOutward;
