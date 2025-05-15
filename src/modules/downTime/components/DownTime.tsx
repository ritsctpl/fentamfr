"use client"
import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Button, DatePicker, Input, Row, Col, Layout, message, Select } from 'antd';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { fetchResource } from "@services/oeeServices";
import { parseCookies } from 'nookies';
import { Content } from 'antd/es/layout/layout'

import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const cookies = parseCookies();
const site = cookies.site;

// Add these imports at the top
import { Form, Input as AntInput } from 'antd';
import type { InputRef } from 'antd';
import { downTimeUpdate, fetchDownTimeWithFilters } from '@services/siteServices';
import { CloseOutlined, EditOutlined, SaveOutlined } from '@mui/icons-material';

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
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [resourceId, setResourceId] = useState<string>(null);
  // Add these states after other state declarations
  const [allResources, setAllResources] = useState<any>([]);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<string>('');
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

    fetchResourceData();
  }, []);
  // Add these functions before the columns definition
  const isEditing = (record: any) => record.id.toString() === editingKey;
  
  const edit = (record: any) => {
    form.setFieldsValue({
      commentUsr: record?.commentUsr,
      reason: record?.reason,
      rootCause: record?.rootCause,
    });
    setEditingKey(record?.id.toString());
  };
  
  const cancel = () => {
    setEditingKey('');
  };
  
  const save = async (record) => {
    try {
      const row = await form.validateFields();
      console.log('Edited values:', row,record.key); // This will show the new values being saved
const payload = {
  "commentUsr": row.commentUsr,
  "reason": row.reason,
  "rootCause": row.rootCause,
  site: site,
  id: record?.id,
  downtimeType:record?.downtimeType
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
      ellipsis: true,
    },
    {
      title: 'Shift ID',
      dataIndex: 'shiftId',
      key: 'shiftId',
      ellipsis: true,
    },
    {
      title: 'Downtime Start',
      dataIndex: 'downtimeStart',
      key: 'downtimeStart',
      ellipsis: true,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Downtime End',
      dataIndex: 'downtimeEnd',
      key: 'downtimeEnd',
      ellipsis: true,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: 'Duration',
      dataIndex: 'downtimeDuration',
      key: 'downtimeDuration',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Comment User',
      dataIndex: 'commentUsr',
      key: 'commentUsr',
      ellipsis: true,
      editable: true,
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="commentUsr"
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : (
          record.commentUsr
        );
      }
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
            <Input />
          </Form.Item>
        ) : (
          record.reason
        );
      }
    },
    {
      title: 'Root Cause',
      dataIndex: 'rootCause',
      key: 'rootCause',
      ellipsis: true,
      editable: true,
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="rootCause"
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : (
          record.rootCause
        );
      }
    },
    {
      title: 'Downtime Type',
      dataIndex: 'downtimeType',
      key: 'downtimeType',
      ellipsis: true,
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              onClick={() => save(record)}
              type="link"
              style={{ marginRight: 8 }}
              icon={<SaveOutlined style={{ fontSize: '18px' }} />}
            >
              
            </Button>
            <Button 
              onClick={cancel} 
              type="link"
              icon={<CloseOutlined style={{ fontSize: '18px' }} />}
            >
              
            </Button>
          </span>
        ) : (
          <Button 
            type="link" 
            disabled={editingKey !== ''} 
            onClick={() => edit(record)}
            icon={<EditOutlined style={{ fontSize: '18px' }} />}
          >
          </Button>
        );
      },
    },
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      let result;
 
        const payload ={
          downtimeStart: dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DDTHH:mm:ss') : null,
          downtimeEnd: dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DDTHH:mm:ss') : null,
          site: site,
          resourceList: resourceId ? (resourceId.length > 0 ? resourceId : null) : null,
        }
        result = await fetchDownTimeWithFilters(payload);
      
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);
console.log(data,'sjgbhsdbhc');

  return (
    <Layout>
      <CommonAppBar appTitle="DownTime Report" onSearchChange={handleSearch} />
      <Content style={{ padding: '24px' }}>
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
                <Button type="primary" onClick={handleSearch}>
                  Search
                </Button>
              </Col>
            </Row>
            <Form form={form} component={false}>
              <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
              />
            </Form>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default DownTimeTable;

// Remove the Form and Table components that were outside the component