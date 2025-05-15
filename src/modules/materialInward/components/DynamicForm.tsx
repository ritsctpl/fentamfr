import React from 'react';
import { Form, Input, Button, Col, Row, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const FormMaterial: React.FC = () => {
  const [form] = Form.useForm();

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

  const h2Style = { color: '#BEA260', marginBottom: '16px' }; // Define styles here

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={onFinish}
      style={{ maxWidth: '90%', margin: '0 auto', padding: '20px' }}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 14 }}
    >
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <h2 style={h2Style}>General Info</h2>
          <Form.Item
            label="Material Code"
            name="materialCode"
            rules={[{ required: true, message: 'Please input the material code!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Material Description"
            name="materialDescription"
            rules={[{ required: true, message: 'Please input the material description!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Purchase Order Number"
            name="purchaseOrderNumber"
            rules={[{ required: true, message: 'Please input the purchase order number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="GRN Number"
            name="grnNumber"
            rules={[{ required: true, message: 'Please input the GRN number!' }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <h2 style={h2Style}>Supplier Info</h2>
          <Form.Item
            label="Supplier Name"
            name="supplierName"
            rules={[{ required: true, message: 'Please input the supplier name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Supplier ID"
            name="supplierId"
            rules={[{ required: true, message: 'Please input the supplier ID!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Invoice Number"
            name="invoiceNumber"
            rules={[{ required: true, message: 'Please input the invoice number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Document"
            name="document"
            rules={[{ required: true, message: 'Please input the document!' }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <h2 style={h2Style}>Storage Location</h2>
          <Form.Item
            label="Warehouse Code"
            name="warehouseCode"
            rules={[{ required: true, message: 'Please input the warehouse code!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Storage Bin"
            name="storageBin"
            rules={[{ required: true, message: 'Please input the storage bin!' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <h2 style={h2Style}>Delivery Info</h2>
          <Form.Item
            label="Delivery Number"
            name="deliveryNumber"
            rules={[{ required: true, message: 'Please input the delivery number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Delivery Type"
            name="deliveryType"
            rules={[{ required: true, message: 'Please input the delivery type!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Vehicle Number"
            name="vehicleNumber"
            rules={[{ required: true, message: 'Please input the vehicle number!' }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <h2 style={h2Style}>Inward Details</h2>
          <Form.Item
            label="Date Time of Receipt"
            name="receiptDateTime"
            rules={[{ required: true, message: 'Please input the date and time of receipt!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Gate/Dock Number"
            name="gateDockNumber"
            rules={[{ required: true, message: 'Please input the gate/dock number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Attachment Document"
            name="attachmentDocument"
            rules={[{ required: true, message: 'Please upload the document!' }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={8}>
          <h2 style={h2Style}>Attachment</h2>
          <Form.Item
            label="Document"
            name="document"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => Array.isArray(e) ? e : e && e.fileList}
            rules={[{ required: true, message: 'Please upload the document!' }]}
          >
            <Upload
              name="files"
              action="/upload.do" // Change this to your upload URL
              onChange={handleUploadChange}
              beforeUpload={() => false} // Prevent automatic upload
            >
              <Button icon={<UploadOutlined />}>Upload Document</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default FormMaterial;
