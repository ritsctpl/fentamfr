import React, { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnType, TableProps } from 'antd';
import { Button, Input, Space, Table } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { FilterConfirmProps, SortOrder } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';

interface ReuseTableProps<T extends object> {
  columns: ColumnType<T>[];
  dataSource: T[];
  onChange?: TableProps<T>['onChange'];
  onRow?: (record: T) => { onClick: () => void };
  pagination?: TableProps<T>['pagination'];
}

export interface TableColumnProps<T> extends ColumnType<T> {
  searchable?: boolean;
  sortable?: boolean;
}

const ReuseTable = <T extends object>({ 
  columns, 
  dataSource, 
  onChange, 
  onRow,
  pagination 
}: ReuseTableProps<T>) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: keyof T): TableColumnType<T> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${String(dataIndex)}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, String(dataIndex))}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, String(dataIndex))}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(String(dataIndex));
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = record[dataIndex];
      return recordValue
        ? recordValue.toString().toLowerCase().includes((value as string).toLowerCase())
        : false;
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === String(dataIndex) ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const getSortProps = (dataIndex: keyof T): Partial<TableColumnType<T>> => ({
    sorter: {
      compare: (a: T, b: T) => {
        const valueA = a[dataIndex];
        const valueB = b[dataIndex];
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return valueA.localeCompare(valueB);
        }
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return valueA - valueB;
        }
        return 0;
      },
      multiple: 1
    },
    sortDirections: ['ascend', 'descend'] as SortOrder[],
  });

  const enhancedColumns = columns.map((col) => {
    const typedCol = col as TableColumnProps<T>;
    let enhancedCol = { ...col };

    if (typedCol.searchable) {
      enhancedCol = {
        ...enhancedCol,
        ...getColumnSearchProps(col.dataIndex as keyof T),
      };
    }

    if (typedCol.sortable) {
      enhancedCol = {
        ...enhancedCol,
        ...getSortProps(col.dataIndex as keyof T),
      };
    }

    return enhancedCol;
  });

  return (
    <Table<T>
      columns={enhancedColumns}
      dataSource={dataSource}
      onChange={onChange}
      onRow={onRow}
      pagination={pagination}
    />
  );
};

export default ReuseTable;