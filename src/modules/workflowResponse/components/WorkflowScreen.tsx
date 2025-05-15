import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Button, DatePicker, Input, Select, Modal, Form, Row, Col, Layout, Typography, message } from 'antd';
import type { TableProps } from 'antd';
import CommonAppBar from '@components/CommonAppBar';
import { useTranslation } from 'react-i18next';
import { fetchWorkflowResponseTop50, fetchWorkflowFilterResponse } from '@services/workflowResponse';
import { parseCookies } from 'nookies';
import { Content } from 'antd/es/layout/layout';
import { CloseOutlined } from '@mui/icons-material';
import { WorkflowRecord } from '../types/workflowIntegrationTypes';
import InstructionModal from '@components/InstructionModal';
import UserInstructions from './userInstructions';

const { RangePicker } = DatePicker;



const WorkflowScreen: React.FC = () => {
  const [records, setRecords] = useState<WorkflowRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WorkflowRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null,
    identifier: null,
  });
  const [selectedJson, setSelectedJson] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goButtonLoading, setGoButtonLoading] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<WorkflowRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedResponseType, setSelectedResponseType] = useState<string | null>(null);
  const [call, setCall] = useState(0)

  const initialFilters = {
    status: null,
    dateRange: null,
    identifier: null,
  };
  useEffect(() => {
    fetchRecords();
  }, [call]);

  const fetchRecords = async () => {
    const cookies = parseCookies();
    const site = cookies.site;
    setLoading(true);
    try {
      const response = await fetchWorkflowResponseTop50(site)
      setRecords(response);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    message.destroy();
    const cookies = parseCookies();
    const site = cookies.site;
    const transformedFilters = {
      site: site,
      identifier: filters.identifier || undefined,
      status: filters.status || undefined,
      startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD[T]00:00:00') || undefined,
      endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD[T]23:59:59') || undefined
    };

    const cleanFilters = Object.fromEntries(
      Object.entries(transformedFilters).filter(([_, value]) => value !== undefined)
    );

    try {
      const response = await fetchWorkflowFilterResponse(cleanFilters);
      console.log(response, 'kljk');
      if (!response?.errorCode) {
        setRecords(response);
      }
      else {
        setRecords([]);
      }

      if (response.message) {
        message.error(response.message)
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
      setGoButtonLoading(false);
    }
  };

  const handleRowClick = (record: WorkflowRecord) => {
    setSelectedRowData(record);
    setShowDetails(true);
    setSelectedResponseType('input');
    try {
      const parsed = typeof record.input === 'string' ? JSON.parse(record.input) : record.input;
      setSelectedJson(parsed);
    } catch (error) {
      setSelectedJson(record.input);
    }
  };

  const columns: TableProps<any>['columns'] = [
    {
      title: 'Message ID',
      dataIndex: 'messageId',
      ellipsis: true,
      sorter: (a, b) => (a.messageId || '').localeCompare(b.messageId || ''),
    },
    {
      title: 'Identifier',
      dataIndex: 'identifier',
      ellipsis: true,
    },
    {
      title: 'Timestamp',
      dataIndex: 'createdDateTime',
      sorter: (a, b) => new Date(a.createdDateTime || 0).getTime() - new Date(b.createdDateTime || 0).getTime(),
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      ellipsis: true,
      render: (status) => (
        <Space>
          {status === 'Pass' && '🟢'}
          {status === 'Fail' && '❌'}
          {status === 'Pending' && '⏳'}
          {status || 'N/A'}
        </Space>
      ),
    },
  ];

  const identifierChange = (e: any) => {
    const value = e.target.value;
    setFilters({ ...filters, identifier: value });
  };

  const handleStatusChange = (value: string | null) => {
    setFilters({ ...filters, status: value });
  };

  // Add this new function to generate dynamic options
  const getAvailableResponseTypes = (record: WorkflowRecord) => {
    const options = [
      { key: 'input', label: 'Input Data' },
      { key: 'preprocessJoltResponse', label: 'Pre-process Jolt Response' },
      { key: 'preprocessApiResponse', label: 'Pre-process API Response' },
      { key: 'preprocessXsltResponse', label: 'Pre-process XSLT Response' },
      { key: 'postProcessJoltResponse', label: 'Post-process Jolt Response' },
      { key: 'postProcessApiResponse', label: 'Post-process API Response' },
      { key: 'apiToProcessResponse', label: 'API to Process Response' },
      { key: 'passHandlerResponse', label: 'Pass Handler Response' },
      { key: 'failHandlerResponse', label: 'Fail Handler Response' },
    ];

    // Filter options based on available data
    return options.filter(option => {
      const value = record[option.key as keyof WorkflowRecord];
      return value !== null && value !== undefined && value !== '';
    });
  };

  return (
    <div className="p-6">
      <CommonAppBar
        allActivities={[]}
        username={null}
        site={null}
        appTitle={`${t("WorkFlow Response")}`}
        onSiteChange={function (): void { setCall(call + 1) }}
        onSearchChange={() => { }}
      />
      <Card style={{ marginBottom: '1px' }}>
        <Row gutter={[16, 16]} justify="end">
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
                  { value: 'Pass', label: 'Pass' },
                  { value: 'Fail', label: 'Fail' },
                  { value: 'Pending', label: 'Pending' },
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
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label htmlFor="identifier-input" style={{ marginRight: '8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>Identifier:</label>
              <Input
                id="identifier-input"
                value={filters.identifier}
                onChange={identifierChange}
                placeholder="Enter identifier"
                allowClear
                style={{ width: '100%' }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={applyFilters} loading={goButtonLoading} style={{ marginRight: '8px' }}>
              Go
            </Button>
            <Button style={{ marginRight: '8px' }} onClick={() => {
              setFilters(initialFilters);
              fetchRecords();
            }}>
              Reset
            </Button>
            <span>
              <InstructionModal title="Workflow Response">
                <UserInstructions />
              </InstructionModal>
            </span>
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
                columns={columns || []}
                size="small"
                dataSource={records || []}
                loading={loading}
                bordered={true}
                pagination={false}
                scroll={{ y: 'calc(100vh - 230px)', x: '100%' }}
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  style: { fontSize: '13.5px' }
                })}
              />
            </Card>

            {/* <Table dataSource={records} columns={columns}/> */}
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
                      <h3 style={{ margin: 0 }}>Workflow Details</h3>
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => { setShowDetails(false); setSelectedJson(null); }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong>Message ID:</strong> {selectedRowData.messageId}<br />
                      <strong>Identifier:</strong> {selectedRowData.identifier}<br />
                      <strong>Status:</strong> {selectedRowData.status} {selectedRowData.status === 'Pass' && '✅'} {selectedRowData.status === 'Fail' && '❌'} {selectedRowData.status === 'Pending' && '⏳'}<br />
                      <strong>Created Date:</strong> {selectedRowData.createdDateTime}
                    </div>
                    <div>
                      <Select
                        value={selectedResponseType}
                        style={{ width: '100%', marginBottom: '8px' }}
                        placeholder="Select response type"
                        onChange={(value) => {
                          setSelectedResponseType(value);
                          const data = selectedRowData[value as keyof WorkflowRecord];
                          try {
                            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                            setSelectedJson(parsed);
                          } catch (error) {
                            setSelectedJson(data);
                          }
                        }}
                      >
                        {selectedRowData && getAvailableResponseTypes(selectedRowData).map(option => (
                          <Select.Option key={option.key} value={option.key}>
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                      <Input.TextArea
                        value={selectedJson ? JSON.stringify(selectedJson, null, 2) : ''}
                        style={{ height: 'calc(100vh - 350px)', fontFamily: 'monospace' }}
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
    </div>
  );
};

export default WorkflowScreen;