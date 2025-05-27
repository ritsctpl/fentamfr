import React, { useState, useRef, useEffect } from 'react';
import { Table, Input, Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import styles from '../styles/CommonTable.module.css';
import { useTranslation } from 'react-i18next';
import { useMyContext } from '../hooks/WorkflowStatesContext';

interface DataRow {
  [key: string]: string | number | string[] | boolean | undefined;
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

  const getColumnSearchProps = (dataIndex: string): ColumnsType<DataRow>[number] => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
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
        ? Array.isArray(record[dataIndex])
          ? (record[dataIndex] as string[]).some(item => 
              item.toString().toLowerCase().includes((value as string).toLowerCase())
            )
          : record[dataIndex]
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (value) => {
      // Special rendering for arrays (like appliesTo)
      if (Array.isArray(value)) {
        return value.map(item => (
          <Tag key={item} color="processing" style={{ margin: '2px' }}>
            {item}
          </Tag>
        ));
      }
      
      // Special rendering for boolean values (like isEnd)
      if (typeof value === 'boolean') {
        return value ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Yes
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            No
          </Tag>
        );
      }
      
      // Handle undefined or null values
      if (value === undefined || value === null) {
        return (
          <Tag icon={<MinusCircleOutlined />} color="warning">
            Not Set
          </Tag>
        );
      }
      
      return value;
    }
  });

  const { t } = useTranslation();

  const columns: ColumnsType<any> = [
    // Specify the columns to show, including new columns
    ...(['name', 'description', 'appliesTo', 'editableFields', 'isEnd', 'isActive'  ]
      .filter(column => data?.[0] && data[0].hasOwnProperty(column))
      .map((column) => ({
        title: t(column),
        dataIndex: column,
        key: column,
        ...getColumnSearchProps(column),
        sorter: (a: any, b: any) => {
          const aValue = a[column];
          const bValue = b[column];

          // Handle sorting for arrays
          if (Array.isArray(aValue) && Array.isArray(bValue)) {
            return aValue.join(',').localeCompare(bValue.join(','));
          }

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return aValue - bValue;
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue);
          }

          if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            return (aValue === bValue) ? 0 : (aValue ? 1 : -1);
          }

          // Handle undefined or null values
          if (aValue === undefined || aValue === null) return -1;
          if (bValue === undefined || bValue === null) return 1;

          return 0;
        },
      }))
    ),
  ];

  return (
    <Table
      className={styles.table}
      dataSource={data}
      columns={columns}
      rowKey={(record) => record.id || JSON.stringify(record)}
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