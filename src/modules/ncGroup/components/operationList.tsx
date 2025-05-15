import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Select, Input, Checkbox, Form, Row, Col, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { NcGroupContext } from "../hooks/ncGroupContext";
import { SearchOutlined } from '@ant-design/icons';
import { GrChapterAdd } from "react-icons/gr";
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import styles from '../styles/NcGroupMaintenance.module.css';
import { v4 as uuidv4 } from 'uuid';
import { fetchTop50Operation, retrieveAllOperation } from '@services/ncGroupServices';


interface TableRow {
    key: number;
    operation: string;
}



const OperationList: React.FC = () => {
    const { payloadData, setPayloadData, setShowAlert } = useContext<any>(NcGroupContext);
    const [dataSource, setDataSource] = useState<TableRow[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalData, setModalData] = useState<any[]>([]);
    const [selectedOperationId, setSelectedOperationId] = useState<number | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        debugger
        if (payloadData && payloadData.operationList) {
            const updatedData = payloadData.operationList.map((hook, index) => ({
                key: hook.key || index, // Ensure the key is unique
                ...hook
            }));
            setDataSource(updatedData);
        }
    }, [payloadData, setPayloadData]);


    const columns: ColumnsType<TableRow> = [

        {
            title: (
                <span>
                    <span style={{ color: 'red' }}>*</span>  {t('operation')}
                </span>
            ),
            filterIcon: <SearchOutlined style={{ fontSize: '12px' }} />,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        value={selectedKeys[0]}
                        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Button
                        type="primary"
                        onClick={() => confirm()}
                        // icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        {t('search')}
                    </Button>
                    <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                        {t('reset')}
                    </Button>
                </div>
            ),
            onFilter: (value, record) =>
                record.operation
                    .toString()
                    .toLowerCase()
                    .includes((value as string).toLowerCase()),
            render: (_, record, index) => (

                <Input
                    value={record.operation} required={true}
                    onChange={(e) => handleFieldChange(e.target.value, index, 'operation')}
                    suffix={<GrChapterAdd onClick={() => openModal(record)} />}
                />
            ),
        },


    ];

    const handleFieldChange = (value: any, index: number, key: keyof any) => {
        const newData = [...dataSource];

        // Check if the key is 'activity'
        if (key === 'operation') {
            // Convert value to uppercase, remove spaces, and replace special characters with underscores
            value = value
                .toUpperCase() // Convert to uppercase
                .replace(/\s+/g, '') // Remove all spaces
                .replace(/[^A-Z0-9_]/g, ''); // Remove all special characters except underscores
        }

        newData[index][key] = value;
        setDataSource(newData);

        // Update payloadData directly
        setPayloadData(prevData => {
            const updatedData = {
                ...prevData,
                operationList: newData,
            };
            console.log("Updated payloadData:", updatedData); // Debugging
            return updatedData;
        });
        setShowAlert(true)
    };


    const handleInsert = () => {
        // Generate a unique vvid (for example, using a timestamp or a library like uuid)
        const vvid = new Date().getTime().toString(); // Example unique identifier
        // Determine the new sequence value

        // Create a new row with the unique vvid
        const newRow: any = {
            key: `${vvid}`, // Concatenate sequence and vvid
            operation: '',
        };

        // Update the data source with the new row
        const newData = [...dataSource, newRow];
        setDataSource(newData);

        // Update payloadData directly
        setPayloadData(prevData => ({
            ...prevData,
            operationList: newData,
        }));
        setShowAlert(true)
    };


    const handleRemoveSelected = () => {
        // const vvid = new Date().getTime().toString();
        const vvid = uuidv4();
        // Step 1: Remove selected rows
        const newData = dataSource.filter(item => !selectedRowKeys.includes(item.key));

        // Step 2: Reset sequence and update key for remaining rows
        const updatedData: any = newData.map((item, index) => ({
            ...item,
            sequence: (index + 1) * 10,
            key: uuidv4()
        }));

        // Update state and payload data
        setDataSource(updatedData);
        setSelectedRowKeys([]);
        setShowAlert(true)
        // Update payloadData directly
        setPayloadData(prevData => ({
            ...prevData,
            operationList: updatedData,
        }));
    };


    const handleRemoveAll = () => {
        setDataSource([]);
        setSelectedRowKeys([]);
        setShowAlert(true)
        // Update payloadData directly
        setPayloadData(prevData => ({
            ...prevData,
            operationList: [],
        }));
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(selectedRowKeys as number[]);
        },
    };

    const openModal = async (record: any) => {
        debugger
        setSelectedOperationId(record?.key);
        try {
            let response;
            const cookies = parseCookies();
            const site = cookies.site;
            const typedValue = record?.operation;
            if (typedValue) {
                response = await retrieveAllOperation(site, typedValue);
            } else {
                response = await fetchTop50Operation(site);
            }
            console.log("Top 50 operation response: ", response);
            const updatedData = response.map((item, index) => ({
                operation: item.operation,
                description: item.description,
                id: index
            }));

            setModalData(updatedData);
            setIsModalVisible(true);
            console.log("Modal is open", updatedData);

        } catch (error) {
            console.error('Error fetching top 50 operation:', error);
        }
    };

    const handleModalRowSelect = (operation: string) => {
        if (selectedOperationId !== null) {
            const newData = [...dataSource];
            const index = newData.findIndex(row => row.key === selectedOperationId);
            if (index !== -1) {
                newData[index].operation = operation;
                setDataSource(newData);
                setPayloadData(prevData => ({
                    ...prevData,
                    operationList: newData,
                }));
            }
        }
        setShowAlert(true)
        setIsModalVisible(false);
    };

    const modalColumns = [
        {
            title: t('operation'),
            dataIndex: 'operation',
            key: 'operation',
        },
        {
            title: t('description'),
            dataIndex: 'description',
            key: 'description',
        },
    ];



    return (
        <>
            <Row justify="end" gutter={[16, 16]}>
                <Col>
                    <Button className={styles.cancelButton} onClick={handleInsert}>
                        {t("insert")}
                    </Button>
                </Col>
                <Col>
                    <Button onClick={handleRemoveSelected} className={styles.cancelButton} disabled={selectedRowKeys.length === 0}>
                        {t("removeSelected")}
                    </Button>
                </Col>
                <Col>
                    <Button onClick={handleRemoveAll} className={styles.cancelButton} disabled={dataSource.length === 0}>
                        {t("removeAll")}
                    </Button>
                </Col>
            </Row>
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={dataSource}
                // pagination={{ pageSize: 5 }}
                pagination={false}
                scroll={{ y: 'calc(100vh - 400px)' }}
            />
            <Modal
                title={t("selectOperation")}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Table
                    columns={modalColumns}
                    dataSource={modalData}
                    rowKey="operation"
                    onRow={(record) => ({
                        onDoubleClick: () => handleModalRowSelect(record.operation),
                    })}
                    pagination={false}
                    size="small"
                    style={{fontSize: '12px'}}
                    bordered={true}
                    scroll={{ y: 'calc(100vh - 400px)' }}
                />
            </Modal>
        </>
    );
};

export default OperationList;
