import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface CustomTableProps {
  data: any[];
  scroll?: { x?: string | number | true; y?: string | number };
}

const CustomTable: React.FC<CustomTableProps> = ({ data, scroll }) => {
  const generateColumns = (data: any[]): ColumnsType<any> => {
    if (!data.length) return [];

    // Get the first item to extract column names
    const firstItem = data[0];
    
    return Object.keys(firstItem).map(key => {
      const isNumeric = typeof firstItem[key] === 'number';
      
      return {
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'), // Convert camelCase to Title Case
        dataIndex: key,
        key: key,
        width: key === 'operation' || key === 'shiftId' ? 180 : 120,
        ellipsis: true,
        align: isNumeric ? 'right' as const : 'left' as const,
        render: (value: any) => {
          if (value === null || value === undefined || value === '') return '-';
          
          if (typeof value === 'number') {
            if (key.toLowerCase().includes('percentage')) {
              return `${value}%`;
            }
            return value.toLocaleString(undefined, {
              minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
              maximumFractionDigits: 2
            });
          }
          
          return value;
        }
      };
    }).filter(col => col.key !== 'key'); // Exclude the 'key' column if it exists
  };

  const columns = generateColumns(data);

  return (
    <Table 
      columns={columns || []} 
      dataSource={data || []} 
      scroll={scroll}
      pagination={false}
      size="middle"
      bordered
      style={{ 
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default CustomTable;