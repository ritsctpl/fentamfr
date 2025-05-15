import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Card, Row, Col, Space, message, Modal, TimePicker  } from 'antd';
import dayjs from 'dayjs';
import { downTimeUpdate } from '@services/siteServices';
import { parseCookies } from 'nookies';
import { updateResourceStatuOee } from '@services/equResourceService';
import { FaEdit, FaPlus } from 'react-icons/fa';
import { createPlannedDowntime, fetchAllReasonCode, fetchAllWorkCenter, fetchResource, getWorkcenterByCategory } from '@services/oeeServices';
import { Schedule } from '@mui/icons-material';
import { useMyContext } from '../hooks/downTimeContext';
import ReasonCodeCommonBar from '@modules/reasonCode/components/ReasonCodeCommonBar';

const { RangePicker } = DatePicker;

interface DownTimeFormProps {
  initialValues?: any;
  isEditing?: any;
  setInitialValues?: (values: any) => void;
  setEditingKey?: (key: any) => void;
}

const DownTimeForm: React.FC<DownTimeFormProps> = ({setInitialValues, initialValues,isEditing,setEditingKey }) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string>(null);
  const [allResources, setAllResources] = useState<any>([]);
  const [selectedReason, setSelectedReason] = useState<string>(null);
  const [allReasons, setAllReasons] = useState<any>([]);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string>(null);
  const [allWorkCenters, setAllWorkCenters] = useState<any>([]);
  const [objectType, setObjectType] = useState<string>('Cell Group');
  const [objectValue, setObjectValue] = useState<any>();
  const { triggerPlannedDTLoad, setTriggerPlannedDTLoad, triggerToCreate, setTriggerToCreate } = useMyContext();
  // Remove the clear state as it's not needed
  const cookies = parseCookies();
const site = cookies.site;
  useEffect(() => {
    // form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  useEffect(() => {
    const fetchResourceData = async () => {
      const cookies = parseCookies();
      const site = cookies?.site;
      try {
        const activities = await fetchResource(site);
        const resourceList = activities?.map((data) => data?.resource);
        setAllResources(activities);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    }; 
    const fetchReasonData = async () => {
      const cookies = parseCookies();
      const site = cookies?.site;
      try {
        const activities = await fetchAllReasonCode(site, "");
        const reasonList = activities?.map((data) => data?.reasonCode);
        setAllReasons(activities);
      } catch (error) {
        console.error("Error fetching reason codes:", error);
      }
    };
    
    const fetchWorkCenterData = async () => {
      const cookies = parseCookies();
      const site = cookies?.site;
      // debugger
      const request = {
        site: site,
        workCenterCategory: "Cell Group",
      }
      try {
        const response = await getWorkcenterByCategory(request);
        if (!response?.errorCode) {
          setAllWorkCenters(response);
        }
        else {
          setAllWorkCenters([]);
        }
      } catch (error) {
        console.error('Error fetching work centers:', error);
      }
    };

    fetchResourceData();
    fetchReasonData();
    fetchWorkCenterData();
    setInitialValues(prev => ({
      ...prev,
      type: 'Cell Group',
      downTimeType: 'Scheduled',
    }));
    form.setFieldsValue({
      type: 'Cell Group',
      downTimeType: 'Scheduled',
      timeRange: null,
      validDowntime: null,
      reasonCode: null,
    });
    setObjectType('Cell Group');
    setObjectValue('');
    setSelectedReason('');

  }, [triggerToCreate]);

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
      // debugger
      const startTime = new Date(initialValues?.timeRange[0]);
      const endTime = new Date(initialValues?.timeRange[1]);
      const indianStartTime = new Date(startTime.getTime() + (5.5 * 60 * 60 * 1000));
      const indianEndTime = new Date(endTime.getTime() + (5.5 * 60 * 60 * 1000));
      // need to convert the timeRange in intialValues and validDowntime in intialValues to localdate format 
      const plannedStartDateRange = dayjs(initialValues?.timeRange[0]).format('HH:mm:ss');
      const plannedEndDateRange = dayjs(initialValues?.timeRange[1]).format('HH:mm:ss');
      
      const effectiveStartDateRange = dayjs(initialValues?.validDowntime[0]).format('YYYY-MM-DDTHH:mm:ss');
      const effectiveEndDateRange = dayjs(initialValues?.validDowntime[1]).format('YYYY-MM-DDTHH:mm:ss');
      
      // Convert validDowntime to local date format if it exists
      const validDownTime = initialValues?.validDowntime ? 
      dayjs(initialValues.validDowntime).format('YYYY-MM-DDTHH:mm:ss') : null;
    
      const startPayload = {

        "site": site,
        // "shiftId": null,
        // "shiftCreatedDateTime": null,
        // "shiftBreakCreatedDateTime": null,
        // "workcenterId": initialValues?.selectedWorkCenter || null,
        // "resourceId": initialValues?.selectedResource || null,
        "objectType": objectType,
        "objectValue": objectValue,
        // "itemId": "",
        // "operationId": null,
        // "logMessage": 'Break Start',
        // "logEvent": "SCHEDULED_DOWN",
        // "reason": 'Break Start',
        "reasonCode": selectedReason,
        // "rootCause": 'Break Start',
        "user": cookies?.rl_user_id,
        // "createdDateTime": indianStartTime.toISOString().replace(/\.\d+Z$/, ''),
        // "modifiedDateTime": indianStartTime.toISOString().replace(/\.\d+Z$/, ''),
        "plannedStartTime": plannedStartDateRange,
        "plannedEndTime": plannedEndDateRange,
        "effectiveStartDateTime": effectiveStartDateRange,
        "effectiveEndDateTime": effectiveEndDateRange,
        // "active": 0,
      }
      const endPayload = {

        "site": site,
        // "shiftId": null,
        // "shiftCreatedDateTime": null,
        // "shiftBreakCreatedDateTime": null,
        // "workcenterId": initialValues?.selectedWorkCenter || null,
        // "resourceId": initialValues?.selectedResource || null,
        "objectType": objectType,
        "objectValue": objectValue,
        // "itemId": "",
        // "operationId": null,
        // "logMessage": 'Break Stop',
        // "logEvent": "RELEASABLE",
        // "reason": 'Break Stop',
        "reasonCode": selectedReason,
        // "rootCause": 'Break Stop',
        "user": cookies?.rl_user_id,
        // "createdDateTime": indianEndTime.toISOString().replace(/\.\d+Z$/, ''),
        // "modifiedDateTime": indianEndTime.toISOString().replace(/\.\d+Z$/, ''),
        "plannedStartTime": plannedStartDateRange,
        "plannedEndTime": plannedStartDateRange,
        "effectiveStartDateTime": effectiveStartDateRange,
        "effectiveEndDateTime": effectiveEndDateRange,
        "active": 1,

      };

      try {
        // const responseStart = await updateResourceStatuOee(startPayload);
        const responseEnd = await createPlannedDowntime(startPayload);
        if (responseEnd.errorCode) {
          message.error(responseEnd?.message);
        }
        else {
          message.success(responseEnd.message);
          setVisible(false);
          setTriggerPlannedDTLoad(triggerPlannedDTLoad + 1);
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
      downtimeType: initialValues?.downtimeType,
      validDowntime: initialValues?.validDowntime,
      downtimeEnd: initialValues?.downtimeEnd,
    } : {};
    // try {
    //   const response = await downTimeUpdate(payload);

    //   if (!response.success) {
    //     throw new Error('Failed to update record');
    //   }
    //   else {
    //     message.success(response.message);
    //   }

    // } catch (error) {
    //   console.error('Error updating record:', error);
    // }
  };

  console.log(initialValues,'initialValues');

  const showModal = () => {
    setTriggerToCreate(triggerToCreate + 1);
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    handleClear();
  };

  const handleSelectChange = (values) => {
    // debugger
    if (values?.length > 0) {
      // if (form.getFieldValue('type') == 'Resource') {
      //   setSelectedResource(values);
      // }
      // else {
      //   setSelectedWorkCenter(values);
      // }
      setObjectValue(values);
    }
  }

  const handleObjectTypeChange = async(value: any) => {
    setObjectType(value);
    setObjectValue(null);
    const cookies = parseCookies();
    const site = cookies?.site;
    const request = {
      site: site,
      workCenterCategory: value,  
    }
    try {
      const response = await getWorkcenterByCategory(request);
      if (!response?.errorCode) {
        setAllWorkCenters(response);
      }
      else{
        setAllWorkCenters([]);
      }
    } catch (error) {
      console.error('Error fetching work centers:', error);
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
{/* {isEditing ? <FaEdit /> : <FaPlus />} */}
{ <FaPlus />}
      </Button>
      <Modal
        title="Downtime Form"
        open={visible}
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
              <Col span={8}>
              <Form.Item
                  name= {objectType == 'Resource' ? 'selectedResource' : 'selectedWorkCenter'}
                  rules={[{ required: true, message: objectType == 'Resource' ? 'Resource is required' : 'Work Center is required' }]}
                >
                  <Select
                    // mode="multiple"
                    placeholder={objectType == 'Resource' ? 'Select Resource' : 'Select Work Center'}
                    // value= {form.getFieldValue('type') == 'Resource' ? selectedResource : selectedWorkCenter}
                    value= {objectValue}
                    onChange={(values) => handleSelectChange(values)}
                    style={{ width: '100%' }}
                    allowClear
                    showSearch
                  >
                    {objectType == 'Resource' ? (
                      allResources?.map(item => (
                        <Select.Option key={item?.resource} value={item?.resource}>
                          {item?.description}
                        </Select.Option>
                      ))
                    ) : (
                      allWorkCenters?.map(item => (
                        <Select.Option key={item?.workCenter} value={item?.workCenter}>
                          {item?.description}
                        </Select.Option>
                      ))
                    )}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="objectType"
                  rules={[{ required: false }]}
                >
                  <Select
                    placeholder="Select Type"
                    // disabled={isEditing}
                    defaultValue="Cell Group"
                    onChange={(value) => handleObjectTypeChange(value)}
                    options={[
                      { value: 'Cell Group', label: 'Cell Group' },
                      { value: 'Cell', label: 'Cell' },
                      { value: 'Line', label: 'Line' },
                      { value: 'Resource', label: 'Resource' },
                    ]}
                  />
                </Form.Item>
              </Col>
               {/* <Col span={4}>
                <Form.Item
                  name="downTimeType"
                  rules={[{ required: false, message: 'Downtime Type is required' }]}
                >
                  <Select
                    placeholder="Select Downtime Type"
                    // disabled={isEditing}
                    defaultValue = "Scheduled"
                    options={[
                      { value: 'Scheduled', label: 'Scheduled' },
                      { value: 'Unscheduled', label: 'Unscheduled' },
                    ]}
                  />
                </Form.Item>
              </Col> */}
              <Col span={8}>
                <Form.Item
                  name="reasonCode"
                  rules={[{ required: true, message: 'Reason is required' }]}
                >
                  {/* <Input placeholder="Reason" /> */}
                  <Select
                    placeholder="Select Reason"
                    value={selectedReason}
                    onChange={(values) =>  setSelectedReason(values)}
                    style={{ width: '100%' }}
                    allowClear
                    showSearch
                  >
                    {allReasons?.map(item => (
                      <Select.Option key={item?.reasonCode} value={item?.reasonCode}>
                        {item?.reasonCode}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="timeRange"
                  rules={[{ required: true, message: 'Time range is required' }]}
                >
                  <TimePicker.RangePicker
                    // showTime
                    placeholder={['Planned Start Time', 'Planned End Time']}
                    // disabled={isEditing}
                    format="HH:mm:ss"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="validDowntime"
                  rules={[{ required: true, message: 'Date range is required' }]}
                >
                  {/* <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Valid Down Time"
                  /> */}
                   <RangePicker
                    showTime
                    placeholder={['Effective Start Time', 'Effective End Time']}
                    // disabled={isEditing}
                    format="YYYY-MM-DD HH:mm:ss"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            
            
              <Col span={4}>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      {/* {isEditing ? 'Save' : 'Add'} */}
                      {'Add'}
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

export default DownTimeForm;