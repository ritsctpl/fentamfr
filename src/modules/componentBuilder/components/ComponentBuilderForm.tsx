import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Switch, Table, Row, Col, Divider, Dropdown, Typography, Space, DatePicker, Checkbox } from 'antd';
import { useMyContext } from '../hooks/componentBuilderContext';
import { useTranslation } from 'react-i18next';
import { MenuProps } from 'antd/lib';
import { DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { title } from 'process';
const { Option } = Select;


const ComponentBuilderForm: React.FC<{ setFullScreen: (value: boolean) => void }> = ({ setFullScreen }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { payloadData, setPayloadData, showAlert, setShowAlert, isRequired, setIsRequired,
        fieldType, seeFullScreen, setSeeFullScreen
    } = useMyContext();

    // Add state for column and row configurations
    const [columnNames, setColumnNames] = useState<any>([]);
    const [rowData, setRowData] = useState<{ [key: string]: string }>({});

    // Add state for row selection
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [disableUnitField, setDisableUnitField] = useState<boolean>(false);

    useEffect(() => {
        form.setFieldsValue({
            componentLabel: payloadData?.componentLabel,
            dataType: payloadData?.dataType,
            unit: payloadData?.unit,
            defaultValue: payloadData?.defaultValue,
            required: payloadData?.required,
            validation: payloadData?.validation,
            apiUrl: payloadData?.apiUrl
        });

        // Initialize column names and row data based on payload
        if (payloadData?.dataType === 'Table') {
            const refTableColumns = Number(payloadData?.tableConfig?.columns || 0);
            setColumnNames(
                payloadData?.tableConfig?.columnNames?.map(title => title) ||
                Array(refTableColumns).fill('')
            );
            setRowData(payloadData?.tableConfig?.rowData || {});
        }
    }, [payloadData]);

    const handleInputChange = (fieldName: string, value: string) => {
        // if (fieldName == 'componentLabel') {
        //     value = value.replace(/ /g, '').replace(/[^a-zA-Z0-9_]/g, '');
        // }

        setPayloadData((prev) => ({
            ...prev,
            [fieldName]: value
        }));
        setShowAlert(true);
    };

    const handleSelectChange = (fieldName: string, value: string) => {
        // debugger
        if (value == 'Input' || value == "TextArea" || value == "DatePicker" || value == "Select" || value == "Table") {
            setPayloadData((prev) => ({
                ...prev,
                defaultValue: null,
                tableConfig: fieldName != "Table" ? {

                } : value,

                [fieldName]: value
            }));
            fieldType.current = value;
            setIsRequired(false);
        }
        else {
            setPayloadData((prev) => ({
                ...prev,
                defaultValue: value == "Integer" ? '0' : value == "Decimal" ? '0.0' : value == "Checkbox" ? 'false' : value == "Switch" ? 'false' : '',
                [fieldName]: value
            }));
            setIsRequired(true);
            fieldType.current = value;
        }

        if(value == 'Select' || value == 'DatePicker' || value == 'Table' || value == 'Switch' ){
            setDisableUnitField(true);
        }
        else{
            setDisableUnitField(false);
        }

        setShowAlert(true);
    }

    const handleSwitchChange = (fieldName: string, value: boolean) => {
        setPayloadData((prev) => ({
            ...prev,
            [fieldName]: value
        }));
        setShowAlert(true);
    }

    

    const handleColumnNameChange = (index: number, value: string) => {
        // Convert to camelCase
        const camelCaseKeyName = value
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
            .replace(/^[A-Z]/, firstChar => firstChar.toLowerCase());

        const newColumnNames = [...columnNames];
        newColumnNames[index] = {
            title: value,
            type: newColumnNames[index]?.type || 'Input',
            dataIndex: camelCaseKeyName,
            required: newColumnNames[index]?.required || false
        };
        setColumnNames(newColumnNames);

        // Update payload based on data type
        if (payloadData?.dataType === 'Table') {
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    columnNames: newColumnNames
                }
            }));
        }

        setShowAlert(true);
    }

    const handleReferenceTableConfigChange1 = (field: string, value: any) => {
        setPayloadData((prev) => ({
            ...prev,
            tableConfig: {
                ...prev.tableConfig,
                [field]: value
            }
        }));

        // Update column names when number of columns changes
        if (field === 'columns') {
            const newColumnNames = Array(Number(value)).fill('');
            setColumnNames(newColumnNames);

            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    columnNames: newColumnNames
                }
            }));
        }

        // Update row data when rows change
        if (field === 'rows') {
            const newRowData: { [key: string]: string } = {};
            const columns = Number(payloadData?.tableConfig?.columns || 0);

            for (let rowIndex = 0; rowIndex < Number(value); rowIndex++) {
                for (let colIndex = 0; colIndex < columns; colIndex++) {
                    const key = `row${rowIndex + 1}-col${colIndex}`;
                    newRowData[key] = rowData[key] || '';
                }
            }

            setRowData(newRowData);

            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    rowData: newRowData
                }
            }));
        }

        setShowAlert(true);
    }

    const handleReferenceTableConfigChangeWorking = (field: string, value: any) => {
        if (field === 'columns') {
            const currentColumns = Number(payloadData?.tableConfig?.columns || 0);
            const newColumnCount = Number(value);
    
            // Create a new array of column names, preserving existing names
            const newColumnNames = Array(newColumnCount).fill('').map((_, index) => {
                // If the column already existed, keep its existing configuration
                if (index < currentColumns && columnNames[index]) {
                    return columnNames[index];
                }
                // Otherwise, create a new default column configuration
                return {
                    title: `Column ${index + 1}`,
                    type: 'Input',
                    dataIndex: `col${index}`,
                    required: false
                };
            });
    
            // Update column names state
            setColumnNames(newColumnNames);
    
            // Update payload with new column configuration
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    columns: newColumnCount,
                    columnNames: newColumnNames
                }
            }));
        } else {
            // Handle other configuration changes as before
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    [field]: value
                }
            }));
        }
    
        setShowAlert(true);
    }

    const handleReferenceTableConfigChange = (field: string, value: any) => {
        if (field === 'columns') {
            const currentColumns = Number(payloadData?.tableConfig?.columns || 0);
            const newColumnCount = Number(value);
    
            // Create a new array of column names, preserving existing names
            const newColumnNames = Array(newColumnCount).fill('').map((_, index) => {
                // If the column already existed, keep its existing configuration
                if (index < currentColumns && columnNames[index]) {
                    return columnNames[index];
                }
                // Otherwise, create a new default column configuration
                return {
                    title: `Column ${index + 1}`,
                    type: 'Input',
                    dataIndex: `col${index}`,
                    required: false
                };
            });
    
            // Update column names state
            setColumnNames(newColumnNames);
    
            // Update payload with new column configuration
            // IMPORTANT: Do NOT modify rows or rowData when changing columns
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    columns: newColumnCount,
                    columnNames: newColumnNames,
                    // Explicitly preserve existing rows and rowData
                    rows: prev.tableConfig?.rows || 0,
                    rowData: prev.tableConfig?.rowData || {}
                }
            }));
        } else {
            // Handle other configuration changes as before
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    [field]: value
                }
            }));
        }
    
        setShowAlert(true);
    }

    const handleRowDataChange = (rowKey: string, columnIndex: number, value: string) => {
        const newRowData = {
            ...rowData,
            [rowKey]: value
        };

        setRowData(newRowData);

        if (payloadData?.dataType === 'Table') {
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    rowData: newRowData
                }
            }));
        }

        setShowAlert(true);
    }

   

    

    const renderReferenceTablePreview1 = () => {
        if (!payloadData?.tableConfig) return null;

        const items: MenuProps['items'] = [
            {
                key: 'Integer',
                label: 'Integer',
            },
            {
                key: 'Decimal',
                label: 'Decimal',
            },
            {
                key: 'Text',
                label: 'Text',
            },
            {
                key: 'TextArea',
                label: 'TextArea',
            },
            {
                key: 'Datepicker',
                label: 'Datepicker',
            },
            {
                key: 'DateTimePicker',
                label: 'DateTimePicker',
            },
            // {
            //   key: 'Select',
            //   label: 'Select',
            // },
            {
                key: 'Switch',
                label: 'Switch',
            },
        ];

        const columns = Array.from({ length: Number(payloadData?.tableConfig?.columns) || 0 }).map((_, index) => ({
            title: (
                <div style={{ display: 'flex' }}>
                     {columnNames[index]?.required && (
                                    <span style={{ color: 'red', marginRight: '5px' }}>*</span>
                                )}
                    <Input
                        value={columnNames[index]?.title || ''}
                        onChange={(e) => handleColumnNameChange(index, e.target.value)}
                        placeholder={`Column ${index + 1}`}
                        style={{ width: '100%' }}
                        
                        suffix={
                            <>
                               
                                <Checkbox
                                    checked={columnNames[index]?.required || false}
                                    onChange={(e) => {
                                        const updatedColumnNames = [...columnNames];
                                        updatedColumnNames[index] = {
                                            ...updatedColumnNames[index],
                                            required: e.target.checked
                                        };
                                        setColumnNames(updatedColumnNames);

                                        // Update payload with the new column required status
                                        const updatedPayloadData = {
                                            ...payloadData,
                                            tableConfig: {
                                                ...payloadData?.tableConfig,
                                                columnNames: updatedColumnNames
                                            }
                                        };
                                        setPayloadData(updatedPayloadData);
                                    }}
                                />
                            </>
                        }
                    />
                    <Dropdown

                        menu={{
                            items,
                            selectable: true,
                            defaultSelectedKeys: ['Input'],
                            onSelect: (info) => {
                                // Update column type when selected
                                const updatedColumnNames = [...columnNames];
                                updatedColumnNames[index] = {
                                    title: updatedColumnNames?.[index]?.title || '',
                                    type: info.key as string,
                                    required: updatedColumnNames?.[index]?.required || false
                                };
                                setColumnNames(updatedColumnNames);

                                // Update payload with the new column type
                                const updatedPayloadData = {
                                    ...payloadData,
                                    tableConfig: {
                                        ...payloadData?.tableConfig,
                                        columnNames: updatedColumnNames
                                    }
                                };
                                setPayloadData(updatedPayloadData);
                            }
                        }}
                    >
                        <Typography.Link style={{
                            marginLeft: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Space align="center">
                                {/* {columnNames[index]?.type || 'Input'} */}
                                <DownOutlined style={{ verticalAlign: 'middle' }} />
                            </Space>
                        </Typography.Link>
                    </Dropdown>
                </div>
            ),
            dataIndex: `col${index}`,
            key: `col${index}`,
            width: 200,
            render: (_: any, record: any) => {
                const columnType = columnNames[index]?.type || 'Input';

                switch (columnType) {
                    case 'TextArea':
                        return (
                            <Input.TextArea
                                value={rowData[`row${record.key}-col${index}`] || ''}
                                onChange={(e) => handleRowDataChange(`row${record.key}-col${index}`, index, e.target.value)}
                                style={{ width: '100%' }}
                            />
                        );
                    case 'Datepicker':
                        return (
                            <DatePicker
                                value={rowData[`row${record.key}-col${index}`]
                                    ? dayjs(rowData[`row${record.key}-col${index}`])
                                    : null}
                                onChange={(date) => handleRowDataChange(
                                    `row${record.key}-col${index}`,
                                    index,
                                    date ? date.format('YYYY-MM-DD') : ''
                                )}
                                style={{ width: '100%' }}
                            />
                        );
                    case 'DateTimePicker':
                        return (
                            <DatePicker
                                showTime
                                value={rowData[`row${record.key}-col${index}`]
                                    ? dayjs(rowData[`row${record.key}-col${index}`])
                                    : null}
                                onChange={(date) => handleRowDataChange(
                                    `row${record.key}-col${index}`,
                                    index,
                                    date ? date.format('YYYY-MM-DD HH:mm:ss') : ''
                                )}
                                style={{ width: '100%' }}
                                placeholder='Select date time'
                            />
                        );
                    // case 'Select':
                    //     return (
                    //         <Select
                    //             value={rowData[`row${record.key}-col${index}`] || undefined}
                    //             onChange={(value) => handleRowDataChange(`row${record.key}-col${index}`, index, value)}
                    //             style={{ width: '100%' }}
                    //         >
                    //             {/* Add options as needed */}
                    //             <Select.Option value="option1">Option 1</Select.Option>
                    //             <Select.Option value="option2">Option 2</Select.Option>
                    //         </Select>
                    //     );
                    case 'Switch':
                        return (
                            <Switch
                                checked={rowData[`row${record.key}-col${index}`] === 'true'}
                                onChange={(checked) => handleRowDataChange(`row${record.key}-col${index}`, index, String(checked))}
                            />
                        );
                    default:
                        return (
                            <Input
                                value={rowData[`row${record.key}-col${index}`] || ''}
                                onChange={(e) => handleRowDataChange(`row${record.key}-col${index}`, index, e.target.value)}
                                style={{ width: '100%' }}
                                placeholder={'Enter ' + columnType}
                            />
                        );
                }
            }
        }));

        const previewData = Array.from({ length: Number(payloadData?.tableConfig?.rows) || 1 }).map((_, rowIndex) => ({
            key: String(rowIndex + 1),
            ...Object.fromEntries(Array.from({ length: Number(payloadData?.tableConfig?.columns) || 0 }).map((_, colIndex) =>
                [`col${colIndex}`, '']
            ))
        }));

        const rowSelection = {
            selectedRowKeys,
            onChange: (newSelectedRowKeys: React.Key[]) => {
                setSelectedRowKeys(newSelectedRowKeys);
            },
            type: 'checkbox' as const
        };

        const createNewRow = () => ({
            key: String(previewData.length + 1),
            ...Object.fromEntries(Array.from({ length: Number(payloadData?.tableConfig?.columns) || 0 }).map((_, colIndex) =>
                [`col${colIndex}`, '']
            ))
        });

        const handleInsertAppend = () => {
            const columns = Number(payloadData?.tableConfig?.columns || 0);
            const currentRows = Number(payloadData?.tableConfig?.rows || 1); // Default to 1 if undefined
            const newRowIndex = currentRows + 1;

            // Create new row data
            const newRowData = { ...rowData };
            for (let colIndex = 0; colIndex < columns; colIndex++) {
                const key = `row${newRowIndex}-col${colIndex}`;
                newRowData[key] = '';
            }

            setRowData(newRowData);

            // Update payload
            setPayloadData((prev) => {
                // Create a new preview data array
                const newPreviewData = Array.from({ length: newRowIndex }).map((_, rowIndex) => ({
                    key: String(rowIndex + 1),
                    ...Object.fromEntries(Array.from({ length: columns }).map((_, colIndex) =>
                        [`col${colIndex}`, '']
                    ))
                }));

                return {
                    ...prev,
                    tableConfig: {
                        ...prev.tableConfig,
                        rows: newRowIndex,
                        rowData: newRowData
                    }
                };
            });

            setShowAlert(true);
        };

        const handleInsertBefore = () => {
            if (selectedRowKeys.length === 0) {
                handleInsertAppend(); // If no row selected, just add at the end
                return;
            }

            const selectedRowIndex = Number(selectedRowKeys[0]);
            const columns = Number(payloadData?.tableConfig?.columns || 0);
            const currentRows = Number(payloadData?.tableConfig?.rows || 0);

            const newRowData = { ...rowData };

            // Shift existing rows down
            for (let rowIndex = currentRows; rowIndex >= selectedRowIndex; rowIndex--) {
                for (let colIndex = 0; colIndex < columns; colIndex++) {
                    const currentKey = `row${rowIndex}-col${colIndex}`;
                    const newKey = `row${rowIndex + 1}-col${colIndex}`;
                    newRowData[newKey] = newRowData[currentKey] || '';
                }
            }

            // Clear the selected row's data
            for (let colIndex = 0; colIndex < columns; colIndex++) {
                const key = `row${selectedRowIndex}-col${colIndex}`;
                newRowData[key] = '';
            }

            setRowData(newRowData);

            // Update payload
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    rows: currentRows + 1,
                    rowData: newRowData
                }
            }));

            setShowAlert(true);
        }

        const handleInsertAfter = () => {
            if (selectedRowKeys.length === 0) {
                handleInsertAppend(); // If no row selected, just add at the end
                return;
            }

            const selectedRowIndex = Number(selectedRowKeys[0]);
            const columns = Number(payloadData?.tableConfig?.columns || 0);
            const currentRows = Number(payloadData?.tableConfig?.rows || 0);

            const newRowData = { ...rowData };

            // Shift existing rows down
            for (let rowIndex = currentRows; rowIndex > selectedRowIndex; rowIndex--) {
                for (let colIndex = 0; colIndex < columns; colIndex++) {
                    const currentKey = `row${rowIndex}-col${colIndex}`;
                    const newKey = `row${rowIndex + 1}-col${colIndex}`;
                    newRowData[newKey] = newRowData[currentKey] || '';
                }
            }

            // Clear the new row's data
            for (let colIndex = 0; colIndex < columns; colIndex++) {
                const key = `row${selectedRowIndex + 1}-col${colIndex}`;
                newRowData[key] = '';
            }

            setRowData(newRowData);

            // Update payload
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    rows: currentRows + 1,
                    rowData: newRowData
                }
            }));

            setShowAlert(true);
        }

        const handleRemoveRow = () => {
            if (selectedRowKeys.length === 0) return;

            const newRowData = previewData.filter(row => !selectedRowKeys.includes(row.key));

            // If trying to remove all rows, keep at least one row
            const finalRowData = newRowData.length > 0 ? newRowData : [previewData[0]];

            // Reindex keys to ensure they are sequential
            const reindexedRowData = finalRowData.map((row, index) => ({
                ...row,
                key: String(index + 1)
            }));

            setPayloadData(prev => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    rows: reindexedRowData.length,
                    rowData: reindexedRowData
                }
            }));

            // Reset selection after remove
            setSelectedRowKeys([]);
        };

        return (
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: '99%',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 8
                }}>
                    <Space>
                        <Button size="small" onClick={handleInsertAppend}>Insert</Button>
                        <Button
                            size="small"
                            onClick={handleInsertBefore}
                            disabled={selectedRowKeys.length === 0}
                        >
                            Insert Before
                        </Button>
                        <Button
                            size="small"
                            onClick={handleInsertAfter}
                            disabled={selectedRowKeys.length === 0}
                        >
                            Insert After
                        </Button>
                        <Button
                            size="small"
                            onClick={handleRemoveRow}
                            disabled={selectedRowKeys.length === 0}
                        >
                            Remove Selected
                        </Button>
                        <Button
                            size="small"
                            onClick={() => {
                                // Remove all rows except the first one
                                const newRowData = [previewData[0]];
                                setPayloadData(prev => ({
                                    ...prev,
                                    tableConfig: {
                                        ...prev.tableConfig,
                                        rows: 1,
                                        rowData: newRowData
                                    }
                                }));
                                setSelectedRowKeys([]);
                            }}
                        >
                            Remove All
                        </Button>
                    </Space>
                </div>
                <Table
                    rowSelection={rowSelection}
                    title={() => 'Table Preview'}
                    columns={columns}
                    dataSource={previewData}
                    pagination={false}
                    bordered
                    size="small"
                    scroll={{ x: 'max-content', y: 'calc(100vh - 450px)' }}
                    style={{ width: '99%',
                     }}
                />
            </div>
        );
    }

    const renderReferenceTablePreview = () => {
        if (!payloadData?.tableConfig) return null;

        const items: MenuProps['items'] = [
            {
                key: 'Integer',
                label: 'Integer',
            },
            {
                key: 'Decimal',
                label: 'Decimal',
            },
            {
                key: 'Text',
                label: 'Text',
            },
            {
                key: 'TextArea',
                label: 'TextArea',
            },
            {
                key: 'Datepicker',
                label: 'Datepicker',
            },
            {
                key: 'DateTimePicker',
                label: 'DateTimePicker',
            },
            // {
            //   key: 'Select',
            //   label: 'Select',
            // },
            {
                key: 'Switch',
                label: 'Switch',
            },
        ];
    
        const columns = Array.from({ length: Number(payloadData?.tableConfig?.columns) || 0 }).map((_, index) => ({
            title: (
                <div style={{ display: 'flex' }}>
                     {columnNames[index]?.required && (
                                    <span style={{ color: 'red', marginRight: '5px' }}>*</span>
                                )}
                    <Input
                        value={columnNames[index]?.title || ''}
                        onChange={(e) => handleColumnNameChange(index, e.target.value)}
                        placeholder={`Column ${index + 1}`}
                        style={{ width: '100%' }}
                        
                        suffix={
                            <>
                               
                                <Checkbox
                                    checked={columnNames[index]?.required || false}
                                    onChange={(e) => {
                                        const updatedColumnNames = [...columnNames];
                                        updatedColumnNames[index] = {
                                            ...updatedColumnNames[index],
                                            required: e.target.checked
                                        };
                                        setColumnNames(updatedColumnNames);

                                        // Update payload with the new column required status
                                        const updatedPayloadData = {
                                            ...payloadData,
                                            tableConfig: {
                                                ...payloadData?.tableConfig,
                                                columnNames: updatedColumnNames
                                            }
                                        };
                                        setPayloadData(updatedPayloadData);
                                    }}
                                />
                            </>
                        }
                    />
                    <Dropdown

                        menu={{
                            items,
                            selectable: true,
                            defaultSelectedKeys: ['Input'],
                            onSelect: (info) => {
                                // Update column type when selected
                                const updatedColumnNames = [...columnNames];
                                updatedColumnNames[index] = {
                                    title: updatedColumnNames?.[index]?.title || '',
                                    type: info.key as string,
                                    required: updatedColumnNames?.[index]?.required || false
                                };
                                setColumnNames(updatedColumnNames);

                                // Update payload with the new column type
                                const updatedPayloadData = {
                                    ...payloadData,
                                    tableConfig: {
                                        ...payloadData?.tableConfig,
                                        columnNames: updatedColumnNames
                                    }
                                };
                                setPayloadData(updatedPayloadData);
                            }
                        }}
                    >
                        <Typography.Link style={{
                            marginLeft: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Space align="center">
                                {/* {columnNames[index]?.type || 'Input'} */}
                                <DownOutlined style={{ verticalAlign: 'middle' }} />
                            </Space>
                        </Typography.Link>
                    </Dropdown>
                </div>
            ),
            dataIndex: `col${index}`,
            key: `col${index}`,
            width: 300,
            render: (_: any, record: any) => {
                const columnType = columnNames[index]?.type || 'Input';

                switch (columnType) {
                    case 'TextArea':
                        return (
                            <Input.TextArea
                                value={rowData[`row${record.key}-col${index}`] || ''}
                                onChange={(e) => handleRowDataChange(`row${record.key}-col${index}`, index, e.target.value)}
                                style={{ width: '100%' }}
                            />
                        );
                    case 'Datepicker':
                        return (
                            <DatePicker
                                value={rowData[`row${record.key}-col${index}`]
                                    ? dayjs(rowData[`row${record.key}-col${index}`])
                                    : null}
                                onChange={(date) => handleRowDataChange(
                                    `row${record.key}-col${index}`,
                                    index,
                                    date ? date.format('YYYY-MM-DD') : ''
                                )}
                                style={{ width: '100%' }}
                            />
                        );
                    case 'DateTimePicker':
                        return (
                            <DatePicker
                                showTime
                                value={rowData[`row${record.key}-col${index}`]
                                    ? dayjs(rowData[`row${record.key}-col${index}`])
                                    : null}
                                onChange={(date) => handleRowDataChange(
                                    `row${record.key}-col${index}`,
                                    index,
                                    date ? date.format('YYYY-MM-DD HH:mm:ss') : ''
                                )}
                                style={{ width: '100%' }}
                                placeholder='Select date time'
                            />
                        );
                    // case 'Select':
                    //     return (
                    //         <Select
                    //             value={rowData[`row${record.key}-col${index}`] || undefined}
                    //             onChange={(value) => handleRowDataChange(`row${record.key}-col${index}`, index, value)}
                    //             style={{ width: '100%' }}
                    //         >
                    //             {/* Add options as needed */}
                    //             <Select.Option value="option1">Option 1</Select.Option>
                    //             <Select.Option value="option2">Option 2</Select.Option>
                    //         </Select>
                    //     );
                    case 'Switch':
                        return (
                            <Switch
                                checked={rowData[`row${record.key}-col${index}`] === 'true'}
                                onChange={(checked) => handleRowDataChange(`row${record.key}-col${index}`, index, String(checked))}
                            />
                        );
                    default:
                        return (
                            <Input
                                value={rowData[`row${record.key}-col${index}`] || ''}
                                onChange={(e) => handleRowDataChange(`row${record.key}-col${index}`, index, e.target.value)}
                                style={{ width: '100%' }}
                                placeholder={'Enter ' + columnType}
                            />
                        );
                }
            }
        }));
    
        const previewData = Array.from({ 
            length: Number(payloadData?.tableConfig?.rows) || 0 
        }).map((_, rowIndex) => ({
            key: String(rowIndex + 1),
            ...Object.fromEntries(Array.from({ length: Number(payloadData?.tableConfig?.columns) || 0 }).map((_, colIndex) =>
                [`col${colIndex}`, '']
            ))
        }));
    
        // If no rows exist, return an empty array instead of creating a default row
        const finalPreviewData = previewData.length > 0 ? previewData : [];
    
        const rowSelection = {
            selectedRowKeys,
            onChange: (newSelectedRowKeys: React.Key[]) => {
                setSelectedRowKeys(newSelectedRowKeys);
            },
            type: 'checkbox' as const
        };
    
        // Modify handleInsertAppend to explicitly add a row
        const handleInsertAppend = () => {
            const columns = Number(payloadData?.tableConfig?.columns || 0);
            const currentRows = Number(payloadData?.tableConfig?.rows || 0);
            const newRowIndex = currentRows + 1;
    
            // Create new row data
            const newRowData = { ...rowData };
            for (let colIndex = 0; colIndex < columns; colIndex++) {
                const key = `row${newRowIndex}-col${colIndex}`;
                newRowData[key] = '';
            }
    
            setRowData(newRowData);
    
            // Update payload
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    rows: newRowIndex,
                    rowData: newRowData
                }
            }));
    
            setShowAlert(true);
        };

        const handleInsertBefore = () => {
            if (selectedRowKeys.length === 0) {
                handleInsertAppend(); // If no row selected, just add at the end
                return;
            }

            const selectedRowIndex = Number(selectedRowKeys[0]);
            const columns = Number(payloadData?.tableConfig?.columns || 0);
            const currentRows = Number(payloadData?.tableConfig?.rows || 0);

            const newRowData = { ...rowData };

            // Shift existing rows down
            for (let rowIndex = currentRows; rowIndex >= selectedRowIndex; rowIndex--) {
                for (let colIndex = 0; colIndex < columns; colIndex++) {
                    const currentKey = `row${rowIndex}-col${colIndex}`;
                    const newKey = `row${rowIndex + 1}-col${colIndex}`;
                    newRowData[newKey] = newRowData[currentKey] || '';
                }
            }

            // Clear the selected row's data
            for (let colIndex = 0; colIndex < columns; colIndex++) {
                const key = `row${selectedRowIndex}-col${colIndex}`;
                newRowData[key] = '';
            }

            setRowData(newRowData);

            // Update payload
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    rows: currentRows + 1,
                    rowData: newRowData
                }
            }));

            setShowAlert(true);
        }

        const handleInsertAfter = () => {
            if (selectedRowKeys.length === 0) {
                handleInsertAppend(); // If no row selected, just add at the end
                return;
            }

            const selectedRowIndex = Number(selectedRowKeys[0]);
            const columns = Number(payloadData?.tableConfig?.columns || 0);
            const currentRows = Number(payloadData?.tableConfig?.rows || 0);

            const newRowData = { ...rowData };

            // Shift existing rows down
            for (let rowIndex = currentRows; rowIndex > selectedRowIndex; rowIndex--) {
                for (let colIndex = 0; colIndex < columns; colIndex++) {
                    const currentKey = `row${rowIndex}-col${colIndex}`;
                    const newKey = `row${rowIndex + 1}-col${colIndex}`;
                    newRowData[newKey] = newRowData[currentKey] || '';
                }
            }

            // Clear the new row's data
            for (let colIndex = 0; colIndex < columns; colIndex++) {
                const key = `row${selectedRowIndex + 1}-col${colIndex}`;
                newRowData[key] = '';
            }

            setRowData(newRowData);

            // Update payload
            setPayloadData((prev) => ({
                ...prev,
                tableConfig: {
                    ...prev.tableConfig,
                    rows: currentRows + 1,
                    rowData: newRowData
                }
            }));

            setShowAlert(true);
        }

        const handleRemoveRow = () => {
            if (selectedRowKeys.length === 0) return;
        
            // If removing all rows, set rows to 0 and clear rowData
            if (selectedRowKeys.length === previewData.length) {
                setPayloadData(prev => ({
                    ...prev,
                    tableConfig: {
                        ...prev.tableConfig,
                        rows: 0,
                        rowData: {}
                    }
                }));
        
                // Clear row data state
                setRowData({});
            } else {
                // For partial row removal
                const newRowData = previewData.filter(row => !selectedRowKeys.includes(row.key));
        
                // Reindex keys to ensure they are sequential
                const reindexedRowData = newRowData.map((row, index) => ({
                    ...row,
                    key: String(index + 1)
                }));
        
                setPayloadData(prev => ({
                    ...prev,
                    tableConfig: {
                        ...prev.tableConfig,
                        rows: reindexedRowData.length,
                        rowData: reindexedRowData
                    }
                }));
            }
        
            // Reset selection after remove
            setSelectedRowKeys([]);
        };
    
        return (
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: '99%',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 8
                }}>
                    <Space>
                        <Button size="small" onClick={handleInsertAppend}>Insert</Button>
                        <Button
                            size="small"
                            onClick={handleInsertBefore}
                            disabled={selectedRowKeys.length === 0}
                        >
                            Insert Before
                        </Button>
                        <Button
                            size="small"
                            onClick={handleInsertAfter}
                            disabled={selectedRowKeys.length === 0}
                        >
                            Insert After
                        </Button>
                        <Button
                            size="small"
                            onClick={handleRemoveRow}
                            disabled={selectedRowKeys.length === 0}
                        >
                            Remove Selected
                        </Button>
                        <Button
                            size="small"
                            onClick={() => {
                                // Remove all rows except the first one
                                const newRowData = [previewData[0]];
                                setPayloadData(prev => ({
                                    ...prev,
                                    tableConfig: {
                                        ...prev.tableConfig,
                                        rows: 0,
                                        rowData: {}
                                    }
                                }));
                                setSelectedRowKeys([]);
                            }}
                        >
                            Remove All
                        </Button>
                    </Space>
                </div>
                <Table
                    rowSelection={rowSelection}
                    title={() => 'Table Preview'}
                    columns={columns}
                    dataSource={finalPreviewData}
                    pagination={false}
                    bordered
                    size="small"
                    scroll={{ x: '1000', y: 'calc(100vh - 450px)' }}
                    style={{ width: '99%', tableLayout: 'fixed' }}
                />
            </div>
        );
    }

    const renderTableConfigFields = () => {
        return (
            <Row gutter={16}>


                {payloadData?.dataType === "Table" && (
                    <>
                        {/* <Col span={8}>
                            <Form.Item
                                label={t('noOfRows')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ marginBottom: '8px' }}
                            >
                                <Input
                                    type="number"
                                    value={payloadData?.tableConfig?.rows}
                                    onChange={(e) => handleReferenceTableConfigChange("rows", e.target.value)}
                                    min={1}
                                />
                            </Form.Item>
                        </Col> */}
                        <Col span={8}>
                            <Form.Item
                                label={t('noOfColumns')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                                style={{ marginBottom: '8px' }}
                                required
                            >
                                <Input
                                    type="number"
                                    value={payloadData?.tableConfig?.columns}
                                    onChange={(e) => handleReferenceTableConfigChange("columns", e.target.value)}
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                    </>
                )}
            </Row>
        );
    };

    const renderFormFields = () => {
        // For Table  use two-column layout
        if (payloadData?.dataType === "Table") {
            return (
                <div 
                style={{marginTop: '-1%',}}
                >
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label={t('componentLabel')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                                required={true}
                                style={{ marginBottom: '8px' }}
                            >
                                <Input
                                    value={payloadData?.componentLabel}
                                    onChange={(e) => handleInputChange("componentLabel", e.target.value)}
                                />
                            </Form.Item>

                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={t('unit')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                                style={{ marginBottom: '8px' }}
                            >
                                <Select
                                    value={payloadData?.unit}
                                    onChange={(value) => handleInputChange("unit", value)}
                                    disabled={disableUnitField}
                                >
                                    <Option value="kg">kg</Option>
                                    <Option value="g">g</Option>
                                    <Option value="m">m</Option>
                                    <Option value="cm">cm</Option>
                                    <Option value="mm">mm</Option>
                                    <Option value="%">%</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={t('dataType')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                                required={true}
                                style={{ marginBottom: '8px' }}
                            >
                                <Select
                                    value={payloadData?.dataType}
                                    defaultValue={payloadData?.dataType}
                                    onChange={(value) => handleSelectChange("dataType", value)}
                                >
                                    <Option value="Input">Input</Option>
                                    <Option value="TextArea">TextArea</Option>
                                    <Option value="Select">Select</Option>
                                    <Option value="DatePicker">DatePicker</Option>
                                    <Option value="Integer">Integer</Option>
                                    <Option value="Decimal">Decimal</Option>
                                    {/* <Option value="Checkbox">Checkbox</Option> */}
                                    <Option value="Switch">Switch</Option>
                                    <Option value="Table">Table</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label={t('defaultValue')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                                required={isRequired}
                                style={{ marginBottom: '8px' }}
                            >
                                <Input
                                    value={payloadData?.defaultValue}
                                    onChange={(e) => handleInputChange("defaultValue", e.target.value)}
                                />
                            </Form.Item>

                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={t('validation')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                                style={{ marginBottom: '8px' }}
                            >
                                <Input.TextArea
                                    value={payloadData?.validation}
                                    onChange={(e) => handleInputChange("validation", e.target.value)}
                                    rows={1}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={t('required')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 14 }}
                                style={{ marginBottom: '8px' }}
                            >
                                <Switch
                                    checked={payloadData?.required}
                                    onChange={(checked) => handleSwitchChange("required", checked)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            );
        }

        // For other data types, use single-column layout
        return (
            <>
                <Form.Item
                    label={t('componentLabel')}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 10 }}
                    required={true}
                    style={{ marginBottom: '8px' }}
                >
                    <Input
                        value={payloadData?.componentLabel}
                        onChange={(e) => handleInputChange("componentLabel", e.target.value)}
                    />
                </Form.Item>
                <Form.Item
                    label={t('dataType')}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 10 }}
                    required={true}
                    style={{ marginBottom: '8px' }}
                >
                    <Select
                        value={payloadData?.dataType}
                        defaultValue={payloadData?.dataType}
                        onChange={(value) => handleSelectChange("dataType", value)}
                    >
                        <Option value="Input">Input</Option>
                        <Option value="TextArea">TextArea</Option>
                        <Option value="Select">Select</Option>
                        <Option value="DatePicker">DatePicker</Option>
                        <Option value="Integer">Integer</Option>
                        <Option value="Decimal">Decimal</Option>
                        {/* <Option value="Checkbox">Checkbox</Option> */}
                        <Option value="Switch">Switch</Option>
                        <Option value="Table">Table</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label={t('unit')}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 10 }}
                    style={{ marginBottom: '8px' }}
                >
                    <Select
                        value={payloadData?.unit}
                        onChange={(value) => handleInputChange("unit", value)}
                        disabled={disableUnitField}
                    >
                        <Option value="kg">kg</Option>
                        <Option value="g">g</Option>
                        <Option value="m">m</Option>
                        <Option value="cm">cm</Option>
                        <Option value="mm">mm</Option>
                        <Option value="%">%</Option>
                    </Select>
                </Form.Item>

                {payloadData?.dataType == "Select" && (
                    <Form.Item
                        label={t('apiUrl')}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 10 }}
                        style={{ marginBottom: '8px' }}
                    >
                        <Input
                            value={payloadData?.apiUrl}
                            onChange={(e) => handleInputChange("apiUrl", e.target.value)}
                        />
                    </Form.Item>
                )}

                <Form.Item
                    label={t('defaultValue')}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 10 }}
                    required={isRequired}
                    style={{ marginBottom: '8px' }}
                >
                    <Input
                        value={payloadData?.defaultValue}
                        onChange={(e) => handleInputChange("defaultValue", e.target.value)}
                    />
                </Form.Item>
                <Form.Item
                    label={t('required')}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 10 }}
                    style={{ marginBottom: '8px' }}
                >
                    <Switch
                        checked={payloadData?.required}
                        onChange={(checked) => handleSwitchChange("required", checked)}
                    />
                </Form.Item>
                <Form.Item
                    label={t('validation')}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 10 }}
                    style={{ marginBottom: '8px' }}
                >
                    <Input.TextArea
                        value={payloadData?.validation}
                        onChange={(e) => handleInputChange("validation", e.target.value)}
                    />
                </Form.Item>
            </>
        );
    };

    return (
        <Form
            form={form}
            style={{ marginTop: 30 }}
        >
            {renderFormFields()}

            {(payloadData?.dataType === "Table") && (
                <>
                    {renderTableConfigFields()}

                    <Divider />

                    {/* {payloadData?.dataType === "Table" && renderTablePreview()} */}

                    {payloadData?.dataType === "Table" && renderReferenceTablePreview()}
                </>
            )}
        </Form>
    );
};

export default ComponentBuilderForm;