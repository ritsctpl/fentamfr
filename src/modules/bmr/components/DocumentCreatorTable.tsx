import React, { useState, useRef } from 'react';
import { Table, Input, Button, InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import styles from '@modules/documentCreator/styles/DocumentCreator.module.css';
import { useTranslation } from 'react-i18next';

interface DocumentListItem {
  id: string;
  title: string;
  type: string;
  createdDate: string;
  status: string;
  productName: string;
  mfrNo: string;
  [key: string]: string | number; // Add index signature for compatibility
}

interface DocumentCreatorTableProps {
  data: DocumentListItem[];
  onRowSelect?: (row: DocumentListItem) => void; 
}

const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const DocumentCreatorTable: React.FC<DocumentCreatorTableProps> = ({ data, onRowSelect }) => {
  const [selectedRow, setSelectedRow] = useState<DocumentListItem | null>(null);
  const searchInput = useRef<InputRef | null>(null);
  const {t} = useTranslation()

  const handleRowClick = (row: DocumentListItem) => {
    setSelectedRow(row);
    if (onRowSelect) {
      onRowSelect(row); 
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

  const getColumnSearchProps = (dataIndex: string): ColumnsType<DocumentListItem>[number] => ({
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

  const columns: ColumnsType<DocumentListItem> = [
    {
      title: t('BMR'),
      dataIndex: 'title',
      key: 'title',
      ...getColumnSearchProps('title'),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: t('Product Name'),
      dataIndex: 'productName',
      key: 'productName',
      ...getColumnSearchProps('productName'),
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    },
    {
      title: t('MFR Name.'),
      dataIndex: 'mfrNo',
      key: 'mfrNo',
      ...getColumnSearchProps('mfrNo'),
      sorter: (a, b) => a.mfrNo.localeCompare(b.mfrNo),
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      ...getColumnSearchProps('type'),
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: t('createdDate'),
      dataIndex: 'createdDate',
      key: 'createdDate',
      ...getColumnSearchProps('createdDate'),
      sorter: (a, b) => a.createdDate.localeCompare(b.createdDate),
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      ...getColumnSearchProps('status'),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
  ];

  return (
    <Table
      className={styles.table}
      dataSource={data}
      columns={columns}
      rowKey="id"
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        className: record === selectedRow ? styles.selectedRow : '',
      })}
      // pagination={{ pageSize: 10 }} 
      pagination={false}
      scroll={{ y: 'calc(100vh - 225px)' }}
    />
  );
};

export default DocumentCreatorTable;
