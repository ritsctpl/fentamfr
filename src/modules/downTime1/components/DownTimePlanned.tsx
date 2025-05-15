"use client"
import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Button, DatePicker, Input, Row, Col, Layout, message, Select, TimePicker } from 'antd';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { fetchAllReasonCode, fetchAllWorkCenter, fetchResource, getWorkcenterByCategory, updatePlannedDowntime } from "@services/oeeServices";
import { parseCookies } from 'nookies';
import { Content } from 'antd/es/layout/layout'

import dayjs from 'dayjs';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { RangePicker } = DatePicker;

const cookies = parseCookies();
const site = cookies.site;

// Add these imports at the top
import { Form, Input as AntInput } from 'antd';
import type { InputRef } from 'antd';
import { downTimeUpdate, fetchDownTimeByFiltersPlanned, fetchDownTimeWithFilters, fetchDownTimeWithFiltersPlanned } from '@services/siteServices';
import { CloseOutlined, EditOutlined, SaveOutlined } from '@mui/icons-material';
import FormPopup from './DynamicForm';
import { useMyContext } from '../hooks/downTimeContext';

// Add these interfaces after the imports
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
  record: any;
  index: number;
  children: React.ReactNode;
}

// Add before the DownTimeTable component
const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  children,
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
        >
          <AntInput />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
// Dummy data for testing


const DownTimePlannedTable: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [resourceId, setResourceId] = useState<string>(null);
  // Add these states after other state declarations
  const [allResources, setAllResources] = useState<any>([]);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<string>(null);
  const [initialValues, setInitialValues] = useState<any>(null);
  const [objectTypeValue, setObjectTypeValue] = useState<any>("Resource");
  const [objectValue, setObjectValue] = useState<any>();
  const [allReasons, setAllReasons] = useState<any>([]);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string>(null);
  const [allWorkCenters, setAllWorkCenters] = useState<any>([]);
  const [selectedReason, setSelectedReason] = useState<string>(null);
  const [plannedStartTimeValue, setPlannedStartTimeValue] = useState<any>(null);
  const [plannedEndTimeValue, setPlannedEndTimeValue] = useState<any>(null);
  const [effectiveStartTimeValue, setEffectiveStartTimeValue] = useState<any>(null);
  const [effectiveEndTimeValue, setEffectiveEndTimeValue] = useState<any>(null);
  const { triggerPlannedDTLoad, setTriggerPlannedDTLoad, triggerPlannedDTEdit, setTriggerPlannedDTEdit,
    triggerToCreate, setTriggerToCreate,
   } = useMyContext();
  const { t } = useTranslation();
  useEffect(() => {
    const fetchResourceData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const activities = await fetchResource(site);
        const resourceList = activities?.map((data) => data?.resource);
        setAllResources(activities);
        console.log("Resource Data: ", activities);
      } catch (error) {
        console.error("Error fetching activities:", error);
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
      try {
        const activities = await fetchAllWorkCenter(site, "");
        const workCenterList = activities?.map((data) => data?.workCenter);
        setAllWorkCenters(activities);
      } catch (error) {
        console.error("Error fetching work centers:", error);
      }
    };

    fetchResourceData();
    fetchReasonData();
    fetchWorkCenterData();

  }, []);
  // Add these functions before the columns definition
  const isEditing = (record: any) => record.id.toString() === editingKey;
  
  const edit = (record: any) => {
    setSelectedReason(record?.reasonCode);
    setPlannedStartTimeValue(record?.plannedStartTime);
    setPlannedEndTimeValue(record?.plannedEndTime);
    setEffectiveStartTimeValue(record?.effectiveStartDateTime);
    setEffectiveEndTimeValue(record?.effectiveEndDateTime);
    setTriggerToCreate(triggerToCreate + 1);
    setInitialValues({
      ...record,
      resourceId: record?.resourceId,
      downTimeType: record?.downtimeType,
      reason: record?.reason,
      timeRange: [dayjs(), dayjs().add(2, 'hours')],
    });
    // debugger
    form.setFieldsValue({
      commentUsr: record?.commentUsr,
      reason: record?.reason,
      rootCause: record?.rootCause,
      reasonCode: record?.reasonCode,
      plannedStartTime: dayjs(record?.plannedStartTime, 'HH:mm:ss'),
      plannedEndTime: dayjs(record?.plannedEndTime, 'HH:mm:ss'),
      effectiveStartDateTime:  dayjs(record?.effectiveStartDateTime, 'YYYY-MM-DDTHH:mm:ss'),
      effectiveEndDateTime:   dayjs(record?.effectiveEndDateTime, 'YYYY-MM-DDTHH:mm:ss'),
    });
    setEditingKey(record?.id.toString());
  };

  const handleChange = (e, field) => {
    setInitialValues({
      ...initialValues,
      [field]: e.target.value,
    });

  }
  
  const cancel = () => {
    setEditingKey('');
    setSelectedReason(null);
    setPlannedStartTimeValue(null);
    setPlannedEndTimeValue(null);
    setSelectedWorkCenter(null);
    form.resetFields();
    setTriggerPlannedDTEdit(triggerPlannedDTEdit + 1);
  };
  
  const save = async (record) => {
    message.destroy();
    try {
      const row = await form.validateFields();
      console.log('Edited values:', row, record.key); // This will show the new values being saved
      // debugger  
      const cookies = parseCookies();
      const user = cookies.rl_user_id;
      debugger
      
       if (row?.plannedStartTime == null || row?.plannedEndTime == null) {
        message.error("Please select planned start and end time");
        return;
      }
      else if (row?.plannedStartTime > row?.plannedEndTime) {
        message.error("Planned start time should be less than planned end time");
        return;
      }
     else if (row?.effectiveStartDateTime == null || row?.effectiveEndDateTime == null) {
        message.error("Please select Effective start and end time");
        return;
      }
      else if (row?.effectiveStartDateTime > row?.effectiveEndDateTime) {
        message.error("Effective start time should be less than effective end time");
        return;
      }
      else if ((record?.reasonCode == null || record?.reasonCode == "" || record?.reasonCode == undefined) && (row?.reasonCode != null || row?.reasonCode != "" || row?.reasonCode != undefined)) {
        message.error("Please select a reason");
        return;
      }
      const oPlannedStartTime = dayjs(row?.plannedStartTime).format("HH:mm:ss");
      const oPlannedEndTime = dayjs(row?.plannedEndTime).format("HH:mm:ss") ;
      const oEffectiveStartTime = dayjs(row?.effectiveStartDateTime).format("YYYY-MM-DDTHH:mm:ss") ;
      const oEffectiveEndTime = dayjs(row?.effectiveEndDateTime).format("YYYY-MM-DDTHH:mm:ss") ;
      const payload = {
        id: record?.id,
        site: site,
        plannedStartTime:  oPlannedStartTime,
        plannedEndTime: oPlannedEndTime, 
        effectiveStartDateTime:  oEffectiveStartTime,
        effectiveEndDateTime: oEffectiveEndTime,
        reasonCode: selectedReason || record?.reasonCode,
        user: user
      }
      try {
        const response = await updatePlannedDowntime(payload);

        if (response.errorCode) {
          message.error(response?.message);
        }
        else {
          message.success(response?.message);
          setEditingKey(null);
          setObjectTypeValue("Resource");
          handleSearchOnLoad();

        }


        // Wait for the API response
        // const updatedRecord = await response.json();
      } catch (error) {
        console.error('Error updating downtime:', error);
        throw error;
      }
      const newData = [...data];
      const index = newData.findIndex(item => record?.key === item.id.toString());
      if (index > -1) {
        const item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
        };
        console.log('Updated record:', updatedItem); // This will show the complete updated record

        newData.splice(index, 1, updatedItem);
        // setData(newData);
        // setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  // Modify these columns in the columns array
  const columns = [
    {
      title: 'Resource ID',
      dataIndex: 'objectValue',
      key: 'objectValue',
      width: 300,
      align: 'center' as const,
    },
    {
      title: 'Type',
      dataIndex: 'objectType',
      key: 'objectType',
      width: 150,
      align: 'center' as const,
    },
    {
      title: 'Planned Start',
      dataIndex: 'plannedStartTime',
      key: 'plannedStartTime',
      render: (text: string, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="plannedStartTime"
            style={{ margin: 0 }}
          >
             <TimePicker
              format="HH:mm:ss"
              value={plannedEndTimeValue ? dayjs(plannedEndTimeValue, 'HH:mm:ss') : null}
              onChange={(value) => setPlannedEndTimeValue(value ? value.format('HH:mm:ss') : null)}
            />
          </Form.Item>
        ) : (
          record?.plannedStartTime
        );
      },
      width: 150,
      align: 'center' as const,
    },
    {
      title: 'Planned End',
      dataIndex: 'plannedEndTime',
      key: 'plannedEndTime',
      render: (text: string, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="plannedEndTime"
            style={{ margin: 0 }}
          >
            <TimePicker
              format="HH:mm:ss"
              value={plannedEndTimeValue ? dayjs(plannedEndTimeValue, 'HH:mm:ss') : null}
              onChange={(value) => setPlannedEndTimeValue(value ? value.format('HH:mm:ss') : null)}
            />
          </Form.Item>
        ) : (
          record?.plannedEndTime
        );
      },
      width: 150,
      align: 'center' as const,
    },
    {
      title: 'Effective Start',
      dataIndex: 'effectiveStartDateTime',
      key: 'effectiveStartDateTime',
      render: (text: string, record: any) => {
        const date = dayjs(text);
        // return date.format('MMM DD, YYYY hh:mm:ss A');
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="effectiveStartDateTime"
            style={{ margin: 0 }}
          >
             <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={effectiveStartTimeValue ? dayjs(effectiveStartTimeValue, 'yyyy-MM-ddTHH:mm:ss') : null}
              onChange={(value) => setEffectiveStartTimeValue(value ? value.format('yyyy-MM-ddTHH:mm:ss') : null)}
            />
          </Form.Item>
        ) : (
          record?.effectiveStartDateTime ? dayjs(record?.effectiveStartDateTime).format('MMM DD, YYYY hh:mm:ss A') : '-'
        );
      },
      width: 200,
      align: 'center' as const,
    },
    {
      title: 'Effective End',
      dataIndex: 'effectiveEndDateTime',
      key: 'effectiveEndDateTime',
      render: (text: string, record: any) => {
        const date = dayjs(text);
        // return date.format('MMM DD, YYYY hh:mm:ss A');
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="effectiveEndDateTime"
            style={{ margin: 0 }}
          >
             <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={effectiveEndTimeValue ? dayjs(effectiveEndTimeValue, 'yyyy-MM-ddTHH:mm:ss') : null}
              onChange={(value) => setEffectiveEndTimeValue(value ? value.format('yyyy-MM-ddTHH:mm:ss') : null)}
            />
          </Form.Item>
        ) : (
          record?.effectiveEndDateTime? dayjs(record?.effectiveEndDateTime).format('MMM DD, YYYY hh:mm:ss A') : '-'
        );
      },
      width: 200,
      align: 'center' as const,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      // ellipsis: true,
      render: (text: string) => {
        if (!text) return '-';

        const seconds = parseInt(text);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours}h ${minutes}m ${remainingSeconds}s`;
      },
      width: 150,
      align: 'center' as const,
    },
    {
      title: 'Reason',
      dataIndex: 'reasonCode',
      key: 'reasonCode',
      ellipsis: false,
      editable: true,
      render: (_: any, record: any) => {
          const editable = isEditing(record);
          return editable ? (
              <Form.Item
                  name="reasonCode"
                  style={{ margin: 0 }}
              >
                  {/* <Input onChange={(e) => handleChange(e, 'reasonCode')} /> */}
                  <Select
                    placeholder="Select Reason"
                    value={selectedReason !== null ? selectedReason : record?.reasonCode}
                    onChange={(value) => {
                      setSelectedReason(value);
                      form.setFieldsValue({ reasonCode: value });
                    }}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {allReasons?.map(item => (
                      <Select.Option key={item?.reasonCode} value={item?.reasonCode}>
                        {item?.reasonCode}
                      </Select.Option>
                    ))}
                  </Select>
              </Form.Item>
          ) : (
              record?.reasonCode
          );
      },
      width: 200,
      align: 'center' as const,
  },
    {
      title: 'Action',
      dataIndex: 'operation', 
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return (
         
          <Space>
          {!editable ? (
            <Button
              type="link"
              onClick={() => edit(record)}
              icon={<EditOutlined style={{ fontSize: '18px' }} />}
            />
          ) : (
            <>
              <Button
                type="link"
                onClick={() => save(record)}
                icon={<SaveOutlined style={{ fontSize: '18px', color: '#52c41a' }} />}
              />
              <Button
                type="link"
                onClick={cancel}
                icon={<CloseOutlined style={{ fontSize: '18px', color: '#ff4d4f' }} />}
              />
            </>
          )}
        </Space>
        );
      },
      width: 100,
      align: 'center' as const,
    },
  ];

  const handleSearchOnLoad = async () => {
    setLoading(true);
    try {
      let result;
 
      const payload = {
        site: site,
        objectType: "Resource",
        plannedStartTime: null,
        plannedEndTime: null,
        objectValue: null
      }
        result = await fetchDownTimeByFiltersPlanned(payload);
      
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

   const handleSearch = async () => {
    message.destroy();
    setLoading(true);
    setEditingKey('');
    // debugger
    try {

      // if(objectTypeValue == "All" && (objectValue == "" || objectValue == null || objectValue == undefined)){
      //   handleSearchOnLoad();
      //   return;
      // }

      let result, plannedStartTimeValue, plannedEndTimeValue;
      if(dateRange == null || dateRange?.[0] == null || dateRange?.[1] == null){
        plannedStartTimeValue = null;
        plannedEndTimeValue = null;
      }
      else{
        plannedStartTimeValue = dayjs(dateRange[0]).format('YYYY-MM-DDTHH:mm:ss');
        plannedEndTimeValue = dayjs(dateRange[1]).format('YYYY-MM-DDTHH:mm:ss');
      }
      const payload = {
        site: site,
        objectType: objectTypeValue,
        effectiveStartDateTime: plannedStartTimeValue || null,
        effectiveEndDateTime: plannedEndTimeValue || null,
        objectValue: objectValue || null
      }
        result = await fetchDownTimeByFiltersPlanned(payload);
      if (!result?.erroCode) {
        setData(Array.isArray(result) ? result : []);
      }
      else{
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [triggerPlannedDTLoad]);

  const handleObjectTypeChange = async (values) => {
    setObjectTypeValue(values);
    setObjectValue(null);
    const cookies = parseCookies();
    const site = cookies?.site;
    const request = {
      site: site,
      workCenterCategory: values,  
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
  }

  const handleSelectChange = (values) => {
    if (values?.length > 0) {
      setObjectValue(values);
    }
    else{
      setObjectValue(null);
    }
  }

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.text('Downtime Report', 14, 15);
    
    // Prepare the data for PDF
    // Move tableData inside the DownTimeTable component and pass data as prop to downloadPDF
    const tableData = (data: any[]) => {
      // Get max lengths for each column
      const maxLengths = Array.isArray(data) ? data.reduce((acc, item) => {
        return [
          Math.max(acc[0], (item.resourceId || '').toString().length),
          Math.max(acc[1], (item.shiftId?.split(',').pop() || '-').length),
          Math.max(acc[2], (item.downtimeType || '').length),
          Math.max(acc[3], dayjs(item.downtimeStart).format('MMM DD, YYYY hh:mm:ss A').length),
          Math.max(acc[4], dayjs(item.downtimeEnd).format('MMM DD, YYYY hh:mm:ss A').length),
          Math.max(acc[5], `${Math.floor(item.downtimeDuration / 3600)}h ${Math.floor((item.downtimeDuration % 3600) / 60)}m ${item.downtimeDuration % 60}s`.length),
          Math.max(acc[6], (item.reason || '-').length),
          Math.max(acc[7], (item.rootCause || '-').length),
          Math.max(acc[8], (item.commentUsr || '-').length)
        ];
      }, [0, 0, 0, 0, 0, 0, 0, 0, 0]) : [];

      return Array.isArray(data) ? data.map(item => [
        item.resourceId?.toString().padEnd(maxLengths[0]),
        (item.shiftId?.split(',').pop() || '-').padEnd(maxLengths[1]),
        (item.downtimeType || '').padEnd(maxLengths[2]),
        dayjs(item.downtimeStart).format('MMM DD, YYYY hh:mm:ss A').padEnd(maxLengths[3]),
        dayjs(item.downtimeEnd).format('MMM DD, YYYY hh:mm:ss A').padEnd(maxLengths[4]),
        `${Math.floor(item.downtimeDuration / 3600)}h ${Math.floor((item.downtimeDuration % 3600) / 60)}m ${item.downtimeDuration % 60}s`.padEnd(maxLengths[5]),
        (item.reason || '-').padEnd(maxLengths[6]),
        (item.rootCause || '-').padEnd(maxLengths[17]),
        (item.commentUsr || '-').padEnd(maxLengths[8])
      ]) : [];
    };
    
    // Generate the table
  (doc as any).autoTable({
    head: [['Resource ID', 'Shift ID', 'Downtime Type', 'Start Time', 'End Time', 'Duration', 'reason','Root Cause', 'User']],
    body: tableData(data||[]), // Initialize with empty array since data is not accessible here
    startY: 20,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185] },
  });
    
    // Save the PDF
    doc.save('downtime-report.pdf');
  };
console.log(data,'sjgbhsdbhc');

  return (

        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={24}>
              <Col span={8}>
              <RangePicker
                  showTime={{ format: 'HH:mm:ss' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  allowClear
                  // onClear={() => setDateRange([null, null])}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                  style={{ width: '100%' }}
                />
              </Col>
          <Col span={6}>
            <Select
              defaultValue="Cell Group"
              value={objectTypeValue}
              style={{ width: '100%' }}
              onChange={(values) => handleObjectTypeChange(values)}
              options={[
                { value: 'Cell Group', label: 'Cell Group' },
                { value: 'Cell', label: 'Cell' },
                { value: 'Line', label: 'Line' },
                { value: 'Resource', label: 'Resource' },
              ]}
            />
          </Col> 
              <Col span={6}>
                {/* <Select
                  mode="multiple"
                  placeholder="Select Resource IDs"
                  value={resourceId}
                  onChange={(values) => setResourceId(values)}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {allResources?.map(item => (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select> */}
                <Select
                    // mode="multiple"
                    placeholder={objectTypeValue == 'Resource' ? 'Select Resource' : 'Select Work Center'}
                    // value= {form.getFieldValue('type') == 'Resource' ? selectedResource : selectedWorkCenter}
                    value= {objectValue}
                    showSearch
                    onChange={(values) => handleSelectChange(values)}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {objectTypeValue == 'Resource' ? (
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
              </Col>
              <Col span={4}>
                <Space>
                  <Button type="primary" onClick={handleSearch}>
                    Search
                  </Button>
                  {/* <Button onClick={downloadPDF} type="primary">
                    Download PDF
                  </Button> */}
                  <FormPopup initialValues={initialValues} setInitialValues={setInitialValues} isEditing={editingKey} setEditingKey = {setEditingKey} />
     
                </Space>
              </Col>
            </Row>
            <Form form={form} component={false} >
              <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                bordered
                pagination={false}
                scroll={{ y: 'calc(100vh - 230px)' }}
                size="small"
                // key={triggerPlannedDTEdit} // Add this line to trigger rerender
              />
            </Form>
          </Space>
        </Card>
  );
};

export default DownTimePlannedTable;

// Remove the Form and Table components that were outside the component

