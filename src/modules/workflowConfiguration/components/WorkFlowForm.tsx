import React, { useEffect, useState } from 'react';
import { Row, Col, Select, Button, Switch, Form, Input, Typography, Card, Tabs, Modal, Table } from 'antd';
import { useMyContext } from '../hooks/WorkFlowConfigurationContext';
import { SettingsPhoneTwoTone } from '@mui/icons-material';
import ListTable from './levelConfigurationTable';
import AdvancedConfigurationForm from './AdvancedConfigurationForm';
import { useTranslation } from 'react-i18next';
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from 'nookies';
import { retrieveTop50ItemGroup } from '@services/workFlowService';

const { TabPane } = Tabs;


const WorkFlowForm: React.FC = () => {
  const [form] = Form.useForm();
  const { payloadData, setPayloadData, setShowAlert } = useMyContext();
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



  const handleProductGroupClick = async () => {
    setProductGroupVisible(true);
    const columns = [{
      title: t('productGroup'),
      dataIndex: 'itemGroup',
      key: 'itemGroup',
    },
    {
      title: t('description'),
      dataIndex: 'groupDescription',
      key: 'groupDescription',
    }
    ]
    setProductGroupColumns(columns);
    const cookies = parseCookies();
    const site = cookies.site;
    const response = await retrieveTop50ItemGroup(site);
    if (!response?.errorCode) {
      const formattedData = response.map((item: any, index: number) => ({
        id: index,
        itemGroup: item.itemGroup,
        groupDescription: item.groupDescription,
      }));
      setProductGroupData(formattedData);
    }
  };

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
      <div style={{ marginTop: '10px', marginLeft: '40px' }}>
        {/* <h4 style={{ marginTop: '-0.1%' }}>Approval Workflow Details</h4> */}
        <Form form={form} layout="horizontal">
          {/* <Row gutter={16}>
                    <Col span={12}> */}
          <Form.Item
            label="Name"
            name="name"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 8 }}
            required
            style={{ marginBottom: 15 }}
          >
            <Input onChange={(e) => handleChange(e, 'name')} />
          </Form.Item>
          {/* </Col>
                    <Col span={12}> */}
          <Form.Item
            label="Version"
            name="version"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 8 }}
           style={{ marginBottom: 15 }}
           required
          >
            <Input onChange={(e) => handleChange(e, 'version')} />
          </Form.Item>
          {/* </Col> */}
          {/* </Row> */}
          <Form.Item
            label="Entity Type"
            name="entityType"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 8 }}
           style={{ marginBottom: 15 }}
          >
            <Select defaultValue={"MFR"} onChange={(value) => handleSelectChange("entityType", value)}>
              <Select.Option value="MFR">MFR</Select.Option>
              <Select.Option value="BMR">BMR</Select.Option>
              <Select.Option value="BPR">BPR</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Current Version"
            name="currentVersion"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 8 }}
           style={{ marginBottom: 15 }}
          >
            <Switch onChange={(checked) => handleSwitchChange('currentVersion', checked)} />
          </Form.Item>
          <Form.Item
            label="Attachment Type"
            name="attachmentType"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 8 }}
           style={{ marginBottom: 15 }}
            
          >
            <Select defaultValue={"Export"} onChange={(value) => handleSelectChange("attachmentType", value)}>
              <Select.Option value="Export">Export</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Attached To"
            name="attachedTo"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 8 }}
           style={{ marginBottom: 15 }}
          >
            <Select defaultValue={""} onChange={(value) => handleSelectChange("attachedTo", value)}>
              <Select.Option value="Export">Export</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Attached Status"
            name="attachedStatus"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 8 }}
           style={{ marginBottom: 15 }}
          >
            <Select defaultValue={"Releaseable"} onChange={(value) => handleSelectChange("attachedStatus", value)}>
              <Select.Option value="Releaseable">Releaseable</Select.Option>
              <Select.Option value="Pending">Pending</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Default"
            name="default"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 8 }}
           style={{ marginBottom: 15 }}
          >
            <Switch onChange={(checked) => handleSwitchChange('default', checked)} />
          </Form.Item>
          <Form.Item
            label="States"
            name="states"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 8 }}
           style={{ marginBottom: 15 }}
           required
          >
            <Select defaultValue="" onChange={(value) => handleSelectChange("states", value)}>
              {payloadData?.statesList?.map((state) => (
                <Select.Option key={state.name} value={state.name}>
                  {state.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {/* <Form.Item
                        label={t('productGroup')}
                        name="itemGroup"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 8 }}
                       style={{ marginBottom: 15 }}
                    >
                        <Input 
                        suffix={
                            <GrChapterAdd
                              onClick={() =>
                                handleProductGroupClick()
                              }
                            />
                          }
                        onChange={(e) => handleChange(e, 'itemGroup')} />
                    </Form.Item> */}
        </Form>
      </div>

      {/* <div>
            <h4 style={{ marginBottom: '0px' }}>Level Configuration</h4>
            <ListTable/>
        </div> */}

      {/* <div>
        <h4 style={{ marginBottom: '0px' }}>Advanced Configuration</h4>
        <AdvancedConfigurationForm/>
        </div> */}
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