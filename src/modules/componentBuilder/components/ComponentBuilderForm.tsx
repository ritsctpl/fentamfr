import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Switch, Table, Row, Col, Divider } from 'antd';
import { useMyContext } from '../hooks/componentBuilderContext';
import { useTranslation } from 'react-i18next';
const { Option } = Select;

const ComponentBuilderForm: React.FC<{ setFullScreen: (value: boolean) => void }> = ({ setFullScreen }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const { payloadData, setPayloadData, showAlert, setShowAlert, isRequired, setIsRequired,
        fieldType, seeFullScreen, setSeeFullScreen
    } = useMyContext();

    // Add state for column and row configurations
    const [columnNames, setColumnNames] = useState<string[]>([]);
    const [rowData, setRowData] = useState<{ [key: string]: string }>({});

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
            setColumnNames(payloadData?.tableConfig?.columnNames || Array(tableColumns).fill(''));
        } else if (payloadData?.dataType === 'Reference Table') {
            const refTableColumns = Number(payloadData?.referenceTableConfig?.columns || 0);
            setColumnNames(payloadData?.referenceTableConfig?.columnNames || Array(refTableColumns).fill(''));
            setRowData(payloadData?.referenceTableConfig?.rowData || {});
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
        if (value == 'Input' || value == "TextArea" || value == "DatePicker" || value == "Select" || value == "Table" || value == "Reference Table") {
            setPayloadData((prev) => ({
                ...prev,
                defaultValue: null,
                referenceTableConfig: fieldName != "Reference Table" ? {

                } : value,
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

        if (value == "Table" || value == "Reference Table")
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

    const handleTableConfigChange = (field: string, value: any) => {
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
        
        setShowAlert(true);
    }

    const handleColumnNameChange = (index: number, value: string) => {
        const newColumnNames = [...columnNames];
        newColumnNames[index] = value;
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
        } else if (payloadData?.dataType === 'Reference Table') {
            setPayloadData((prev) => ({
                ...prev,
                referenceTableConfig: {
                    ...prev.referenceTableConfig,
                    columnNames: newColumnNames
                }
            }));
        }
        
        setShowAlert(true);
    }

    const handleReferenceTableConfigChange = (field: string, value: any) => {
        setPayloadData((prev) => ({
            ...prev,
            referenceTableConfig: {
                ...prev.referenceTableConfig,
                [field]: value
            }
        }));
        
        // Update column names when number of columns changes
        if (field === 'columns') {
            const newColumnNames = Array(Number(value)).fill('');
            setColumnNames(newColumnNames);
            
            setPayloadData((prev) => ({
                ...prev,
                referenceTableConfig: {
                    ...prev.referenceTableConfig,
                    columnNames: newColumnNames
                }
            }));
        }
        
        // Update row data when rows change
        if (field === 'rows') {
            const newRowData: { [key: string]: string } = {};
            const columns = Number(payloadData?.referenceTableConfig?.columns || 0);
            
            for (let rowIndex = 0; rowIndex < Number(value); rowIndex++) {
                for (let colIndex = 0; colIndex < columns; colIndex++) {
                    const key = `row${rowIndex + 1}-col${colIndex}`;
                    newRowData[key] = rowData[key] || '';
                }
            }
            
            setRowData(newRowData);
            
            setPayloadData((prev) => ({
                ...prev,
                referenceTableConfig: {
                    ...prev.referenceTableConfig,
                    rowData: newRowData
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
        
        if (payloadData?.dataType === 'Reference Table') {
            setPayloadData((prev) => ({
                ...prev,
                referenceTableConfig: {
                    ...prev.referenceTableConfig,
                    rowData: newRowData
                }
            }));
        }
        
        setShowAlert(true);
    }

    const renderTablePreview = () => {
        if (!payloadData?.tableConfig) return null;

        const columns = Array.from({ length: payloadData?.tableConfig?.columns || 0 }).map((_, index) => ({
            title: (
                <Input
                    value={columnNames[index] || ''}
                    onChange={(e) => handleColumnNameChange(index, e.target.value)}
                    placeholder={`Column ${index + 1}`}
                    style={{ width: '100%' }}
                />
            ),
            dataIndex: `col${index}`,
            key: `col${index}`,
            width: 200,
        }));

        const previewData1 = [{
            key: '1',
            ...Object.fromEntries(Array.from({ length: Number(payloadData?.tableConfig?.columns) || 0 }).map((_, i) => [`col${i}`, '']))
        }];

        const previewData: any[] = [];

        return (
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center',    }}>
                <Table
                    columns={columns}
                    dataSource={previewData}
                    pagination={false}
                    bordered
                    size="small"
                    scroll={{ x: true,   }}
                    style={{width: '99%', height: '100%'}}
                    // locale={{ emptyText: 'No data' }}
                />
            </div>
        );
    }

    const renderReferenceTablePreview = () => {
        if (!payloadData?.referenceTableConfig) return null;

        const columns = Array.from({ length: Number(payloadData?.referenceTableConfig?.columns) || 0 }).map((_, index) => ({
            title: (
                <Input
                    value={columnNames[index] || ''}
                    onChange={(e) => handleColumnNameChange(index, e.target.value)}
                    placeholder={`Column ${index + 1}`}
                    style={{ width: '100%' }}
                />
            ),
            dataIndex: `col${index}`,
            key: `col${index}`,
            width: 200,
            render: (_: any, record: any) => (
                <Input
                    value={rowData[`row${record.key}-col${index}`] || ''}
                    onChange={(e) => handleRowDataChange(`row${record.key}-col${index}`, index, e.target.value)}
                    style={{ width: '100%' }}
                />
            )
        }));

        const previewData = Array.from({ length: Number(payloadData?.referenceTableConfig?.rows) || 1 }).map((_, rowIndex) => ({
            key: String(rowIndex + 1),
            ...Object.fromEntries(Array.from({ length: Number(payloadData?.referenceTableConfig?.columns) || 0 }).map((_, colIndex) => 
                [`col${colIndex}`, '']
            ))
        }));

        return (
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> */}
                    {/* <h4>Preview</h4> */}
                    <Table
                        columns={columns}
                        dataSource={previewData}
                        pagination={false}
                        bordered
                        size="small"
                        scroll={{ x: true, y: 'calc(100vh - 450px)' }}
                        style={{width: '99%'}}
                    />
                {/* </div> */}
            </div>
        );
    }

    const renderTableConfigFields = () => {
        return (
            <Row gutter={16}>
                {payloadData?.dataType === "Table" && (
                    <Col span={8}>
                        <Form.Item
                            label={t('noOfColumns')}
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 12 }}
                            style={{ marginBottom: '8px' }}
                        >
                            <Input
                                type="number"
                                value={payloadData?.tableConfig?.columns}
                                onChange={(e) => handleTableConfigChange("columns", e.target.value)}
                                min={1}
                            />
                        </Form.Item>
                    </Col>
                )}

                {payloadData?.dataType === "Reference Table" && (
                    <>
                        <Col span={8}>
                            <Form.Item
                                label={t('noOfRows')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ marginBottom: '8px' }}
                            >
                                <Input
                                    type="number"
                                    value={payloadData?.referenceTableConfig?.rows}
                                    onChange={(e) => handleReferenceTableConfigChange("rows", e.target.value)}
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={t('noOfColumns')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ marginBottom: '8px' }}
                            >
                                <Input
                                    type="number"
                                    value={payloadData?.referenceTableConfig?.columns}
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
        if (payloadData?.dataType === "Table" || payloadData?.dataType === "Reference Table") {
            return (
                <>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label={t('componentLabel')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
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
                                wrapperCol={{ span: 12 }}
                                style={{ marginBottom: '8px' }}
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
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
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
                                    <Option value="Checkbox">Checkbox</Option>
                                    <Option value="Switch">Switch</Option>
                                    <Option value="Table">Table</Option>
                                    <Option value="Reference Table">Reference Table</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label={t('defaultValue')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
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
                                wrapperCol={{ span: 12 }}
                                style={{ marginBottom: '8px' }}
                            >
                                <Input.TextArea
                                    value={payloadData?.validation}
                                    onChange={(e) => handleInputChange("validation", e.target.value)}
                                    rows={2}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                        <Form.Item
                                label={t('required')}
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 12 }}
                                style={{ marginBottom: '8px' }}
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
                        <Option value="Checkbox">Checkbox</Option>
                        <Option value="Switch">Switch</Option>
                        <Option value="Table">Table</Option>
                        <Option value="Reference Table">Reference Table</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label={t('unit')}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 10 }}
                    style={{ marginBottom: '8px' }}
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
            style={{marginTop: 30}}
        >
            {renderFormFields()}
            
            {(payloadData?.dataType === "Table" || payloadData?.dataType === "Reference Table") && (
                <>
                    {renderTableConfigFields()}

                    <Divider />

                    {payloadData?.dataType === "Table" && renderTablePreview()}
                    
                    {payloadData?.dataType === "Reference Table" && renderReferenceTablePreview()}
                </>
            )}
        </Form>
    );
};

export default ComponentBuilderForm;