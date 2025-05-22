import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Switch, Table, Row, Col, Divider, Dropdown, Typography, Space, DatePicker } from 'antd';
import { useMyContext } from '../hooks/componentBuilderContext';
import { useTranslation } from 'react-i18next';
import { MenuProps, } from 'antd/lib';
import { DownOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ColumnType } from 'antd/lib/table';
const { Option } = Select;



const ComponentBuilderForm: React.FC<{ setFullScreen: (value: boolean) => void, }> = ({ setFullScreen, }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { payloadData, setPayloadData, showAlert, setShowAlert, isRequired, setIsRequired,
        fieldType, seeFullScreen, setSeeFullScreen, transformedRowData, setTransformedRowData, triggerSave
    } = useMyContext();

    // Add state for column and row configurations
    const [columnNames, setColumnNames] = useState<any>([]);
    const [rowData, setRowData] = useState<{ [key: string]: string }>({});

    // Add a new state to track the transformed row data

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
            const tableColumns = Number(payloadData?.tableConfig?.columns || 0);
            setColumnNames(
                payloadData?.tableConfig?.columnNames?.map(title => title) ||
                Array(tableColumns).fill('')
            );

            // Initialize first row when columns are set
            if (tableColumns > 0 && (!payloadData?.tableConfig?.rows || payloadData?.tableConfig?.rows === 0)) {
                const initialRowData: { [key: string]: string } = {};
                for (let colIndex = 0; colIndex < tableColumns; colIndex++) {
                    const key = `row1-col${colIndex}`;
                    initialRowData[key] = '';
                }

                setRowData(initialRowData);

                setPayloadData((prev) => ({
                    ...prev,
                    tableConfig: {
                        ...prev.tableConfig,
                        rows: 1,
                        rowData: initialRowData
                    }
                }));
            }
        } else if (payloadData?.dataType === 'Table') {
            const refTableColumns = Number(payloadData?.tableConfig?.columns || 0);
            setColumnNames(
                payloadData?.tableConfig?.columnNames?.map(title => title) ||
                Array(refTableColumns).fill('')
            );

            // Initialize first row when columns are set
            if (refTableColumns > 0 && (!payloadData?.tableConfig?.rows || payloadData?.tableConfig?.rows === 0)) {
                const initialRowData: { [key: string]: string } = {};
                for (let colIndex = 0; colIndex < refTableColumns; colIndex++) {
                    const key = `row1-col${colIndex}`;
                    initialRowData[key] = '';
                }

                setRowData(initialRowData);

                setPayloadData((prev) => ({
                    ...prev,
                    tableConfig: {
                        ...prev.tableConfig,
                        rows: 1,
                        rowData: initialRowData
                    }
                }));
            }
        }
    }, [payloadData]);

    useEffect(() => {
        handleTransformRowData();
    }, [triggerSave]);

    // Add state for selected row
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const handleRowDataChange = (rowKey: string, columnIndex: number, value: string) => {
        const columns = Number(payloadData?.tableConfig?.columns || 0);
        const [, rowIndex] = rowKey.match(/row(\d+)-col/) || [];

        if (!rowIndex) return;

        const newRowData = { ...rowData };
        newRowData[rowKey] = value;

        setRowData(newRowData);

        // Transform row data immediately
        const transformed = Array.from({ length: Number(payloadData?.tableConfig?.rows) || 0 }).map((_, rowIdx) => {
            const rowObj: { [key: string]: string } = { key: String(rowIdx + 1) };

            columnNames.forEach((column, colIdx) => {
                const key = `row${rowIdx + 1}-col${colIdx}`;

                // Prioritize existing data from payload
                if (payloadData?.tableConfig?.rowData &&
                    payloadData.tableConfig.rowData[rowIdx] &&
                    payloadData.tableConfig.rowData[rowIdx][column.dataIndex] !== undefined) {
                    rowObj[column.dataIndex] = payloadData.tableConfig.rowData[rowIdx][column.dataIndex];
                }

                // Override with new input if available
                const inputKey = `row${rowIdx + 1}-col${colIdx}`;
                if (newRowData[inputKey] !== undefined) {
                    rowObj[column.dataIndex] = newRowData[inputKey];
                }
            });

            return rowObj;
        });

        // Update payload with transformed data
        setPayloadData((prev) => ({
            ...prev,
            tableConfig: {
                ...prev.tableConfig,
                rowData: transformed
            }
        }));

        setShowAlert(true);
    };

    // New methods for row manipulation
    const handleInsertRow = () => {
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
    }

    const handleInsertBefore = () => {
        if (selectedRowKeys.length === 0) {
            handleInsertRow(); // If no row selected, just add at the end
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
            handleInsertRow(); // If no row selected, just add at the end
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

    const handleRemoveSelected = () => {
        if (selectedRowKeys.length === 0) return;

        const columns = Number(payloadData?.tableConfig?.columns || 0);
        const currentRows = Number(payloadData?.tableConfig?.rows || 0);

        const newRowData = { ...rowData };

        // Remove selected rows and shift remaining rows up
        const selectedRowIndex = Number(selectedRowKeys[0]);
        for (let rowIndex = selectedRowIndex; rowIndex < currentRows; rowIndex++) {
            for (let colIndex = 0; colIndex < columns; colIndex++) {
                const currentKey = `row${rowIndex + 1}-col${colIndex}`;
                const newKey = `row${rowIndex}-col${colIndex}`;
                newRowData[newKey] = newRowData[currentKey] || '';
                delete newRowData[currentKey];
            }
        }

        setRowData(newRowData);
        setSelectedRowKeys([]); // Clear selection

        // Update payload
        setPayloadData((prev) => ({
            ...prev,
            tableConfig: {
                ...prev.tableConfig,
                rows: currentRows - 1,
                rowData: newRowData
            }
        }));

        setShowAlert(true);
    }

    const handleRemoveAll = () => {
        setRowData({});
        setSelectedRowKeys([]);

        // Update payload
        setPayloadData((prev) => ({
            ...prev,
            tableConfig: {
                ...prev.tableConfig,
                rows: 0,
                rowData: {}
            }
        }));

        setShowAlert(true);
    }

    // New method to transform row data
    const handleTransformRowData = () => {
        // Ensure we have column names and rows
        if (!columnNames || columnNames.length === 0) return;

        const columns = Number(payloadData?.tableConfig?.columns || 0);
        const rows = Number(payloadData?.tableConfig?.rows || 0);

        // Transform row data based on column names and row data
        const transformed = Array.from({ length: rows }).map((_, rowIndex) => {
            const rowObj: { [key: string]: string } = {};

            columnNames.forEach((column, colIndex) => {
                const key = `row${rowIndex + 1}-col${colIndex}`;

                // Prioritize existing data from payload
                if (payloadData?.tableConfig?.rowData &&
                    payloadData.tableConfig.rowData[rowIndex] &&
                    payloadData.tableConfig.rowData[rowIndex][column.dataIndex] !== undefined) {
                    rowObj[column.dataIndex] = payloadData.tableConfig.rowData[rowIndex][column.dataIndex];
                }

                // Override with new input if available
                if (rowData[key] !== undefined) {
                    rowObj[column.dataIndex] = rowData[key];
                }
            });

            return rowObj;
        });

        // Update the local state
        setTransformedRowData(transformed);

        // Update the payload data
        setPayloadData((prev) => ({
            ...prev,
            tableConfig: {
                ...prev.tableConfig,
                rowData: transformed
            }
        }));

        // Optional: Show an alert or notification
        setShowAlert(true);
    };

    const handleInputChange = (fieldName: string, value: string) => {
        if (fieldName == 'minValue' || fieldName == 'maxValue') {
            value = value.replace(/ /g, '').replace(/[^0-9]/g, '');
        }

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

        if (value == "Table" || value == "Table")
            setFullScreen(true);

        else
            setFullScreen(false);

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
            dataIndex: camelCaseKeyName
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
        } else if (payloadData?.dataType === 'Table') {
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

    const handleReferenceTableConfigChange = (field: string, value: any) => {
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



    const renderReferenceTablePreview = () => {
        if (!payloadData?.tableConfig) return null;

        const items: MenuProps['items'] = [
            // ... existing column type items
        ];

        // Row selection configuration
        const rowSelection = {
            selectedRowKeys,
            onChange: (newSelectedRowKeys: React.Key[]) => {
                setSelectedRowKeys(newSelectedRowKeys);
            },
            type: 'checkbox' as const,
        };

        // Debug logging
        console.log('Column Names:', columnNames);
        console.log('Payload Row Data:', payloadData?.tableConfig?.rowData);

        const columns = columnNames.map((column, index) => ({
            title: (
                <div style={{ display: 'flex' }}>
                    <Input
                        value={column.title || ''}
                        onChange={(e) => handleColumnNameChange(index, e.target.value)}
                        placeholder={`Column ${index + 1}`}
                        style={{ width: '100%' }}
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
                                    ...updatedColumnNames[index],
                                    type: info.key as string
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
                                <DownOutlined style={{ verticalAlign: 'middle' }} />
                            </Space>
                        </Typography.Link>
                    </Dropdown>
                </div>
            ),
            dataIndex: column.dataIndex,
            key: column.dataIndex,
            width: 200,
            render: (value: any, record: any) => {
                const columnType = column.type || 'Input';

                switch (columnType) {
                    case 'TextArea':
                        return (
                            <Input.TextArea
                                value={record[column.dataIndex] || ''}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    handleRowDataChange(`row${record.key}-col${columnNames.findIndex(c => c.dataIndex === column.dataIndex)}`, columnNames.findIndex(c => c.dataIndex === column.dataIndex), newValue);
                                }}
                                style={{ width: '100%' }}
                            />
                        );
                    case 'Datepicker':
                        return (
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder={'Select Date'}
                            />
                        );
                    case 'DateTimePicker':
                        return (
                            <DatePicker
                                showTime
                                style={{ width: '100%' }}
                                placeholder='Select date time'
                            />
                        );
                    case 'Switch':
                        return (
                            <Switch />
                        );
                    default:
                        return (
                            <Input
                                value={record[column.dataIndex] || ''}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    handleRowDataChange(`row${record.key}-col${columnNames.findIndex(c => c.dataIndex === column.dataIndex)}`, columnNames.findIndex(c => c.dataIndex === column.dataIndex), newValue);
                                }}
                                style={{ width: '100%' }}
                                placeholder={'Enter ' + columnType}
                            />
                        );
                }
            }
        }));

        const previewData = Array.from({ length: Number(payloadData?.tableConfig?.rows) || 1 }).map((_, rowIndex) => {
            const rowObj: { [key: string]: string } = { key: String(rowIndex + 1) };

            columnNames.forEach(column => {
                // Prioritize existing row data from payload
                if (payloadData?.tableConfig?.rowData &&
                    payloadData.tableConfig.rowData[rowIndex] &&
                    payloadData.tableConfig.rowData[rowIndex][column.dataIndex] !== undefined) {
                    rowObj[column.dataIndex] = payloadData.tableConfig.rowData[rowIndex][column.dataIndex];
                } else {
                    // Default to empty string if no existing data
                    rowObj[column.dataIndex] = '';
                }
            });

            // Debug logging
            console.log(`Row ${rowIndex + 1} Object:`, rowObj);

            return rowObj;
        });

        // Debug logging
        console.log('Preview Data:', previewData);

        return (
            <div style={{ marginTop: 24 }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 16
                }}>
                    <Space>
                        <Button
                            onClick={handleInsertRow}
                        >
                            Insert
                        </Button>
                        <Button
                            onClick={handleInsertBefore}
                        >
                            Insert Before
                        </Button>
                        <Button
                            onClick={handleInsertAfter}
                        >
                            Insert After
                        </Button>
                        <Button
                            danger
                            onClick={handleRemoveSelected}
                        >
                            Remove Selected
                        </Button>
                        <Button
                            danger
                            onClick={handleRemoveAll}
                        >
                            Remove All
                        </Button>
                        <Button
                            onClick={handleTransformRowData}
                            type="primary"
                        >
                            Transform Row Data
                        </Button>
                    </Space>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Table
                        title={() => 'Table Preview'}
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={previewData}
                        pagination={false}
                        bordered
                        size="small"
                        scroll={{ x: 1000, y: 'calc(100vh - 450px)' }}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        );
    }

    const renderTableConfigFields = () => {
        return (
            <Row gutter={16}>

                {payloadData?.dataType === "Table" && (
                    <>

                        <Col span={8}>
                            <Form.Item
                                label={t('noOfColumns')}
                                labelCol={{ span: 10 }}
                                wrapperCol={{ span: 24 }}
                                 style={{ marginBottom: '16px' }}
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
        // For Table and Reference Table, use two-column layout
        if (payloadData?.dataType === "Table") {
            return (
                <>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label={t('componentLabel')}
                                labelCol={{ span: 10 }}
                                wrapperCol={{ span: 24 }}
                                required={true}
                                 style={{ marginBottom: '16px' }}
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
                                labelCol={{ span: 10 }}
                                wrapperCol={{ span: 24 }}
                                 style={{ marginBottom: '16px' }}
                            >
                                <Input
                                    value={payloadData?.unit}
                                    onChange={(e) => handleInputChange("unit", e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={t('dataType')}
                                labelCol={{ span: 10 }}
                                wrapperCol={{ span: 24 }}
                                required={true}
                                 style={{ marginBottom: '16px' }}
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
                                labelCol={{ span: 10 }}
                                wrapperCol={{ span: 24 }}
                                required={isRequired}
                                 style={{ marginBottom: '16px' }}
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
                                labelCol={{ span: 10 }}
                                wrapperCol={{ span: 24 }}
                                 style={{ marginBottom: '16px' }}
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
                                labelCol={{ span: 10 }}
                                wrapperCol={{ span: 24 }}
                                 style={{ marginBottom: '16px' }}
                            >
                                <Switch
                                    checked={payloadData?.required}
                                    onChange={(checked) => handleSwitchChange("required", checked)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
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
                     style={{ marginBottom: '16px' }}
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
                     style={{ marginBottom: '16px' }}
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
                     style={{ marginBottom: '16px' }}
                >
                    <Input
                        value={payloadData?.unit}
                        onChange={(e) => handleInputChange("unit", e.target.value)}
                    />
                </Form.Item>

                {payloadData?.dataType == "Select" && (
                    <Form.Item
                        label={t('apiUrl')}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 10 }}
                         style={{ marginBottom: '16px' }}
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
                     style={{ marginBottom: '16px' }}
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
                     style={{ marginBottom: '16px' }}
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
                     style={{ marginBottom: '16px' }}
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