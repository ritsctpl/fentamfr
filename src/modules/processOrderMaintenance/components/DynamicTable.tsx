import React, { useState } from 'react';
import { StyledTable } from '@modules/processOrderMaintenance/styles/TableStyle';
import { SearchOutlined } from '@ant-design/icons';
import { DynamicTableProps } from '@modules/processOrderMaintenance/types/processTypes';



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

  const handleFilterChange = (value: any, key: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const filteredData = data.filter((record) =>
    Object.keys(filters).every((key) =>
      filters[key] ? record[key]?.toString().includes(filters[key]) : true
    )
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const enhancedColumns = columns.map((col) => ({
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
      // pagination={{
      //   current: currentPage,
      //   pageSize: pageSize,
      //   total: filteredData.length,
      //   onChange: (page) => setCurrentPage(page),
      // }}
      pagination={false}
      scroll={{ y: 'calc(100vh - 300px)' }}
      onChange={handleTableChange}
      dataSource={paginatedData}
      // rowClassName={(record) => (record.shiftName === selectedRowKey ? 'selected-row' : '')}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
      })}
    />
  );
};

export default DynamicTable;
