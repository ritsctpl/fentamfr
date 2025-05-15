import React from 'react';
import { Table, Input } from 'antd';
 
interface BuilderTableProps {
    isEditable?: boolean;
    props: {
        title?: string;
        type?: string;
        metaData?: any[];
        data: any[];
        style?: {
            heading: {
                titleAlign?: 'left' | 'center' | 'right';
            };
        };
        onChange?: (data: any[]) => void;
    };
}
 
const TreeTable: React.FC<BuilderTableProps> = ({ isEditable = true, props }) => {
    const { title, data, onChange, metaData } = props;
    const { heading } = props.style || {};
 
    const handleInputChange = (value: string, rowIndex: number, key: string) => {
        const updatedData = [...data];
        updatedData[rowIndex][key] = value;
        onChange?.(updatedData);
    };
 
    const columns = metaData?.map((col: any) => ({
        title: col.title,
        dataIndex: col.dataIndex,
        key: col.dataIndex,
        width: col.width,
        render: (text: string, record: any, rowIndex: number) =>
            isEditable ? (
                <Input.TextArea
                    autoSize
                    style={{ border: 'none' }}
                    value={text || ''}
                    onChange={(e) => handleInputChange(e.target.value, rowIndex, col.dataIndex)}
                    size="small"
                />
            ) : (
                text
            ),
    })) || [];
 
    return (
        <div style={{ width: '100%' }}>
            <h3 style={{ margin: 5, marginBottom: 20, fontWeight: 600, textAlign: heading?.titleAlign || 'left' }}>
                {title}
            </h3>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                bordered
                tableLayout="fixed"
                size="small"
                expandable={{
                    defaultExpandAllRows: true,
                    expandIcon: () => null
                }}
            />
        </div>
    );
};
 
export default TreeTable;