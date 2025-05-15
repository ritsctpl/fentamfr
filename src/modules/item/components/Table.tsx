import React, { useState } from 'react';
import { StyledTable } from '@modules/item/styles/TableStyle';
import { RightOutlined, FilterOutlined } from '@ant-design/icons';

interface ItemTableProps {
    columns: any[];
    data: any[];
    currentPage: number;
    pageSize: number;
    handleRowClick: (record: any) => void;
    handleTableChange: (pagination: any, filters: any, sorter: any) => void;
    setCurrentPage: (page: number) => void;
    selectedRowKey: string | null;
}

const ItemTable: React.FC<ItemTableProps> = ({
    columns,
    data,
    currentPage,
    pageSize,
    handleRowClick,
    handleTableChange,
    setCurrentPage,
}) => {
    const [filters, setFilters] = useState<any>({});
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
        filterIcon: () => <FilterOutlined style={{ color: 'white', fontSize: '16px' }} />,
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
    })).concat({
        title: 'Action', 
        key: 'action',
        render: (text: any, record: any) => (
            <RightOutlined
                onClick={() => handleRowClick(record)} 
                style={{ cursor: 'pointer', fontSize: '16px' }}
            />
        ),
    });

    return (
        <StyledTable
            columns={enhancedColumns}
            rowKey="itemName"
            pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredData.length,
                onChange: (page) => setCurrentPage(page),
            }}
            onChange={handleTableChange}
            dataSource={paginatedData}
        />
    );
};

export default ItemTable;