import React, { useState } from 'react';
import { Form, Input, Button, Col, Row, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import MyTable from './Table';
import ButtonRow from './ButtonRow';
const { Option } = Select;
const FormMaterials: React.FC = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState<string>('Material');

  const initialValues = {
    materialCode: '',
    materialDescription: '',
    purchaseOrderNumber: '',
    grnNumber: '',
    supplierName: '',
    supplierId: '',
    invoiceNumber: '',
    document: null,
    warehouseCode: '',
    storageBin: '',
    deliveryNumber: '',
    deliveryType: '',
    vehicleNumber: '',
    receiptDateTime: '',
    gateDockNumber: '',
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

  const handleScan = () => {
    const boxNumber = form.getFieldValue('id');
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:mm:ss'
    // Example: Fetching data based on box number
    const dataFromScan = {
      materialCode: '12345', // Replace with actual data fetching logic
      materialDescription: 'Description for ' + boxNumber,
      purchaseOrderNumber: 'PO-123',
      grnNumber: 'GRN-123',
      supplierName: 'Supplier for ' + boxNumber,
      supplierId: 'SUP-123',
      invoiceNumber: 'INV-123',
      warehouseCode: 'WH-123',
      storageBin: 'BIN-123',
      deliveryNumber: 'DEL-123',
      deliveryType: 'Express',
      vehicleNumber: 'VEH-123',
      receiptDateTime: currentDateTime,
      gateDockNumber: 'GATE-123',
      type:'People Movement'
    };

    form.setFieldsValue(dataFromScan);
  };

  const h2Style = { color: '#BEA260', marginBottom: '16px' };
  const handleClear = () => {
    form.resetFields(); 
    console.log('Clear button clicked');
};
  return (
    <><Form
      form={form}
      layout="horizontal"
      onFinish={onFinish}
      initialValues={initialValues}
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
            label={t('prelautid')}
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
            label={t('purchaseOrderNumber')}
            name="purchaseOrderNumber"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('grnNumber')}
            name="grnNumber"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <h2 style={h2Style}>{t('supplierInfo')}</h2>
          <Form.Item
            label={t('supplierName')}
            name="supplierName"
            rules={[{ required: true, message: t('inputSupplierName') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('supplierId')}
            name="supplierId"
            rules={[{ required: true, message: t('inputSupplierID') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('invoiceNumber')}
            name="invoiceNumber"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('document')}
            name="document"
            rules={[{ required: true, message: t('inputDocument') }]}
          >
            <Upload
              name="files"
              action="/upload.do"
              onChange={handleUploadChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}></Button>
            </Upload>
          </Form.Item>
        </Col>
        <Col span={8}>
          <h2 style={h2Style}>{t('deliveryInfo')}</h2>
          <Form.Item
            label={t('deliveryNumber')}
            name="deliveryNumber"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('deliveryType')}
            name="deliveryType"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('vehicleNumber')}
            name="vehicleNumber"
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
          <Form.Item
            label={t('storageBin')}
            name="storageBin"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('type')}
            name="type"
          >
             <Select
              placeholder="Select an option"
              value={selectedValue}
            >
              <Option value="Material">Material</Option>
              <Option value="People">People</Option>
              <Option value="Machine">Machine</Option>
            </Select>
          </Form.Item>
        </Col> */}
      </Row>

      <Row gutter={[16, 16]}>

        <Col span={8}>
          <h2 style={h2Style}>{t('inwardDetails')}</h2>
          <Form.Item
            label={t('receiptDateTime')}
            name="receiptDateTime"
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
              action="/upload.do"
              onChange={handleUploadChange}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}></Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
    </Form>
    <MyTable />
    <ButtonRow onClear={handleClear} /></>
  );
};

export default FormMaterials;
