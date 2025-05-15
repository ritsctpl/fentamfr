import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Card } from 'antd';

interface TableChartProps {
    data: any[];
}

const TableChart: React.FC<TableChartProps> = ({ data }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return  <Card style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No data available</Card>;
    }

    const columns: ColumnsType<any> = Object.keys(data[0]).map(key => ({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        dataIndex: key,
        key: key,
        render: (text: any) => {
            if (typeof text === 'number') {
                return text.toLocaleString();
            }
            if (text === null || text === undefined) {
                return '-';
            }
            if (typeof text === 'boolean') {
                return text ? 'Yes' : 'No';
            }
            if (typeof text === 'object') {
                return JSON.stringify(text);
            }
            return text;
        },
        sorter: (a: any, b: any) => {
            if (typeof a[key] === 'number' && typeof b[key] === 'number') {
                return a[key] - b[key];
            }
            if (typeof a[key] === 'string' && typeof b[key] === 'string') {
                return a[key].localeCompare(b[key]);
            }
            return 0;
        },
        filters: Array.from(new Set(data.map(item => item[key])))
            .map(value => ({
                text: value?.toString() || '-',
                value: value?.toString() || ''
            })),
        onFilter: (value: string | number | boolean, record: any) => 
            record[key]?.toString() === value.toString(),
    }));

    return (
        <Table 
            columns={columns}
            dataSource={data.map((item, index) => ({
                ...item,
                key: index 
            }))}
            pagination={{
                defaultPageSize: 10,
            }}
            scroll={{ x: 'max-content' }}
            size="middle"
            bordered
        />
    );
};

export default TableChart;