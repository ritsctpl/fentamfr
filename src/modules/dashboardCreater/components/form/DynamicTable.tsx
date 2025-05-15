import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
interface DynamicTableProps {
    data: any[];
    onRow?: (record: any) => {
        onClick: () => void;
    };
}

const DynamicTable: React.FC<DynamicTableProps> = ({ data,onRow }) => {
    let columns: ColumnsType<any> = [];
    if (!Array.isArray(data) || data.length === 0) {
        columns = [];
    } else {
        // Get only the first three keys from the data
        const keys = Object.keys(data[0]).slice(0, 3);
        
        columns = keys.map(key => ({
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
    }

    return (
        <Table
            columns={columns || []}
            dataSource={data.map((item, index) => ({
                ...item,
                key: index
            }))}
            pagination={false}
            scroll={{ x: 'max-content', y: 700 }}
            size="middle"
            bordered
            onRow={onRow}
        />
    );
};

export default DynamicTable;