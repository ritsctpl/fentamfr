import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { ReloadOutlined } from '@ant-design/icons';

interface ScheduleEntry {
  id: string;
  systemName: string;
  cronExpression: string;
  nextExecutionTime: string;
  lastExecutionTime: string;
  status: string;
  enabled: boolean;
}

const ExecutionSchedule: React.FC = () => {
  const columns: ColumnsType<ScheduleEntry> = [
    {
      title: 'System Name',
      dataIndex: 'systemName',
      key: 'systemName',
      filters: [
        { text: 'System A', value: 'SYSTEM_A' },
        { text: 'System B', value: 'SYSTEM_B' },
      ],
      onFilter: (value, record) => record.systemName === value,
    },
    {
      title: 'Cron Expression',
      dataIndex: 'cronExpression',
      key: 'cronExpression',
    },
    {
      title: 'Next Execution',
      dataIndex: 'nextExecutionTime',
      key: 'nextExecutionTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.nextExecutionTime).unix() - dayjs(b.nextExecutionTime).unix(),
    },
    {
      title: 'Last Execution',
      dataIndex: 'lastExecutionTime',
      key: 'lastExecutionTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`status-${status.toLowerCase()}`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (enabled ? 'Yes' : 'No'),
      filters: [
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ],
      onFilter: (value, record) => record.enabled === value,
    },
  ];

  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      // const response = await api.getExecutionSchedules();
      // setScheduleData(response.data);
    } catch (error) {
      console.error('Failed to fetch execution schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="execution-schedule">
      <div className="execution-schedule-header">
        <div className="execution-schedule-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={fetchSchedules} icon={<ReloadOutlined />} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>
      <Table<ScheduleEntry>
        columns={columns}
        dataSource={scheduleData}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      />
    </div>
  );
};

export default ExecutionSchedule;
