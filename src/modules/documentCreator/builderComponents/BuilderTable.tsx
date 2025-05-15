import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Tooltip, Space, message } from 'antd';
import {
    PlusCircleOutlined,
    DeleteOutlined,
    VerticalAlignTopOutlined,
    VerticalAlignBottomOutlined,
    ClearOutlined,
    PlusOutlined,
    SaveOutlined,
    UndoOutlined
} from '@ant-design/icons';
import styles from '../styles/DocumentCreator.module.css';
import { FaCodePullRequest } from 'react-icons/fa6';
import { BILL_OF_MATERIAL_PROPS } from '../../mfrSmaple/constants/builderConstants';

interface BuilderTableProps {
    isEditable?: boolean;
    props: {
        title: any;
        type?: any;
        metaData?: any[] | any;
        data: any[];
        style?: any;
        onChange?: (newData: any[]) => void;
        componentId: string;
        section?: 'header' | 'main' | 'footer';
    }
}

const BuilderTable: React.FC<any> = ({ isEditable = true, props }) => {
    const { title, onChange, type, metaData, componentId, section = 'main' } = props;
    const { heading, table } = props.style || { heading: { titleAlign: 'left' }, table: {} };
    const [tableData, setTableData] = useState<any[]>([]);
    const [originalData, setOriginalData] = useState<any[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // Initialize with empty data
        const emptyRow = { key: '0' };
        setOriginalData([]);
        setTableData([]);
    }, []);

    const handleInputChange = (value: string, rowIndex: number, key: string) => {
        const newData = [...tableData];
        newData[rowIndex] = {
            ...newData[rowIndex],
            [key]: value
        };
        setTableData(newData);
        setHasChanges(true);
    };

    const createEmptyRow = () => {
        return metaData.reduce((acc: any, col: any) => {
            acc[col.dataIndex] = '';
            return acc;
        }, { key: Date.now().toString() });
    };

    const handleAddRowBefore = () => {
        if (selectedRowKeys.length === 0) return;

        const index = tableData.findIndex(item => item.key === selectedRowKeys[0]);
        const newRow = createEmptyRow();
        const newData = [
            ...tableData.slice(0, index),
            newRow,
            ...tableData.slice(index)
        ];
        setTableData(newData);
        onChange?.(newData);
    };

    const handleAddRowAfter = () => {
        if (selectedRowKeys.length === 0) return;

        const index = tableData.findIndex(item => item.key === selectedRowKeys[selectedRowKeys.length - 1]);
        const newRow = createEmptyRow();
        const newData = [
            ...tableData.slice(0, index + 1),
            newRow,
            ...tableData.slice(index + 1)
        ];
        setTableData(newData);
        onChange?.(newData);
    };

    const handleDeleteSelected = () => {
        if (selectedRowKeys.length === 0) return;
        const newData = tableData.filter(item => !selectedRowKeys.includes(item.key));
        setTableData(newData);
        onChange?.(newData);
        setSelectedRowKeys([]);
    };

    const handleClearAll = () => {
        const newData: any[] = [];  // Empty array instead of creating a new row
        setTableData(newData);
        onChange?.(newData);
        setSelectedRowKeys([]);
    };

    const handleAddRow = () => {
        const newRow = createEmptyRow();
        const newData = [...tableData, newRow];
        setTableData(newData);
        onChange?.(newData);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => {
            setSelectedRowKeys(keys as string[]);
        }
    };

    const generatedColumns = Array.isArray(metaData) && metaData.length > 0
        ? metaData.map((col: any) => ({
            title: col.title,
            dataIndex: col.dataIndex,
            key: col.dataIndex,
            width: '100%',
            render: (text: any, record: any, rowIndex: number) => (
                <div className={styles.cellContainer}>
                    <Input.TextArea
                        autoSize={{ minRows: 1, maxRows: 10 }}
                        className={styles.cellInput}
                        value={text || ''}
                        onChange={(e) => handleInputChange(e.target.value, rowIndex, col.dataIndex)}
                        size="small"
                        style={{ width: '100%', resize: 'none' }}
                    />
                </div>
            ),
            onCell: () => ({
                className: styles.tableCell,
                style: { padding: 0, width: '100%' }
            })
        }))
        : [];

    const handleSave = () => {
        try {
            // Get existing templates from localStorage
            const templatesStr = localStorage.getItem('templates');
            if (!templatesStr) {
                message.error('No templates found');
                return;
            }

            const templates = JSON.parse(templatesStr);

            // Find the current template that contains this component
            const currentTemplate = templates.find((t: any) =>
                t.components?.[section]?.some((c: any) => c.id === componentId)
            );

            if (!currentTemplate) {
                message.error('Template not found');
                return;
            }

            // Find the component in the correct section array
            const componentIndex = currentTemplate.components[section].findIndex(
                (c: any) => c.id === componentId
            );

            if (componentIndex === -1) {
                message.error('Component not found');
                return;
            }

            // Save the table data directly as an array of objects
            currentTemplate.components[section][componentIndex].config.data = tableData.map(row => {
                // Create a new object without the 'key' property
                const { key, ...rowData } = row;
                return rowData;
            });

            // Save back to localStorage
            localStorage.setItem('templates', JSON.stringify(templates));

            setOriginalData(tableData);
            setHasChanges(false);
            message.success('Table data saved successfully');
            onChange?.(tableData);
        } catch (error) {
            message.error('Failed to save table data');
            console.error('Save error:', error);
        }
    };

    const handleCancel = () => {
        setTableData(originalData);
        setHasChanges(false);
        setSelectedRowKeys([]);
        message.info('Changes discarded');
    };

    const handleLoadData = () => {
        try {
            // Load data from BILL_OF_MATERIAL_PROPS
            const sampleData = BILL_OF_MATERIAL_PROPS.data;

            // Add key property to each row
            const dataWithKeys = sampleData.map((row, index) => ({
                ...row,
                key: index.toString()
            }));

            setTableData(dataWithKeys);
            setOriginalData(dataWithKeys);
            setHasChanges(true);
            message.success('Data loaded successfully');
        } catch (error) {
            message.error('Failed to load data');
            console.error('Load error:', error);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%' }}>
            <div className={styles.tableHeader}>
                <h3 style={{ fontWeight: 600, textAlign: heading.titleAlign }}>{title}</h3>
                <Space className={styles.tableActions}>
                    <Tooltip title="Add new row">
                        <Button
                            icon={<PlusCircleOutlined />}
                            onClick={handleAddRow}
                        />
                    </Tooltip>
                    <Tooltip title="Insert row before selection">
                        <Button
                            icon={<VerticalAlignTopOutlined />}
                            onClick={handleAddRowBefore}
                            disabled={selectedRowKeys.length === 0}
                        />
                    </Tooltip>
                    <Tooltip title="Insert row after selection">
                        <Button
                            icon={<VerticalAlignBottomOutlined />}
                            onClick={handleAddRowAfter}
                            disabled={selectedRowKeys.length === 0}
                        />
                    </Tooltip>
                    <Tooltip title="Delete selected rows">
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={handleDeleteSelected}
                            disabled={selectedRowKeys.length === 0}
                            danger
                        />
                    </Tooltip>
                    <Tooltip title="Clear all rows">
                        <Button
                            icon={<ClearOutlined />}
                            onClick={handleClearAll}
                        />
                    </Tooltip>
                </Space>
            </div>
            <Table
                rowSelection={rowSelection}
                columns={generatedColumns}
                dataSource={tableData}
                pagination={false}
                bordered
                tableLayout="fixed"
                size="small"
                className={styles.builderTable}
            />
            <div className={styles.actionFooter}>
                {
                    title === 'Bill Of Material' && <Button
                        icon={<FaCodePullRequest />}
                        onClick={handleLoadData}
                    >
                        Load Data
                    </Button>
                }
                <Button
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    disabled={!hasChanges}
                >
                    Save
                </Button>
                <Button
                    icon={<UndoOutlined />}
                    onClick={handleCancel}
                    disabled={!hasChanges}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default BuilderTable;