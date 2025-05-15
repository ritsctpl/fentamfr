import React, { useState, useRef } from 'react';
import { Table, Input, Button, InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from '@modules/processOrderMaintenance/styles/Tab.module.css';

interface DataRow {
  [key: string]: string | number | boolean;
}

interface ProcessOrderTableProps {
  data: DataRow[];
  onRowSelect?: (row: DataRow) => void; // Callback function for row selection
}

const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const ProcessOrderTable: React.FC<ProcessOrderTableProps> = ({ data, onRowSelect }) => {
  
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
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      ellipsis: true,
      render: (text: string) => text || '---',
      sorter: (a: DataRow, b: DataRow) => String(a.orderNumber).localeCompare(String(b.orderNumber)),
      ...getColumnSearchProps('orderNumber'),
    },
    {
      title: 'Order Type',
      dataIndex: 'orderType',
      // width: 150,
      key: 'orderType',
      ellipsis: true,
      render: (text: string) => text || '---',
      sorter: (a: DataRow, b: DataRow) => String(a.orderType).localeCompare(String(b.orderType)),
      ...getColumnSearchProps('orderType'),
    },
    {
      title: 'Production Version',
      dataIndex: 'productionVersion',
      key: 'productionVersion',
      ellipsis: true,
      render: (text: string) => text || '---',
      sorter: (a: DataRow, b: DataRow) => String(a.productionVersion).localeCompare(String(b.productionVersion)),
      ...getColumnSearchProps('productionVersion'),
    },
    {
      title: 'Material',
      dataIndex: 'material',
      key: 'material',
      ellipsis: true,
      // width: 150,
      render: (text: string) => text || '---',
      sorter: (a: DataRow, b: DataRow) => String(a.material).localeCompare(String(b.material)),
      ...getColumnSearchProps('material'),
    },
    {
      title: 'Material Description',
      dataIndex: 'materialDescription',
      key: 'materialDescription',
      ellipsis: true,
      render: (text: string) => text || '---',
      sorter: (a: DataRow, b: DataRow) => String(a.materialDescription).localeCompare(String(b.materialDescription)),
      ...getColumnSearchProps('materialDescription'),
    },
    {
      title: 'Available Qty To Release',
      dataIndex: 'availableQtyToRelease',
      key: 'availableQtyToRelease',
      ellipsis: true,
      render: (text: string | number) => text || '---',
      sorter: (a: DataRow, b: DataRow) => Number(a.availableQtyToRelease) - Number(b.availableQtyToRelease),
      ...getColumnSearchProps('availableQtyToRelease'),
    },
    {
      title: 'Batch Number',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      // width: 150,
      ellipsis: true,
      render: (text: string) => text || '---',
      sorter: (a: DataRow, b: DataRow) => String(a.batchNumber).localeCompare(String(b.batchNumber)),
      ...getColumnSearchProps('batchNumber'),
    },
    {
      title: 'UOM',
      dataIndex: 'uom',
      // width: 100,
      key: 'uom',
      ellipsis: true,
      render: (text: string) => text || '---',
      sorter: (a: DataRow, b: DataRow) => String(a.uom).localeCompare(String(b.uom)),
      ...getColumnSearchProps('uom'),
    },
  ];

  return (
    <Table
      className={styles.table}
      size='small'
      dataSource={data}
      columns={columns}
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
        y: 'calc(100vh - 235px)',
        x: '100%'
      }}
    />
  );
};

export default ProcessOrderTable;
