import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  Card,
  Row,
  Col,
} from 'antd';
import { useRoute } from './hooks/routeContext';

interface FormData {
  routingType: string;
  version: string;
  description: string;
  status: string;
  subtype: string;
  document: string;
  bom: string;
  dispositionGroup: string;
  revision: string;
  currentVersion: boolean;
  relaxedRoutingFlow: boolean;
  replicationToErp: boolean;
  parentRoute: boolean;
}

export default function Dynamicform() {
  const [form] = Form.useForm();
  const { formData, setFormData } = useRoute();

  // Update form when formData changes

  useEffect(() => {
    if (formData) {
      form.setFieldsValue({
        routing: formData.routing?.toUpperCase(),
        routingType: formData.routingType || "Master",
        version: formData.version,
        description: formData.description?.toUpperCase(),
        status: formData.status || "New",
        subType: formData.subType || "Sequential",
        document: formData.document,
        bom: formData.bom,
        dispositionGroup: formData.dispositionGroup,
        revision: formData.version, // Using version as revision
        currentVersion: formData.currentVersion,
        relaxedRoutingFlow: formData.relaxedRoutingFlow,
        replicationToErp: formData.replicationToErp,
        parentRoute: formData.parentRoute,
      });
    }else{
      form.resetFields();
    }
  }, [formData]);

  // Handle form field changes
  const onValuesChange = (changedValues: any, allValues: any) => {
    // Ensure required fields are included with their default values if not set
    const updatedValues = {
      ...allValues,
      routingType: allValues.routingType || "Master",
      status: allValues.status || "New",
      subType: allValues.subType || "Sequential"
    };
    
    setFormData(prev => ({
      ...prev,
      ...updatedValues,
    }));
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onValuesChange={onValuesChange}
      initialValues={{
        ...formData,
        currentVersion: false,
        relaxedRoutingFlow: false,
        replicationToErp: false,
        parentRoute: false,
      }}
    >

      <Form.Item
        name="routing"
        label="Routing"
        style={{ width: '60%', }}
        rules={[{ required: true, message: 'Please enter routing' }]}
      >
        <Input/>
      </Form.Item>
      <Form.Item
        name="routingType"
        label="Routing Type"
        style={{ width: '60%' }}
        initialValue={formData?.routingType || "Master"}
        rules={[{ required: true, message: 'Please select routing type' }]}
      >
        <Select>
          <Select.Option value="Master">Master</Select.Option>
          <Select.Option value="ShopOrder Specific">ShopOrder Specific</Select.Option>
          <Select.Option value="PCU Specific">PCU Specific</Select.Option>
          <Select.Option value="NC Routing">NC Routing</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="version"
        style={{ width: '60%' }}
        label="Version"
        rules={[{ required: true, message: 'Please input version' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        style={{ width: '60%' }}
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        style={{ width: '60%' }}
        initialValue={formData?.status || "New"}
        rules={[{ required: true, message: 'Please select status' }]}
      >
        <Select>
          <Select.Option value="Releasable">Releasable</Select.Option>
          <Select.Option value="New">New</Select.Option>
          <Select.Option value="Hold">Hold</Select.Option>
          <Select.Option value="Hold Consec NC">Hold Consec NC</Select.Option>
          <Select.Option value="Hold spc Viol">Hold spc Viol</Select.Option>
          <Select.Option value="Hold SPC warn">Hold SPC warn</Select.Option>
          <Select.Option value="Hold Yield Rate">Hold Yield Rate</Select.Option>
          <Select.Option value="Frozen">Frozen</Select.Option>
          <Select.Option value="Obsolete">Obsolete</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="subType"
        style={{ width: '60%' }}
        label="Subtype"
        initialValue={formData?.subType || "Simultaneous"}
        rules={[{ required: true, message: 'Please select subtype' }]}
      >
        <Select>
          <Select.Option value="Simultaneous">Simultaneous</Select.Option>
          <Select.Option value="Sequential">Sequential</Select.Option>
          <Select.Option value="AnyOrder">AnyOrder</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="document"
        style={{ width: '60%' }}
        label="Document"
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="bom"
        style={{ width: '60%' }}
        label="BOM"
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="dispositionGroup"
        label="Disposition Group"
        style={{ width: '60%' }}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="revision"
        label="Revision"
        style={{ width: '60%' }}
      >
        <Input disabled />
      </Form.Item>

      <Form.Item
        name="currentVersion"
        label="Current Version"
        style={{ width: '60%' }}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="relaxedRoutingFlow"
        label="Relaxed Routing Flow"
        valuePropName="checked"
        style={{ width: '60%' }}
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="replicationToErp"
        label="Replication To ERP"
        style={{ width: '60%' }}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="parentRoute"
        label="Parent Route"
        style={{ width: '60%' }}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
}
