import React, { useState } from "react";
import { Table } from "antd";
import type { TableProps } from "antd";

interface DynamicTableProps<T extends { key: string | number }> extends Omit<TableProps<T>, 'dataSource'> {
  dataSource: T[];
  loading?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  onRowClick?: (record: T) => void;
  selectedRowKey?: string | number;
  selectedRouting?: any
  readonly?: boolean
}

const DynamicTable = <T extends { key: string | number }>({
  dataSource,
  loading = false,
  selectedRouting,
  onRowSelect,
  onRowClick,
  selectedRowKey,
  readonly,
  ...props
  
}: DynamicTableProps<T>) => {
  return (
    <Table
      dataSource={dataSource}
      loading={loading}
      rowSelection={onRowSelect ? {
        onChange: (_, selectedRows) => {
          onRowSelect(selectedRows);
        },
      } : undefined}
      onRow={(record) => ({
        onClick: () => {
          if(readonly) return
          onRowClick(record);
        },
        style: {
          cursor: 'pointer',
          backgroundColor: record.key === selectedRowKey ? '#e6f7ff' : undefined,
        }
      })}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      }}
      scroll={{ x: "max-content" }}
      {...props}
    />
  );
};

export default DynamicTable;