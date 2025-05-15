"use client"
import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Button, DatePicker, Input, Select, Modal, Form, Row, Col, Layout, Typography } from 'antd';
import type { TableProps } from 'antd';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
// import { byIdentifier, byStatus, fetchWorkflowResponseTop50, fetchWorkflowResponseByDateRange, fetchFilteredWorkflowResponses } from '@services/workflowResponse';
import { parseCookies } from 'nookies';
import { Content } from 'antd/es/layout/layout';
import { CloseOutlined } from '@mui/icons-material';
import { ProcessedMessagesType } from '../types/processedMessagesTypes';
import {
  fetchProcessedMessagesTop50,
  fetchProcessedMessagesWithFilters
} from '@services/processedmessagesService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;


const cookies = parseCookies();
const site = cookies.site;
const ProcessedMessagesScreen: React.FC = () => {
  const [records, setRecords] = useState<ProcessedMessagesType[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null,
    topicName: null,
  });
  const [selectedJson, setSelectedJson] = useState<any>(null);
  const [goButtonLoading, setGoButtonLoading] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<ProcessedMessagesType | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const initialFilters = {
    status: null,
    dateRange: null,
    topicName: null,
  };
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetchProcessedMessagesTop50(site)
      setRecords(response);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setGoButtonLoading(true);
    try {
      // Check if any filters are applied
      const hasDateRange = filters.dateRange && filters.dateRange[0] && filters.dateRange[1];
      const hasStatus = filters.status;
      const hasTopicName = filters.topicName;

      // If no filters are applied, fetch top 50
      if (!hasDateRange && !hasStatus && !hasTopicName) {
        await fetchRecords();
        return;
      }

      // Format dates if date range exists
      const startDate = hasDateRange ? filters.dateRange[0].format('YYYY-MM-DDTHH:mm:ss') : '';
      const endDate = hasDateRange ? filters.dateRange[1].format('YYYY-MM-DDTHH:mm:ss') : '';

      const response = await fetchProcessedMessagesWithFilters(
        startDate,
        endDate,
        {
          status: filters.status || '',
          topicName: filters.topicName || ''
        }
      );
      setRecords(response);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setGoButtonLoading(false);
    }
  };

  const handleRowClick = (record: ProcessedMessagesType) => {
    setSelectedRowData(record);
    setShowDetails(true);
  };

  const columns: TableProps<ProcessedMessagesType>['columns'] = [
    {
      title: 'Message ID',
      dataIndex: 'messageId',
      sorter: (a, b) => (a.messageId || '').localeCompare(b.messageId || ''),
      width: 100,
    },
    {
      title: 'Topic Name',
      dataIndex: 'topicName',
      width: 150,
    },
    {
      title: 'Processed At',
      dataIndex: 'processedAt',
      width: 140,
      render: (processedAt) => {
        if (processedAt) {
          return new Date(processedAt).toLocaleString();
        }
        return 'N/A';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (status) => (
        <Space>
          {status?.toUpperCase() === 'PROCESSED' && '✅'}
          {status?.toUpperCase() === 'FAILED' && '❌'}
          {status?.toUpperCase() === 'PENDING' && '⏳'}
          {status || 'N/A'}
        </Space>
      ),
    },
  ];

  const handleTopicNameChange = (e: any) => {
    const value = e.target.value;
    setFilters({ ...filters, topicName: value });
  };

  const handleStatusChange = (value: string | null) => {
    setFilters({ ...filters, status: value });
  };

  useEffect(() => {
    fetchRecords();
  }, []);
  console.log(filters, "filters");

  const formatDisplayValue = (record: ProcessedMessagesType) => {
    let displayText = '';

    // If there's a message, parse and format it
    if (record?.message) {
      try {
        const parsedMessage = JSON.stringify(JSON.parse(record?.message), null, 2);
        displayText += parsedMessage;
      } catch (error) {
        displayText += record?.message;
      }
    }

    // If there's an error message, add it with a separator
    if (record?.errorMessage) {
      if (displayText) {
        displayText += '\n\n=== Error Message ===\n';
      }
      displayText += record?.errorMessage;
    }

    return displayText;
  };

  return (
    <div className="p-6">
      <CommonAppBar
        allActivities={[]}
        username={null}
        site={null}
        appTitle={`${t("Processed Messages")}`}
        onSiteChange={null}
        onSearchChange={() => { }}
      />
      <Card style={{ marginBottom: '1px' }}>
        <Row gutter={[16, 16]} justify="start">
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label htmlFor="status-select" style={{ marginRight: '8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>Status:</label>
              <Select
                id="status-select"
                value={filters.status}
                style={{ width: '100%' }}
                onChange={handleStatusChange}
                placeholder="Select status"
                options={[
                  { value: 'PROCESSED', label: 'Processed' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'FAILED', label: 'Failed' },
                ]}
                allowClear
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label htmlFor="date-range" style={{ marginRight: '8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>Date:</label>
              <RangePicker
                id="date-range"
                value={filters.dateRange}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                style={{ width: '100%' }}
                showTime={{
                  format: 'HH:mm:ss',
                  defaultValue: [
                    dayjs('00:00:00', 'HH:mm:ss'),
                    dayjs('23:59:59', 'HH:mm:ss')
                  ]
                }}
                format="YYYY-MM-DD HH:mm:ss"
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label htmlFor="topicname-input" style={{ marginRight: '8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>Topic Name:</label>
              <Input
                id="topicname-input"
                value={filters.topicName}
                onChange={handleTopicNameChange}
                placeholder="Enter Topic Name"
                allowClear
                style={{ width: '100%' }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} style={{ marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button type="primary" onClick={applyFilters} loading={goButtonLoading} style={{ marginRight: '8px' }}>
                Go
              </Button>
              <Button onClick={() => {
                setFilters(initialFilters);
                fetchRecords();
                const dateRangeElement = document.getElementById('date-range') as any;
                if (dateRangeElement) {
                  dateRangeElement.value = null;
                }
              }}>
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Layout style={{ height: '80vh' }}>
        <Content style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%'
        }}>
          <div style={{
            width: showDetails ? '60%' : '100%',
            transition: 'width 0.3s',
            paddingRight: showDetails ? '8px' : 0
          }}>

            {/* <Typography style={{ marginLeft: '20px' }}>
              {t("workflowResponse")}({records ? records.length : 0})
            </Typography> */}

            <Card style={{ height: '100%', overflowY: 'auto' }}>

              <Table
                columns={columns}
                size="small"
                dataSource={records}
                loading={loading}
                rowKey="_id"
                bordered={true}
                pagination={false}
                scroll={{ y: 'calc(100vh - 230px)', x: '100%' }}
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                })}
              />
            </Card>
          </div>

          {showDetails && (
            <div style={{
              width: '40%',
              transition: 'width 0.3s'
            }}>
              <Card
                style={{ height: '100%', overflowY: 'auto' }}
              >
                {selectedRowData ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>Processed Message Details</h3>
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => { setShowDetails(false); setSelectedJson(null); }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong>Message ID:</strong> {selectedRowData?.messageId}<br />
                      <strong>Topic Name:</strong> {selectedRowData?.topicName}<br />
                      <strong>Status:</strong> {selectedRowData?.status} {selectedRowData?.status?.toUpperCase() === 'PROCESSED' && '✅'} {selectedRowData?.status?.toUpperCase() === 'FAILED' && '❌'} {selectedRowData?.status?.toUpperCase() === 'PENDING' && '⏳'}<br />
                      <strong>Processed At:</strong> {new Date(selectedRowData?.processedAt).toLocaleString()}
                    </div>
                    <div>
                      <Input.TextArea
                        value={formatDisplayValue(selectedRowData)}
                        style={{
                          height: 'calc(100vh - 350px)',
                          fontFamily: 'monospace',
                          color: selectedRowData?.errorMessage && !selectedRowData?.message ? 'red' : 'inherit'
                        }}
                        className={selectedRowData?.errorMessage ? 'error-textarea' : ''}
                        readOnly
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    Select a row to view details
                  </div>
                )}
              </Card>
            </div>
          )}
        </Content>
      </Layout>

      <style jsx global>{`
        .error-textarea .ant-input:not(:first-child) {
          color: red;
        }
      `}</style>
    </div>
  );
};

export default ProcessedMessagesScreen;