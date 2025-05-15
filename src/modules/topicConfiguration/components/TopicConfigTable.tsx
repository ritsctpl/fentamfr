import React, { useState, useRef } from 'react';
import { Table, Input, Button, InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from '@/modules/topicConfiguration/styles/CommonTable.module.css';

interface DataRow {
  [key: string]: string | number | boolean;
}

interface TopicConfiqTableProps {
  data: DataRow[];
  onRowSelect?: (row: DataRow) => void; // Callback function for row selection
}

const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const TopicConfiqTable: React.FC<TopicConfiqTableProps> = ({ data, onRowSelect }) => {
  
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);
  const searchInput = useRef<InputRef | null>(null);
  const { t } = useTranslation();

  const handleRowClick = (row: DataRow) => {
    setSelectedRow(row);
    if (onRowSelect) {
      onRowSelect(row); // Call the callback with the selected row data
    }
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: any) => void,
    dataIndex: string
  ) => {
    confirm();
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
  };

  const getColumnSearchProps = (dataIndex: string): ColumnsType<DataRow>[number] => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${capitalizeFirstLetter(dataIndex)}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters!)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      if (typeof recordValue === 'boolean') {
        return recordValue.toString().toLowerCase() === (value as string).toLowerCase();
      }
      return recordValue
        ? recordValue.toString().toLowerCase().includes((value as string).toLowerCase())
        : false;
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns = [
    {
      title: t('topicName'),
      dataIndex: 'topicName',
      key: 'topicName',
      ellipsis: true,
      render: (text: string) => text || '---',
      sorter: (a: DataRow, b: DataRow) => String(a.topicName).localeCompare(String(b.topicName)),
      align: 'center',
      ...getColumnSearchProps('topicName'),
    },
    {
      title: t('apiUrl'),
      dataIndex: 'apiUrl',
      key: 'apiUrl',
      ellipsis: true,
      render: (text: string) => text || '---',
      sorter: (a: DataRow, b: DataRow) => String(a.apiUrl).localeCompare(String(b.apiUrl)),
      align: 'center',
      ...getColumnSearchProps('apiUrl'),
    },
    {
      title: t('status'),
      dataIndex: 'active',
      key: 'active',
      ellipsis: true,
      render: (text: boolean) => text ? 'Active' : 'Inactive',
      sorter: (a: DataRow, b: DataRow) => String(a.active).localeCompare(String(b.active)),
      align: 'center',
      ...getColumnSearchProps('active'),
    }
  ];

  return (
    <Table
      className={styles.table}
      size='small'
      dataSource={data}
      columns={columns as ColumnsType<DataRow>}
      rowKey={(record: any) => record.id || JSON.stringify(record)} 
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        className: record === selectedRow ? styles.selectedRow : '',
        style:{
          fontSize: '13.5px', 
        },
      })}
      pagination={false}
      scroll={{ 
        y: 'calc(100vh - 230px)',
        x: '100%'
      }}
    />
  );
};

export default TopicConfiqTable;
