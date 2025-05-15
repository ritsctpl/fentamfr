import React, { useState, useEffect } from 'react';
import { Table, Button, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { ReloadOutlined, ClearOutlined } from '@ant-design/icons';
import { fetchSchedulerOutput } from '@services/schedulerOld';

interface SchedulerHistory {
  id: string;
  scheduleId: string;
  executionTime: string;
  apiInput: string;
  apiOutput: string;
  error: boolean;
  details?: string;
  system?: string;
}

interface HistoryProps {
  historyData: SchedulerHistory[];
  selectedRowData: any;
  setHistoryData: any;
}


const History: React.FC<HistoryProps> = ({ historyData, selectedRowData, setHistoryData }) => {
  const columns: ColumnsType<SchedulerHistory> = [
    {
      title: 'Execution Time',
      dataIndex: 'executionTime',
      width:"150px",
      key: 'executionTime',
      render: (executionTime: string) => dayjs(executionTime).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.executionTime).unix() - dayjs(b.executionTime).unix(),
    },
    {
      title: 'Status',
      dataIndex: 'error',
      width:"150px",
      key: 'error',
      render: (error: boolean) => (error ? 'Failed' : 'Success'),
      filters: [
        { text: 'Success', value: false },
        { text: 'Failed', value: true }
      ],
      onFilter: (value, record) => record.error === value,
    },
   
    {
      title: 'API Input',
      dataIndex: 'apiInput',
      key: 'apiInput',
      render: (apiInput: string) => (
        <Input.TextArea style={{ width: '150%', height: '100px', overflowY: 'scroll' }} readOnly value={apiInput} />
      ),
      ellipsis: true,
    },
    {
      title: 'API Output',
      dataIndex: 'apiOutput',
      key: 'apiOutput',
      render: (apiOutput: string) => {
        let formattedOutput = apiOutput;
        try {
          formattedOutput = JSON.stringify(JSON.parse(apiOutput), null, 2);
        } catch (e) {
          // If JSON parsing fails, use the raw string
          console.warn('Failed to parse API output as JSON:', e);
        }
        return (
          <Input.TextArea 
            style={{ width: '150%', height: '100px', overflowY: 'scroll' }} 
            readOnly 
            value={formattedOutput}
          />
        );
      },
      ellipsis: true,
    }
  ];

  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const fetchedHistoryData = await fetchSchedulerOutput(selectedRowData.id);
      console.log(fetchedHistoryData, "fetchSchedulerOutput");
      // Sort the fetched data by executionTime in descending order
      const sortedHistoryData = fetchedHistoryData.sort((a, b) => dayjs(b.executionTime).unix() - dayjs(a.executionTime).unix());
      setHistoryData(sortedHistoryData);
    } catch (error) {
      console.log(error, "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="scheduler-history">
      <div className="scheduler-history-header">
        <div className="scheduler-history-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={fetchHistory} icon={<ReloadOutlined />} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>
      <Table<SchedulerHistory>
        columns={columns}
        dataSource={historyData}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ y: 'calc(100vh - 230px)' }}
      />
    </div>
  );
};

export default History;
