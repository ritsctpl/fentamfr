import React from 'react';
import { Table, Input } from 'antd';
import { ColumnType, TableRowSelection, Key, RowSelectMethod } from 'antd/es/table/interface';
import styles from '@modules/processOrderMaintenance/styles/CommonTable.module.css'

interface DynamicTableProps<T> {
  dataSource: T[];
  columns: Array<ColumnType<T>>;
  rowSelection: TableRowSelection<T>;
  onRowSelect: (id: string, value: string | null) => void;
  uiConfig: {
    multiSelect: boolean;
    pagination?: false | { current: number; pageSize: number; total: number };
  };
}

const DynamicTable = <T extends { id: string }>({
  dataSource,
  columns,
  rowSelection,
  onRowSelect,
  uiConfig
}: DynamicTableProps<T>) => {
  const handleRowClick = (record: T) => {
    const { selectedRowKeys = [], onChange } = rowSelection;
    const isSelected = selectedRowKeys.includes(record.id);

    const info: { type: 'checkbox' | 'radio' } = {
      type: uiConfig.multiSelect ? 'checkbox' : 'radio'
    };

    if (uiConfig.multiSelect) {
      const newSelectedRowKeys = isSelected
        ? selectedRowKeys.filter(key => key !== record.id)
        : [...selectedRowKeys, record.id];

      const newSelectedRows = dataSource.filter(row => newSelectedRowKeys.includes(row.id));

      if (onChange) {
        onChange(newSelectedRowKeys, newSelectedRows, info as unknown as { type: RowSelectMethod });
      }

      const nextKey = Object.keys(record).find(key => key !== 'id') as keyof T;
      if (nextKey) {
        const newValues = newSelectedRows.map(row => row[nextKey] as unknown as string || '');
        onRowSelect(record.id, newValues.join(', '));
      }
    } else {
      const newSelectedRowKeys = isSelected ? [] : [record.id];
      const newSelectedRows = isSelected ? [] : [record];

      if (onChange) {
        onChange(newSelectedRowKeys, newSelectedRows, info as unknown as { type: RowSelectMethod });
      }

      onRowSelect(newSelectedRowKeys[0] || '', newSelectedRows.length > 0 ? (newSelectedRows[0] as unknown as string) : null);
    }
  };

  const enhancedColumns = columns.reduce<Array<ColumnType<T>>>((acc, col) => {
    if (col.dataIndex === 'id') {
      acc.push(col);
      const nextKey = columns.find(column => column.dataIndex !== 'id')?.dataIndex;
      if (nextKey) {
        acc.push({
          title: 'Value',
          dataIndex: nextKey,
          render: (text: any, record: T) => (
            <Input
              defaultValue={record[nextKey as keyof T] as string}
              onChange={(e) => onRowSelect(record.id, e.target.value)}
            />
          ),
        });
      }
    } else {
      acc.push(col);
    }
    return acc;
  }, []);

  return (
    <Table
    className={styles.tableContain}
      columns={enhancedColumns}
      dataSource={dataSource}
      rowSelection={{ type: uiConfig.multiSelect ? 'checkbox' : 'radio', ...rowSelection }}
      rowKey={(record: T) => record.id}
      pagination={uiConfig.pagination}
      onRow={(record: T) => ({
        onClick: () => handleRowClick(record),
      })}
    />
  );
};

export default DynamicTable;
