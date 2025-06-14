import React, { useState, useRef, useEffect } from 'react';
import { Table, Input, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import styles from '../styles/CommonTable.module.css';
import { useTranslation } from 'react-i18next';
import { useMyContext } from '../hooks/WorkFlowConfigurationContext';


interface DataRow {
  [key: string]: string | number;
}

interface CommonTableProps {
  data: DataRow[];
  onRowSelect?: (row: DataRow) => void; // Callback function for row selection
}

const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const CommonTable: React.FC<CommonTableProps> = ({ data, onRowSelect }) => {
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);
  const { setPayloadData, showAlert, setShowAlert, isAdding, setIsAdding } = useMyContext();
  const searchInput = useRef<HTMLInputElement | null>(null);


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
  const { t } = useTranslation();
  
  const getColumnSearchProps = (dataIndex: string): ColumnsType<DataRow>[number] => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          // ref={searchInput}
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


  const columns: ColumnsType<DataRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => {
        const aValue = a.name;
        const bValue = b.name;
        return typeof aValue === 'string' && typeof bValue === 'string' 
          ? aValue.localeCompare(bValue) 
          : 0;
      },
      sortDirections: ['ascend', 'descend'],
      width: 100,
    },
    {
      title: 'Version',
      dataIndex: 'Version',
      key: 'Version',
      sorter: (a, b) => {
        const aValue = a.version;
        const bValue = b.version;
        return typeof aValue === 'string' && typeof bValue === 'string' 
        ? aValue.localeCompare(bValue) 
        : 0;
      },
      sortDirections: ['ascend', 'descend'],
      width: 100,
    },
   {
      title: 'Attachment Type',
      dataIndex: 'attachmentType',
      key: 'attachmentType',
      sorter: (a, b) => {
        const aValue = a.attachmentType;
        const bValue = b.attachmentType;
        return typeof aValue === 'string' && typeof bValue === 'string' 
          ? aValue.localeCompare(bValue) 
          : 0;
      },
      sortDirections: ['ascend', 'descend'],
      width: 100,
    },
    {
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      sorter: (a, b) => {
        const aValue = a.entityType;
        const bValue = b.entityType;
        return typeof aValue === 'string' && typeof bValue === 'string' 
          ? aValue.localeCompare(bValue) 
          : 0;
      },
      sortDirections: ['ascend', 'descend'],
      width: 100,
    },
    {
      title: 'Attached To',
      dataIndex: 'attachedTo',
      key: 'attachedTo',
      sorter: (a, b) => {
        const aValue = a.attachedTo;
        const bValue = b.attachedTo;
        return typeof aValue === 'string' && typeof bValue === 'string' 
          ? aValue.localeCompare(bValue) 
          : 0;
      },
      sortDirections: ['ascend', 'descend'],
      width: 100,
    },
  ];


return (
  <Table
    className={styles.table}
    dataSource={data}
    columns={columns}
    rowKey={(record) => record.id || JSON.stringify(record)} // A unique key to identify each row, you may use a specific field or combination of fields
    onRow={(record) => ({
      onClick: () => handleRowClick(record),
      className: record === selectedRow ? styles.selectedRow : '',
      style: { fontSize: '13.5px' }
    })}
    pagination={false}
    scroll={{ y: 'calc(100vh - 250px)' }}
  />
);
};

export default CommonTable;
