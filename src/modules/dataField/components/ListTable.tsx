import React, { useContext, useState } from 'react';
import { Modal, Button, Table, Select, Input, Switch, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import styles from '../styles/DataFieldMaintenance.module.css';
import { DataFieldContext } from "../hooks/DataFieldContext";

const { Option } = Select;

interface DataField {
    id: string;
    // label: boolean;
    defaultLabel: boolean;
    sequence: string;
    fieldValue: string;
    labelValue: string;
    type: string;
    width: string;
    value: any[];
    api: string;
    parameters: string;
}

const ListTable: React.FC = () => {
    const { payloadData, setPayloadData, showAlert, setShowAlert, schemaData, showColumns } = useContext(DataFieldContext);
    const [listDetails, setListDetails] = useState(payloadData?.listDetails || []);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedField, setSelectedField] = useState<DataField | null>(null);
    const [modalValues, setModalValues] = useState<any[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [modalSelectedRowKeys, setModalSelectedRowKeys] = useState<React.Key[]>([]);
    console.log("Show Columns value: ", showColumns);
    const { t } = useTranslation();

    // Modal handling functions
    const showModal = (field: DataField) => {
        setSelectedField(field);
        setModalValues(Array.isArray(field.value) ? field.value : []);
        setIsModalVisible(true);
    };

    const handleOk = () => {
        if (selectedField) {
            // Check for empty, null, or undefined titles
            const hasInvalidTitle = modalValues.some(value =>
                value.title === '' || value.title === null || value.title === undefined
            );

            if (hasInvalidTitle) {
                message.error("Title Cannot be empty")
                return;
            }

            const updatedFields = listDetails.map(field =>
                field.id === selectedField.id ? { ...field, value: modalValues } : field
            );
            setListDetails(updatedFields);
            setPayloadData({ ...payloadData, listDetails: updatedFields });
        }
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        // Remove all newly added titles (those without an original id)
        if (selectedField) {
            const originalValues = selectedField.value || [];
            setModalValues(originalValues);
        }
        setIsModalVisible(false);
    };

    // CRUD functions for listDetails
    const addField = (field: DataField) => {
        debugger
        const newField = {
            ...field,
            type: 'Input',
            sequence: ((listDetails.length + 1) * 10).toString()
        };
        const updatedFields = renumberSequences([...listDetails, newField]);
        setListDetails(updatedFields);
        setPayloadData({ ...payloadData, listDetails: updatedFields });
    };

    const updateField = (id: string, key: keyof DataField, value: any) => {
        let updatedFields;
        if (key === 'defaultLabel') {
            updatedFields = listDetails.map(field =>
                field.id === id ? { ...field, [key]: value } : value ? { ...field, defaultLabel: false } : field
            );
        } else {
            updatedFields = listDetails.map(field =>
                field.id === id ? { ...field, [key]: value } : field
            );
        }
        setListDetails(updatedFields);
        setPayloadData({ ...payloadData, listDetails: updatedFields });
    };

    const deleteField = (id: string) => {
        const updatedFields = listDetails.filter(field => field.id !== id);
        setListDetails(updatedFields);
        setPayloadData({ ...payloadData, listDetails: updatedFields });
    };

    // CRUD functions for modalValues
    const insertValue = () => {
        setModalValues(prevValues => [...prevValues, { id: Date.now().toString(), title: '' }]);
    };

    const removeSelected = () => {
        setModalValues(modalValues.filter(value => !modalSelectedRowKeys.includes(value.id)));
        setModalSelectedRowKeys([]);
    };

    const removeAll = () => {
        setModalValues([]);
    };

    const insertBefore = () => {
        if (modalSelectedRowKeys.length === 1) {
            const index = modalValues.findIndex(value => value.id === modalSelectedRowKeys[0]);
            const newValues = [...modalValues];
            newValues.splice(index, 0, { id: Date.now().toString(), title: '' });
            setModalValues(newValues);
        }
    };

    const insertAfter = () => {
        if (modalSelectedRowKeys.length === 1) {
            const index = modalValues.findIndex(value => value.id === modalSelectedRowKeys[0]);
            const newValues = [...modalValues];
            newValues.splice(index + 1, 0, { id: Date.now().toString(), title: '' });
            setModalValues(newValues);
        }
    };

    const updateModalValue = (index: number, key: string, value: any) => {
        const newValues = [...modalValues];
        newValues[index] = { ...newValues[index], [key]: value };
        setModalValues(newValues);
    };

    const baseColumns = [
        {
            title: t('defaultLabel'),
            dataIndex: 'defaultLabel',
            key: 'defaultLabel',
            render: (defaultLabel: boolean, record: DataField) => (
                <Switch
                    checked={defaultLabel}
                    onChange={(checked) => updateField(record.id, 'defaultLabel', checked)}
                />
            ),
        },
        {
            title: t('sequence'),
            dataIndex: 'sequence',
            key: 'sequence',
            render: (sequence: string) => (
                <span>{sequence}</span>
            ),
        },
        {
            title: <span>{t('fieldValue')} <span style={{ color: 'red' }}>*</span></span>,
            dataIndex: 'fieldValue',
            key: 'fieldValue',
            render: (fieldValue: string, record: DataField) => (
                <Input
                    value={fieldValue}
                    onChange={(e) => updateField(record.id, 'fieldValue', e.target.value.toUpperCase())}
                    style={{ textTransform: 'uppercase' }}
                />
            ),
        },
        {
            title: <span>{t('labelValue')} <span style={{ color: 'red' }}>*</span></span>,
            dataIndex: 'labelValue',
            key: 'labelValue',
            render: (labelValue: string, record: DataField) => (
                <Input value={labelValue} onChange={(e) => updateField(record.id, 'labelValue', e.target.value)} />
            ),
        },
    ];

    const additionalColumns = [
        {
            title: <span>{t('type')} 
            {/* <span style={{ color: 'red' }}>*</span> */}
            </span>,
            dataIndex: 'type',
            key: 'type',
            render: (type: string, record: DataField) => (
                <Select
                    value={type}
                    style={{ width: '100%' }}
                    onChange={(value) => updateField(record.id, 'type', value)}
                >
                    <Option value="Input">Input</Option>
                    <Option value="Text">Text</Option>
                    <Option value="Number">Number</Option>
                    <Option value="Date">Date</Option>
                    <Option value="Select">Select</Option>
                </Select>
            ),
        },
        {
            title: t('width'),
            dataIndex: 'width',
            key: 'width',
            render: (width: string, record: DataField) => (
                <Input
                    value={width}
                    onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        updateField(record.id, 'width', numericValue);
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                />
            ),
        },
        
         {
            title: t('value'),
            dataIndex: 'value',
            key: 'value',
            render: (value: any[], record: DataField) => (
                <Button onClick={() => showModal(record)}>Edit Values</Button>
            ),
        },
        {
            title: t('api'),
            dataIndex: 'api',
            key: 'api',
            render: (api: string, record: DataField) => (
                <Input value={api} onChange={(e) => updateField(record.id, 'api', e.target.value)} />
            ),
        },
         {
            title: t('parameters'),
            dataIndex: 'parameters',
            key: 'parameters',
            render: (parameters: string, record: DataField) => (
                <Input value={parameters} onChange={(e) => updateField(record.id, 'parameters', e.target.value)} />
            ),
        },
    ];

    const columns = [
        ...baseColumns,
        ...(payloadData.mfrRef ? additionalColumns : [])
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const onModalSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setModalSelectedRowKeys(newSelectedRowKeys);
    };

    const modalRowSelection = {
        selectedRowKeys: modalSelectedRowKeys,
        onChange: onModalSelectChange,
    };

    // Helper function to renumber sequences
    const renumberSequences = (fields: DataField[]) => {
        return fields.map((field, index) => ({
            ...field,
            sequence: ((index + 1) * 10).toString()
        }));
    };

    // Modified function to remove selected fields
    const removeSelectedFields = () => {
        const updatedFields = renumberSequences(listDetails.filter(field => !selectedRowKeys.includes(field.id)));
        setListDetails(updatedFields);
        setPayloadData({ ...payloadData, listDetails: updatedFields });
        setSelectedRowKeys([]);
    };

    console.log("Payload from list table: ", payloadData);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6, marginTop: 20, marginRight: 8 }}>
                <Space>
                    <Button className={styles.cancelButton} onClick={() => addField({ id: uuidv4(), defaultLabel: false, sequence: '', fieldValue: '', labelValue: '', type: '', width: '', value: [], api: '', parameters: '' })}>
                        {t('insert')}
                    </Button>
                    <Button className={styles.cancelButton} onClick={removeSelectedFields} disabled={selectedRowKeys.length === 0}>
                        {t('removeSelected')}
                    </Button>
                    <Button className={styles.cancelButton} onClick={() => {
                        setListDetails([]);
                        setPayloadData({ ...payloadData, listDetails: [] });
                    }}>
                        {t('removeAll')}
                    </Button>
                </Space>
            </div>
            <Table
                dataSource={listDetails}
                columns={columns}
                rowKey="id"
                rowSelection={rowSelection}
                bordered
                // pagination={{ pageSize: 5 }}
                pagination={false}
                scroll={{ y: 'calc(100vh - 400px)' }}
            />
            <Modal
                title={t("editValues")}
                open={isModalVisible}
                onOk={handleOk}
                okText={t("ok")}
                cancelText={t("cancel")}
                onCancel={handleCancel}
                width={800}
            >
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Space size="small">
                        <Button className={styles.cancelButton} onClick={insertValue}> {t('insert')}</Button>
                        <Button className={styles.cancelButton} onClick={removeSelected} disabled={modalSelectedRowKeys.length === 0}> {t('removeSelected')}</Button>
                        <Button className={styles.cancelButton} onClick={removeAll}> {t('removeAll')}</Button>
                        <Button className={styles.cancelButton} onClick={insertBefore} disabled={modalSelectedRowKeys.length !== 1}> {t('insertBefore')}</Button>
                        <Button className={styles.cancelButton} onClick={insertAfter} disabled={modalSelectedRowKeys.length !== 1}> {t('insertAfter')}</Button>
                    </Space>
                </div>
                <Table
                    dataSource={modalValues}
                    columns={[
                        {
                            title: t('title'),
                            dataIndex: 'title',
                            key: 'title',
                            render: (title: string, record: any, index: number) => (
                                <Input
                                    value={title}
                                    onChange={(e) => updateModalValue(index, 'title', e.target.value)}
                                />
                            ),
                        },
                    ]}
                    rowKey="id"
                    rowSelection={modalRowSelection}
                    pagination={false}
                    scroll={{ y: 300 }}
                />
            </Modal>
        </div>
    );
};

export default ListTable;
