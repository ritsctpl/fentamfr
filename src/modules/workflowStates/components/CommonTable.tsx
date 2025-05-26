import React, { useState, useRef, useEffect } from 'react';
import { Table, Input, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import styles from '../styles/CommonTable.module.css';
import { useTranslation } from 'react-i18next';
import { useMyContext } from '../hooks/WorkflowStatesContext';


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

  const { t } = useTranslation();

  const columns: ColumnsType<DataRow> = [
    // Hardcoded columns
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      sorter: (a, b) => (a.name as string).localeCompare(b.name as string),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      key: 'description',
      ...getColumnSearchProps('description'),
      sorter: (a, b) => (a.description as string).localeCompare(b.description as string),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "Applies To",
      dataIndex: 'appliedTo',
      key: 'appliedTo',
      ...getColumnSearchProps('appliedTo'),
      sorter: (a, b) => (a.appliedTo as string).localeCompare(b.appliedTo as string),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: t('Is End'),
      dataIndex: 'isEnd',
      key: 'isEnd',
      ...getColumnSearchProps('isEnd'),
      sorter: (a, b) => {
        const aIsEnd = String(a.isEnd).toLowerCase();
        const bIsEnd = String(b.isEnd).toLowerCase();
        return aIsEnd.localeCompare(bIsEnd);
      },
      sortDirections: ['ascend', 'descend'],
      render: (isEnd) => isEnd ? 'Yes' : 'No',
    },
    // Dynamically generate remaining columns from the data
    ...((data?.[0] ? Object.keys(data[0]) : [])
      .filter(column => !['name', 'description', 'appliedTo', 'isEnd'].includes(column))
      .map((column) => ({
        title: t(column),
        dataIndex: column,
        key: column,
        ...getColumnSearchProps(column),
        sorter: (a: DataRow, b: DataRow) => {
          const aValue = a[column];
          const bValue = b[column];

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return aValue - bValue;
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue);
          }

          return 0;
        },
        // sortDirections: ['ascend', 'descend'] as SortOrder[],
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