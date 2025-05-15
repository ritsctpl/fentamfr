
import React, { useState, useEffect } from 'react';
import { StyledTable } from '../styles/TableStyle';
import { SearchOutlined } from '@ant-design/icons';
import { DynamicTableProps } from '../types/schedulerTypes';

const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  currentPage,
  handleRowClick,
  handleTableChange,
  setCurrentPage,
  selectedRowKey,
}) => {
  const [filters, setFilters] = useState<any>({});
  const [pageSize, setPageSize] = useState(10); // Initial default page size

  const calculatePageSize = () => {
    const rowHeight = 48; // Adjust this based on your row height in pixels
    const headerHeight = 50; // Adjust if there's a header height
    const footerHeight = 50; // Adjust if there's a footer height
    const availableHeight = window.innerHeight - headerHeight - footerHeight;
    const newSize = Math.floor(availableHeight / rowHeight);
    setPageSize(newSize > 0 ? newSize : 1); // Ensure at least 1 row
  };

  useEffect(() => {
    calculatePageSize(); // Set initial page size
    window.addEventListener('resize', calculatePageSize); // Update on resize
    return () => window.removeEventListener('resize', calculatePageSize); // Cleanup
  }, []);
  const filteredScheduler = data.map(({ entityId, entityType, entityName, eventType,nextRunTime }) => ({
    entityId,
    entityType,
    entityName,
    eventType,
    nextRunTime
  }));
  const filteredData = filteredScheduler.filter((record) =>
    Object.keys(filters).every((key) =>
      filters[key] ? record[key]?.toString().includes(filters[key]) : true
    )
  );
console.log(columns,"columnsll");

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const filteredColumnKeys = ["entityId", "entityType", "entityName", "eventType","nextRunTime"];
const newColumns = columns.filter(column => filteredColumnKeys.includes(column.dataIndex));


  const enhancedColumns = newColumns.map((col) => ({
    ...col,
    filters: col.filters || [],
    ellipsis: true,
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
          <a onClick={() => confirm()} style={{ marginRight: 8 }}>Search</a>
          <a onClick={() => clearFilters()}>Reset</a>
        </div>
      </div>
    ),
    sorter: (a: any, b: any) => {
      if (a[col.dataIndex] < b[col.dataIndex]) return -1;
      if (a[col.dataIndex] > b[col.dataIndex]) return 1;
      return 0;
    },
    sortDirections: ['ascend', 'descend'] as const,
  }));

  return (
    <StyledTable
      columns={enhancedColumns}
      rowKey="shiftName"
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: filteredData.length,
        onChange: (page) => setCurrentPage(page),
      }}
      onChange={handleTableChange}
      dataSource={paginatedData}
      rowClassName={(record) => (record === selectedRowKey ? 'selected-row' : '')}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
      })}
    />
  );
};

export default DynamicTable;
