import React, { useState } from 'react';
import { Table } from 'antd';
import { StyledTable } from '../styles/TableStyle';
import { SearchOutlined } from '@ant-design/icons';
import { DynamicTableProps } from '../types/recipeTypes';



const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  currentPage,
  pageSize,
  handleRowClick,
  handleTableChange,
  setCurrentPage,
  selectedRowKey,
}) => {
  const [filters, setFilters] = useState<any>({});
  const getPageSize = () => {
    const viewportHeight = window.innerHeight;
    const headerHeight = document.querySelector('header')?.offsetHeight || 0; // Adjust as needed
    const footerHeight = document.querySelector('footer')?.offsetHeight || 0; // Adjust as needed
    const usableHeight = viewportHeight - headerHeight - footerHeight;
    
  
    if (usableHeight >= 900) { // Large usable height
      return 14; // Adjust page size for large screens
    } else if (usableHeight >= 700) { // Medium usable height
      return 8; // Adjust page size for medium screens
    } else if (usableHeight >= 500) { // Small usable height
      return 5; // Adjust page size for small screens
    } else { // Extra small usable height
      return 3; // Adjust page size for extra small screens
    }
  };

  const handleFilterChange = (value: any, key: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };
  const filteredRecipes = data?.map(({ recipeName, version, recipeId, batchSize, batchUom }) => ({
    recipeName,
    version,
    recipeId,
    batchSize,
    batchUom,
  }));
  const filteredData = filteredRecipes?.filter((record) =>
    Object.keys(filters).every((key) =>
      filters[key] ? record[key]?.toString().includes(filters[key]) : true
    )
  );

  const paginatedData = filteredData?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const enhancedColumns = columns
    .filter(col => col.dataIndex !== 'recipeName') // Filter out recipeId column
    .map((col) => ({
      ...col,
      filters: col.filters || [],
      onFilter: (value: any, record: any) =>
        record[col.dataIndex]?.toString().includes(value),
      filterIcon: () => <SearchOutlined style={{ color: 'black', fontSize: 'normal' }} />,
      filterDropdown: ({ setSelectedKeys, selectedKeys, clearFilters, confirm }: any) => (
        <div style={{ padding: 8 }}>
          <input
            placeholder={`Search ${col.title}`}
            value={selectedKeys[0] || ''}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                confirm();
              }
            }}
            style={{ marginBottom: 8, display: 'block', width: 188, borderRadius: 4, padding: 4 }}
          />
          <div>
            <a
              onClick={() => confirm()}
              style={{ marginRight: 8 }}
            >
              Search
            </a>
            <a onClick={() => clearFilters()}>Reset</a>
          </div>
        </div>
      ),
      render: (text: any) => (typeof text === 'boolean' ? (text ? 'True' : 'False') : text), // Convert boolean to True/False
      sorter: (a: any, b: any) => {
        if (a[col.dataIndex] < b[col.dataIndex]) return -1;
        if (a[col.dataIndex] > b[col.dataIndex]) return 1;
        return 0;
      },
      sortDirections: ['ascend', 'descend'] as const,
    }));
  

  return (
    <Table
      columns={enhancedColumns}
      dataSource={filteredData}
      pagination={false}
      size="small"
      scroll={{ y: 'calc(100vh - 230px)' }}
      onChange={handleTableChange}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        style: {fontSize: '13.5px' }
      })}
    />
  );
};

export default DynamicTable;
