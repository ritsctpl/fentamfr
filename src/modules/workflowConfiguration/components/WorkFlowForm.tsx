import React, { useEffect, useState } from 'react';
import { Row, Col, Select, Button, Switch, Form, Input, Typography, Card, Tabs, Modal, Table } from 'antd';
import { useMyContext } from '../hooks/WorkFlowConfigurationContext';
import { useTranslation } from 'react-i18next';
import { parseCookies } from 'nookies';
import { retrieveTop50ItemGroup } from '@services/workFlowService';

const { TabPane } = Tabs;


const WorkFlowForm: React.FC<{ selectedRowData: any }> = ({ selectedRowData }) => {
  const [form] = Form.useForm();
  const { payloadData, setPayloadData, setShowAlert, predefinedStates } = useMyContext();
  const [productGroupVisible, setProductGroupVisible] = useState(false)
  const [productGroupColumns, setProductGroupColumns] = useState([]);
  const [productGroupData, setProductGroupData] = useState([]);
  const { t } = useTranslation();
  useEffect(() => {
    form.setFieldsValue(payloadData);
  }, [payloadData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    let value = e.target.value;
    if (fieldName?.toLowerCase() == 'workflow' || fieldName == 'version' || fieldName == 'itemGroup') {
      // Convert to uppercase
      value = value.toUpperCase();
      // Remove spaces and special characters except - _ *
      value = value.replace(/[^A-Z0-9\-_*]/g, '');
    }

    form.setFieldsValue({ [fieldName]: value });
    setPayloadData((prev) => ({
      ...prev,
      [fieldName]: value
    }));
    setShowAlert(true);
  };

  const handleSelectChange = (fieldName: string, value: string) => {
    form.setFieldsValue({ [fieldName]: value });
    setPayloadData((prev) => ({
      ...prev,
      [fieldName]: value
    }));
    setShowAlert(true);
  }
  const handleSwitchChange = (fieldName: any, value: boolean) => {
    form.setFieldsValue({ [fieldName]: value });
    setPayloadData((prev) => ({
      ...prev,
      [fieldName]: value
    }));
    setShowAlert(true);
  }



  

  const handleOk = (selectedRow) => {
    debugger
    if (selectedRow) {
      form.setFieldsValue({
        itemGroup: selectedRow.itemGroup,
      });
    }
    setPayloadData((prevData) => ({
      ...prevData,
      itemGroup: selectedRow.itemGroup,
    }));
    setProductGroupVisible(false);
  };

  const handleCancel = () => {
    setProductGroupVisible(false);
  };

  return (
    <>
      <div style={{ marginTop: '40px', marginLeft: '50px' }}>
        {/* <h4 style={{ marginTop: '-0.1%' }}>Approval Workflow Details</h4> */}
        <Form form={form} layout="horizontal">
          {/* <Row gutter={16}>
                    <Col span={12}> */}
          <Form.Item
            label={t("name")}
            name="name"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 10 }}
            required
            style={{ marginBottom: 15 }}
          >
            <Input  onChange={(e) => handleChange(e, 'name')} />
          </Form.Item>
          {/* </Col>
                    <Col span={12}> */}
          <Form.Item
            label={t("version")}
            name="version"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 10 }}
           style={{ marginBottom: 15 }}
           required
          >
            <Input  onChange={(e) => handleChange(e, 'version')} />
          </Form.Item>
          {/* </Col> */}
          {/* </Row> */}
          <Form.Item
            label={t("entityType")}
            name="entityType"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 10 }}
           style={{ marginBottom: 15 }}
          >
            <Select defaultValue={"MFR"} onChange={(value) => handleSelectChange("entityType", value)}>
              <Select.Option value="MFR">MFR</Select.Option>
              <Select.Option value="BMR">BMR</Select.Option>
              <Select.Option value="BPR">BPR</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={t("currentVersion")}
            name="currentVersion"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 10 }}
           style={{ marginBottom: 15 }}
          >
            <Switch value={payloadData?.currentVersion} onChange={(checked) => handleSwitchChange('currentVersion', checked)} />
          </Form.Item>
          <Form.Item
            label={t("attachmentType")}
            name="attachmentType"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 10 }}
           style={{ marginBottom: 15 }}
            
          >
            <Select defaultValue={"Export"} onChange={(value) => handleSelectChange("attachmentType", value)}>
              <Select.Option value="Import">Import</Select.Option>
              <Select.Option value="Export">Export</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={t("attachedTo")}
            name="attachedto"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 10 }}
           style={{ marginBottom: 15 }}
          >
            <Select defaultValue={""} onChange={(value) => handleSelectChange("attachedto", value)}>
              <Select.Option value="Item">Item</Select.Option>
              <Select.Option value="ItemGroup">ItemGroup</Select.Option>
              <Select.Option value="Operation">Operation</Select.Option>
              <Select.Option value="Resource">Resource</Select.Option>
              <Select.Option value="Storage Location">Storage Location</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={t("attachedStatus")}
            name="attachedStatus"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 10 }}
           style={{ marginBottom: 15 }}
          >
            <Select defaultValue={"Releaseable"} onChange={(value) => handleSelectChange("attachedStatus", value)}>
              <Select.Option value="Releaseable">Releaseable</Select.Option>
              <Select.Option value="Pending">Pending</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={t("default")}
            name="default"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 10 }}
           style={{ marginBottom: 15 }}
          >
            <Switch onChange={(checked) => handleSwitchChange('default', checked)} />
          </Form.Item>
          <Form.Item
            label={t("states")}
            name="states"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 10 }}
           style={{ marginBottom: 15 }}
           required
           
          >
            <Select mode="multiple" showSearch allowClear onChange={(value) => handleSelectChange("states", value)}>
              {predefinedStates?.map((state) => (
                <Select.Option key={state.name} value={state.name}>
                  {state.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        
        </Form>
      </div>

     
      <Modal
        title={t("selectProductGroup")}
        open={productGroupVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Table

          onRow={(record) => ({
            onDoubleClick: () => handleOk(record),
          })}
          columns={productGroupColumns}
          dataSource={productGroupData}
          rowKey="workCenter"
          pagination={false}
          scroll={{ y: 300 }}
          size='small'
          bordered
        />
      </Modal>

    </>
  );
};

export default WorkFlowForm;