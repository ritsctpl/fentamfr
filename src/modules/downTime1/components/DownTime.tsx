"use client"
import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Button, DatePicker, Input, Row, Col, Layout, message, Select } from 'antd';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { fetchAllReasonCode, fetchResource } from "@services/oeeServices";
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
import { downTimeUpdate, fetchDownTimeWithFilters } from '@services/siteServices';
import { CloseOutlined, EditOutlined, SaveOutlined } from '@mui/icons-material';
import FormPopup from './DynamicForm';

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


const DownTimeTable: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
dayjs().startOf('day'),
dayjs().endOf('day')
  ]);
  const [resourceId, setResourceId] = useState<string>(null);
  // Add these states after other state declarations
  const [allResources, setAllResources] = useState<any>([]);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<string>(null);
  const [initialValues, setInitialValues] = useState<any>(null);
  const [selectedReason, setSelectedReason] = useState<string>(null);
  const [allReasons, setAllReasons] = useState<any>([]);
  const { t } = useTranslation();
  useEffect(() => {
    const fetchResourceData = async () => {
      const cookies = parseCookies();
      const site = cookies.site;
      try {
        const activities = await fetchResource(site);
        const resourceList = activities?.map((data) => data?.resource);
        setAllResources(resourceList);
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

    fetchResourceData();
    fetchReasonData();
    handleSearch(); // Call handleSearch after setting initial date range
  }, []);
  // Add these functions before the columns definition
  const isEditing = (record: any) => record.id.toString() === editingKey;
  
  const edit = (record: any) => {
    setInitialValues({
      ...record,
      resourceId: record?.resourceId,
      downTimeType: record?.downtimeType,
      reason: record?.reason,
      timeRange: [dayjs(), dayjs().add(2, 'hours')],
    });
    form.setFieldsValue({
      commentUsr: record?.commentUsr,
      reason: record?.reason,
      rootCause: record?.rootCause,
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
  };
  
  const save = async (record) => {
    // debugger
    message.destroy();
    const cookies = parseCookies();
    const user = cookies.rl_user_id;
  

    

    try {
      const row = await form.validateFields();
      if(row?.reason === null || row?.reason === undefined || row?.reason === ''){
        message.error('Please select a reason');
        return;
      }
      console.log('Edited values:', row, record.key); // This will show the new values being saved
      const payload = {
        "commentUsr": user,
        "reason": row?.reason,
        "rootCause": initialValues?.rootCause,
        site: site,
        id: record?.id,
        downtimeType: record?.downtimeType,
        downtimeStart: dayjs(initialValues?.downtimeStart).format('YYYY-MM-DDTHH:mm:ss'),
        downtimeEnd: dayjs(initialValues?.downtimeEnd).format('YYYY-MM-DDTHH:mm:ss'),
      }
try {
  const response = await downTimeUpdate(payload);

  if (!response.success) {
    throw new Error('Failed to update record');
  }
  else{
    message.success(response.message);
    setEditingKey('');
    handleSearch();
    
  }
  

  // Wait for the API response
  const updatedRecord = await response.json();
  console.log('API response:', updatedRecord);
} catch (error) {
  console.error('Error updating record:', error);
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
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };
  
  // Modify these columns in the columns array
  const columns = [
    {
      title: 'Resource ID',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: '15%',
      align: 'center' as const,
    },
    {
      title: 'Downtime Type',
      dataIndex: 'downtimeType',
      key: 'downtimeType',
      align: 'center' as const,
    },
    {
      title: 'Downtime Start',
      dataIndex: 'downtimeStart',
      key: 'downtimeStart',
      render: (text: string) => {
        const date = dayjs(text);
        return date.format('MMM DD, YYYY hh:mm:ss A');
      },
      align: 'center' as const,
    },
    {
      title: 'Downtime End',
      dataIndex: 'downtimeEnd',
      key: 'downtimeEnd',
      render: (text: string) => {
        const date = dayjs(text);
        return date.format('MMM DD, YYYY hh:mm:ss A');
      },
      align: 'center' as const,
    },
    {
      title: 'Duration',
      dataIndex: 'downtimeDuration',
      key: 'downtimeDuration',
      ellipsis: true,
      render: (text: string) => {
        if (!text) return '-';

        const seconds = parseInt(text);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours}h ${minutes}m ${remainingSeconds}s`;
      },
      align: 'center' as const,
    },
    
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      editable: true,
      render: (_: any, record: any) => {
          const editable = isEditing(record);
          return editable ? (
              <Form.Item
                  name="reason"
                  style={{ margin: 0 }}
              >
                  {/* <Input onChange={(e) => handleChange(e, 'reason')} /> */}
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
              record.reason
          );
      },
      align: 'center' as const,
  },
    {
      title: 'Root Cause',
      dataIndex: 'rootCause',
      key: 'rootCause',
      ellipsis: true,
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
      align: 'center' as const,
    },
  
  ];

  const handleSearch = async () => {
    message.destroy();
    if((dateRange == undefined || dateRange == null) && (resourceId == undefined || resourceId == null || resourceId.length == 0 || resourceId == '')){
      message.error('Please select a date range or resource');
      return;
    }
    setLoading(true);
    try {
      let result;
 
        const payload ={
          downtimeStart: dateRange && dateRange[0]  ? dayjs(dateRange[0]).format('YYYY-MM-DDTHH:mm:ss') : null,
          downtimeEnd: dateRange && dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DDTHH:mm:ss') : null,
          site: site,
          resourceList: resourceId ? (resourceId?.length > 0 ? resourceId : null) : null,
        }
        result = await fetchDownTimeWithFilters(payload);
      
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

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
            <Row gutter={16}>
              <Col span={12}>
                <RangePicker
                  showTime
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={8}>
                <Select
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
                  {/* <FormPopup initialValues={initialValues} setInitialValues={setInitialValues} isEditing={editingKey} setEditingKey = {setEditingKey} /> */}
     
                </Space>
              </Col>
            </Row>
            <Form form={form} component={false}>
              <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                bordered
                pagination={false}
                scroll={{ y: 'calc(100vh - 230px)' }}
                size="small"
              />
            </Form>
          </Space>
        </Card>
  );
};

export default DownTimeTable;

// Remove the Form and Table components that were outside the component

