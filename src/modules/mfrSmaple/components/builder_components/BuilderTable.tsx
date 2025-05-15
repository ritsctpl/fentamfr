import React from 'react';
import { Table, Input, Select } from 'antd';
import Column from 'antd/es/table/Column';
import ColumnGroup from 'antd/es/table/ColumnGroup';

interface BuilderTableProps {
    isEditable?: boolean;
    props: {
        title: any,
        type?: any,
        metaData?: any[] | any,
        data: any[],
        style?: any,
        onChange?: any
    }
}

const BuilderTable: React.FC<BuilderTableProps> = ({ isEditable = true, props }) => {
    const { title, data, onChange, type, metaData } = props;
    const { heading, table } = props.style;

    console.log(props)

    const handleInputChange = (value: string, rowIndex: number, key: string) => {
        console.log(`New value for row ${rowIndex}, column ${key}: ${value}`);
    };

    const generatedColumns = Array.isArray(metaData) && metaData.length > 0
        ? metaData.map((col: any) => ({
            title: col.title,
            dataIndex: col.dataIndex,
            key: col.dataIndex,
            render: (text: any, record: any, rowIndex: number) => (
                <Input.TextArea
                    autoSize={{ minRows: 1, maxRows: 10 }}
                    style={{ border: 'none' }}
                    value={text || ''}
                    onChange={(e) => handleInputChange(e.target.value, rowIndex, col.dataIndex)}
                    size="small"
                />
            )
        }))
        : [];

    const dataWithKey = data.map((item, index) => ({
        key: item.key || index.toString(),
        ...item,
    }));

    return (
        <div style={{ width: '100%', maxWidth: '100%' }}>
            <h3 style={{ margin: 5, marginBottom: 20, fontWeight: 600, textAlign: heading.titleAlign }}>{title}</h3>
            <Table
                columns={generatedColumns}
                dataSource={dataWithKey}
                pagination={false}
                bordered
                tableLayout="fixed"
                size="small"
            />
        </div>
    );
};

export default BuilderTable;