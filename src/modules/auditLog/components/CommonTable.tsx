import React, { useState, useRef } from 'react';
import { Table, Input, Button, InputRef, Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import styles from '../styles/CommonTable.module.css';
import { useTranslation } from 'react-i18next';

interface DataRow {
  [key: string]: string | number;
}

interface CommonTableProps {
  data: DataRow[];
  onRowSelect?: (row: DataRow) => void;
  loading?: boolean;
  customDate?: string;
}

const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const CommonTable: React.FC<CommonTableProps> = ({ data, onRowSelect, loading = false, customDate }) => {
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);
  const searchInput = useRef<InputRef | null>(null);
  const {t} = useTranslation()

  const [isModalOpen, setIsModalOpen] = useState(false);

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
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns = [
    {
      title: t('action'),
      dataIndex: 'action_code',
      key: 'action_code',
      align: 'center' as const,
      render: (text: string) => text || '--'
    },
    {
      title: t('dateTime'),
      dataIndex: 'date_time',
      key: 'date_time',
      align: 'center' as const,
      render: (text: string) => text ? new Date(text).toLocaleString() : '--'
    },
    {
      title: t('changeType'),
      dataIndex: 'change_type',
      key: 'change_type',
      align: 'center' as const,
      render: (text: string) => text || '--'
    },
    {
      title: t('user'),
      dataIndex: 'userId',
      key: 'userId',
      align: 'center' as const,
      render: (text: string) => text || '--'
    },
    // {
    //   title: t('details'),
    //   dataIndex: 'details',
    //   key: 'details',
    //   render: (text: string) => (
    //     <div> 
    //       <EyeOutlined 
    //         style={{ marginLeft: '8px', cursor: 'pointer' }}
    //         onClick={(e) => {
    //           e.stopPropagation();
    //           setIsModalOpen(true);
    //         }}
    //       />
    //     </div>
    //   ),
    // },
  ]
  
  return (
    <>
      <Spin spinning={loading}>
        <Table
          className={styles.table}
          dataSource={data}
          style={{ marginTop: '1px' }}
          columns={columns}
          rowKey={(record) => record.id || JSON.stringify(record)} // A unique key to identify each row, you may use a specific field or combination of fields
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: record === selectedRow ? styles.selectedRow : '',
          })}
          pagination={false} 
          // scroll={{ y: 'calc(100vh - 500px)' }}
          bordered={true}
          scroll={{ y: customDate == 'custom' ? 'calc(100vh - 310px)' : 'calc(100vh - 260px)' }}
          size="small"
        />
      </Spin>
      <Modal
        title={t('details')}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <div>
          <p>Details</p>
        </div>
      </Modal>
    </>
  );
};

export default CommonTable;
