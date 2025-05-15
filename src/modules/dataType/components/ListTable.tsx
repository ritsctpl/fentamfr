import React, { useContext, useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Checkbox, Space, Switch, Form, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import styles from '../styles/DataTypeMaintenance.module.css';
import { DataTypeContext } from "../hooks/DataTypeContext";
import { parseCookies } from 'nookies';
import { GrChapterAdd } from "react-icons/gr";
import { retrieveAllDataField, retrieveDataField, retrieveTop50DataField } from '@services/dataTypeService';

interface DataField {
    id: string;
    sequence: string;
    dataField: string;
    dataType: string;
    description: string;
    details: any[];
    required: boolean;
}

const ListTable: React.FC = () => {
    const { payloadData, setPayloadData, setShowAlert } = useContext(DataTypeContext);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const { t } = useTranslation();
    const [isDataFieldModalVisible, setIsDataFieldModalVisible] = useState(false);
    const [selectedDataField, setSelectedDataField] = useState<string>('');
    const [tableData, setTableData] = useState<any>(payloadData.dataFieldList);
    const [tableColumn, setTableColumn] = useState<any>();
    const [detailsTableData, setDetailsTableData] = useState<any[]>([]);
    const [detailsTableColumn, setDetailsTableColumn] = useState<any>();
    const [dataFieldInfo, setDataFieldInfo] = useState<any>(null);

    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [selectedDetails, setSelectedDetails] = useState<any[]>([]);
    // console.log("Payload from list table: ", tableData)
    const handleDataFieldDoubleClick = (record: any) => {
        const updatedFields = payloadData.dataFieldList.map(field =>
            field.id === selectedDataField
                ? {
                    ...field,
                    dataField: record.dataField,
                    description: record.description,
                    dataType: record.dataType
                }
                : field
        );
        setPayloadData({ ...payloadData, dataFieldList: updatedFields });
        setIsDataFieldModalVisible(false);
    };

    const showDataFieldModal = async (record: any, id: string) => {
        debugger
        setSelectedDataField(id);
        setIsDataFieldModalVisible(true);

        const oTableColumns = [
            { title: t("dataField"), dataIndex: "dataField", key: "dataField" },
            { title: t('description'), dataIndex: 'description', key: 'description' },
            { title: t('dataType'), dataIndex: 'dataType', key: 'dataType' },
        ];

        try {
            let oDataFieldList;
            const typedValue = record.dataField;
            const cookies = parseCookies();
            const site = cookies.site;
            if (typedValue)
                oDataFieldList = await retrieveAllDataField(site, typedValue);
            else
                oDataFieldList = await retrieveTop50DataField(site);
            setTableColumn(oTableColumns);
            if (!oDataFieldList.erroCode) {
                const formattedDataFieldList = oDataFieldList.map((item, index) => ({
                    ...item,
                    key: index,
                    id: index,
                    dataType: item.type,
                }));
                setTableData(formattedDataFieldList);
            } else {
                setTableData([]);
            }
        } catch (error) {
            console.error("Error fetching data field list:", error);
        }
    };

    const showDetailsModal = async (record: any) => {
        setSelectedDetails(record);
        setIsDetailsModalVisible(true);
        try {
            const dataFieldValue = record.dataField;
            const cookies = parseCookies();
            const site = cookies.site;

            const oDataFieldList = await retrieveDataField(site, dataFieldValue);

            if (!oDataFieldList.erroCode) {
                setDataFieldInfo(oDataFieldList);
                if (oDataFieldList.listDetails && oDataFieldList.type === "List") {
                    const formattedDataFieldList = oDataFieldList.listDetails.map((item, index) => ({
                        ...item,
                        key: index,
                        id: index,
                        dataType: item.type,
                    }));
                    setDetailsTableData(formattedDataFieldList);
                } else {
                    setDetailsTableData([]);
                }
            } else {
                setDetailsTableData([]);
                setDataFieldInfo(null);
            }
        } catch (error) {
            console.error("Error fetching data field list:", error);
        }
    };

    const updateSequences = (fields: DataField[]) => {
        return fields.map((field, index) => ({
            ...field,
            sequence: ((index + 1) * 10).toString()
        }));
    };

    const addField = () => {
        const newField: DataField = {
            id: uuidv4(),
            sequence: '',
            dataField: '',
            dataType: '',
            description: '',
            details: [],
            required: false
        };
        const updatedFields = updateSequences([...payloadData.dataFieldList, newField]);
        setPayloadData({ ...payloadData, dataFieldList: updatedFields });
        setShowAlert(true);
    };

    const updateField = (id: string, key: keyof DataField, value: any) => {

        payloadData.dataFieldList.map(item => ({
            ...item,
            key: uuidv4(),
            id: uuidv4(),
        }))
        debugger
        const updatedFields = payloadData.dataFieldList.map(field =>
            field.id == id ? { ...field, [key]: value } : field
        );
        setPayloadData({ ...payloadData, dataFieldList: updatedFields });
    };

    const columns = [
        {
            title: t('sequence'),
            dataIndex: 'sequence',
            key: 'sequence',
            render: (sequence: string) => <span>{sequence}</span>,
        },
        {
            title: (
                <span>
                    {t('dataField')} <span style={{ color: 'red' }}>*</span>
                </span>
            ),
            dataIndex: 'dataField',
            key: 'dataField',
            render: (dataField: string, record: DataField) => (
                <Input
                    value={dataField}
                    onChange={(e) => {
                        const formattedValue = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9_]/g, '')
                            .replace(/\s/g, '');
                        updateField(record.id, 'dataField', formattedValue);
                    }}
                    suffix={<GrChapterAdd onClick={() => showDataFieldModal(record, record.id)} />}
                />
            ),
        },
        {
            title: t('description'),
            dataIndex: 'description',
            key: 'description',
            render: (description: string) => (
                <span>{description}</span>
            ),
        },
        {
            title: t('dataType'),
            dataIndex: 'dataType',
            key: 'dataType',
            render: (dataType: string) => (
                <span>{dataType}</span>
            ),
        },
        {
            title: t('details'),
            dataIndex: 'details',
            key: 'details',
            render: (details: any[], record: DataField) => (
                <Button onClick={() => showDetailsModal(record)}>{t('details')}</Button>
            ),
        },
        {
            title: t('required'),
            dataIndex: 'required',
            key: 'required',
            render: (required: boolean, record: DataField) => (
                <Checkbox
                    checked={required}
                    onChange={(e) => updateField(record.id, 'required', e.target.checked)}
                />
            ),
        },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const removeSelectedFields = () => {
        const updatedFields = payloadData.dataFieldList.filter(field => !selectedRowKeys.includes(field.id));
        const resequencedFields = updateSequences(updatedFields);
        setPayloadData({ ...payloadData, dataFieldList: resequencedFields });
        setSelectedRowKeys([]);
        setShowAlert(true);
    };

    const detailsTableColumns = [
        {
            title: t('sequence'),
            dataIndex: 'sequence',
            key: 'sequence',
        },
        {
            title: t('fieldValue'),
            dataIndex: 'fieldValue',
            key: 'fieldValue',
            render: (fieldValue: string) => (
                <span style={{ textTransform: 'uppercase' }}>{fieldValue}</span>
            ),
        },
        {
            title: t('labelValue'),
            dataIndex: 'labelValue',
            key: 'labelValue',
        },
        {
            title: t('type'),
            dataIndex: 'type',
            key: 'type',
        },
        // Add more columns as needed
    ];

    // console.log("payload data from table: ", payloadData)
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6, marginTop: 20, marginRight: 8 }}>
                <Space>
                    <Button className={styles.cancelButton} onClick={addField}>
                        {t('insert')}
                    </Button>
                    <Button className={styles.cancelButton} onClick={removeSelectedFields} disabled={selectedRowKeys.length === 0}>
                        {t('removeSelected')}
                    </Button>
                    <Button className={styles.cancelButton} onClick={() => {
                        setPayloadData({ ...payloadData, dataFieldList: [] }); setShowAlert(true);
                    }}>
                        {t('removeAll')}
                    </Button>
                </Space>
            </div>
            <Table
                dataSource={payloadData.dataFieldList}
                columns={columns}
                rowKey="id"
                rowSelection={rowSelection}
                bordered
                pagination={false}
                scroll={{ y: 'calc(100vh - 400px)' }} // Adjust the value as needed
            />
            <Modal
                title={t("selectDataField")}
                open={isDataFieldModalVisible}
                onCancel={() => setIsDataFieldModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    columns={tableColumn}
                    dataSource={tableData}
                    rowKey="id"
                    pagination={false}
                    scroll={{ y: 300 }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleDataFieldDoubleClick(record),
                    })}
                />
            </Modal>
            <Modal
                title={t("details")}
                open={isDetailsModalVisible}
                onCancel={() => setIsDetailsModalVisible(false)}
                footer={null}
                width={800}
            >
                {dataFieldInfo && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100%', marginBottom: '20px' }}>
                            <Form layout="horizontal" style={{ marginLeft: "18%" }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label={t("dataField")}>
                                            <span>{dataFieldInfo.dataField}</span>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t("type")}>
                                            <span>{dataFieldInfo.type}</span>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label={t("description")}>
                                            <span>{dataFieldInfo.description}</span>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t("fieldLabel")}>
                                            <span>{dataFieldInfo.fieldLabel}</span>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label={t("maskGroup")}>
                                            <span>{dataFieldInfo.maskGroup}</span>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t("preSaveActivity")}>
                                            <span>{dataFieldInfo.preSaveActivity}</span>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item label={t("browseIcon")}>
                                            <Checkbox checked={dataFieldInfo.browseIcon} disabled />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label={t("isTrackable")}>
                                            <Checkbox checked={dataFieldInfo.trackable} disabled />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label={t("isMrfRef")}>
                                            <Checkbox checked={dataFieldInfo.mfrRef} disabled />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        {dataFieldInfo.type === "List" && (
                            <div style={{ width: '100%' }}>
                                <h3>{t("listDetails")}</h3>
                                <Table
                                    columns={detailsTableColumns}
                                    dataSource={detailsTableData}
                                    pagination={false}
                                    scroll={{ y: 'calc(100vh - 400px)' }}
                                    bordered
                                />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ListTable;
