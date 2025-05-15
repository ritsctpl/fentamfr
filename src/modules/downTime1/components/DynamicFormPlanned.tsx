import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Card, Row, Col, Space, message, Modal } from 'antd';
import dayjs from 'dayjs';
import { downTimeUpdate } from '@services/siteServices';
import { parseCookies } from 'nookies';
import { updateResourceStatuOee } from '@services/equResourceService';
import { FaEdit, FaPlus } from 'react-icons/fa';

const { RangePicker } = DatePicker;

interface DownTimeFormProps {
  initialValues?: any;
  isEditing?: any;
  setInitialValues?: (values: any) => void;
  setEditingKey?: (key: any) => void;
}

const DownTimeFormPlanned: React.FC<DownTimeFormProps> = ({setInitialValues, initialValues,isEditing,setEditingKey }) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  // Remove the clear state as it's not needed
  const cookies = parseCookies();
const site = cookies.site;
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  // Add form field change handler
  const handleFormChange = () => {
    const currentValues = form.getFieldsValue();
    setInitialValues?.({...initialValues, ...currentValues});
  };

  const handleClear = () => {
    // First reset the form fields
    form.resetFields();
    
    // Then reset all the state values
    if (setInitialValues) {
      setInitialValues(null);
    }
    if (setEditingKey) {
      setEditingKey(null);
    }
  };

  const handleFinish = async (values: any) => {
// This will show the new values being saved

if (!isEditing) {
  const startTime = new Date(initialValues?.timeRange[0]);
  const endTime = new Date(initialValues?.timeRange[1]);
  const indianStartTime = new Date(startTime.getTime() + (5.5 * 60 * 60 * 1000));
  const indianEndTime = new Date(endTime.getTime() + (5.5 * 60 * 60 * 1000));
  const startPayload={
      
    "siteId": site,
    "shiftId":null,
    "shiftCreatedDateTime":  null,
    "shiftBreakCreatedDateTime": null,
    "workcenterId": null,
    "resourceId": initialValues?.resourceId,
    "itemId": "",
    "operationId": null,
    "logMessage": 'Break Start',
    "logEvent":"SCHEDULED_DOWN",
    "reason":'Break Start',
    "rootCause":'Break Start',
    "commentUsr":cookies?.rl_user_id,
    "createdDateTime": indianStartTime.toISOString().replace(/\.\d+Z$/, ''),
    "modifiedDateTime": indianStartTime.toISOString().replace(/\.\d+Z$/, ''),
    "active":  0,
  }
  const endPayload={
      
    "siteId": site,
    "shiftId":null,
    "shiftCreatedDateTime":  null,
    "shiftBreakCreatedDateTime": null,
    "workcenterId": null,
    "resourceId": initialValues?.resourceId,
    "itemId": "",
    "operationId": null,
    "logMessage": 'Break Stop',
    "logEvent":"RELEASABLE",
    "reason":'Break Stop',
    "rootCause":'Break Stop',
    "commentUsr":cookies?.rl_user_id,
   "createdDateTime": indianEndTime.toISOString().replace(/\.\d+Z$/, ''),
    "modifiedDateTime": indianEndTime.toISOString().replace(/\.\d+Z$/, ''),
    "active":  1,
    
  };
  
  try {
    const responseStart = await updateResourceStatuOee(startPayload);
    const responseEnd = await updateResourceStatuOee(endPayload);
    if (!responseEnd.success) {
      throw new Error('Failed to update record');
    }
    else{
      message.success(responseEnd.message);
    } 
  }
  catch (error) {
    console.error('Error updating record:', error);
  }
  return;
}

const payload = isEditing ? {
  "commentUsr": initialValues?.commentUsr,
  "reason": initialValues?.reason,
  "rootCause": initialValues?.rootCause,
  site: site,
  id: initialValues?.id,
  downtimeType:initialValues?.downtimeType,
  validDowntime:initialValues?.validDowntime,
  downtimeEnd :initialValues?.downtimeEnd,
} :{};
try {
  const response = await downTimeUpdate(payload);

  if (!response.success) {
    throw new Error('Failed to update record');
  }
  else{
    message.success(response.message);
  }
  
} catch (error) {
  console.error('Error updating record:', error);
}
  };
  console.log(initialValues,'initialValues');

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    handleClear();
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
{isEditing ? <FaEdit /> : <FaPlus />}
      </Button>
      <Modal
        title="Downtime Form"
        visible={visible}
        onCancel={handleCancel}
        footer={null}
        width={1200}
      >
        <Card>
          <Form
            form={form}
            name="downtime_form"
            onFinish={handleFinish}
            autoComplete="off"
            onValuesChange={handleFormChange}
          >
            <Row gutter={16}>
              <Col span={4}>
                <Form.Item
                  name="resourceId"
                  rules={[{ required: true, message: 'Resource ID is required' }]}
                >
                  <Input placeholder="Resource ID" disabled={isEditing} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="objectType"
                  rules={[{ required: true, message: 'Downtime Type is required' }]}
                >
                  <Select
                    placeholder="Select Object Type"
                    disabled={isEditing}
                    options={[
                      { value: 'CELL GROUP', label: 'Cell Group' },
                      { value: 'CELL', label: 'Cell' },
                      { value: 'LINE', label: 'Line' },
                    ]}
                  />
                </Form.Item>
              </Col> 
              <Col span={4}>
                <Form.Item
                  name="downTimeType"
                  rules={[{ required: true, message: 'Downtime Type is required' }]}
                >
                  <Select
                    placeholder="Select Downtime Type"
                    disabled={isEditing}
                    options={[
                      { value: 'SCHEDULED', label: 'Scheduled' },
                      { value: 'UNSCHEDULED', label: 'Unscheduled' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="reason"
                  rules={[{ required: true, message: 'Reason is required' }]}
                >
                  <Input placeholder="Reason" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="timeRange"
                  rules={[{ required: true, message: 'Time range is required' }]}
                >
                  <RangePicker
                    showTime
                    disabled={isEditing}
                    format="YYYY-MM-DD HH:mm:ss"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="validDowntime"
                  rules={[{ required: true, message: 'Time range is required' }]}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Valid Down Time"
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      {isEditing ? 'Save' : 'Add'}
                    </Button>
                    <Button onClick={handleClear}>
                      Clear
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>

          </Form>
        </Card>
      </Modal>
    </>
  );
};

export default DownTimeFormPlanned;