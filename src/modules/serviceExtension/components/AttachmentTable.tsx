import React, { useContext, useState, useEffect } from 'react';
import { Table, Button, Select, Input, Checkbox, Row, Col, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { ServiceExtensionContext } from '../hooks/serviceExtension';
import { GrChapterAdd } from "react-icons/gr";
import { fetchAllWorkCenter, fetchTop50WorkCenter, retrieveAllResource, retrieveTop50Resource } from '@services/workCenterService';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import styles from '../styles/ServiceExtension.module.css';
import { fetchTop50Operation, retrieveAllOperation } from '@services/serviceExtensionServices';

interface TableRow {
    key: number;
    sequence: number;
    type: string;
    associateId: string;
    status: string;
    enabled: boolean;
}

interface ModalData {
    resource: string;
    description: string;
}

const AttachmentTable: React.FC = () => {
    const { payloadData, setPayloadData, setShowAlert } = useContext<any>(ServiceExtensionContext);
    const [dataSource, setDataSource] = useState<TableRow[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalColumns, setModalColumns] = useState<ColumnsType<ModalData>>([]);
    const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const { t } = useTranslation();

    useEffect(() => {
        if (payloadData && payloadData?.attachmentList) {
            const updatedData = payloadData?.attachmentList.map((hook, index) => ({
                key: hook.key || index, // Ensure the key is unique
                ...hook
            }));
            setDataSource(updatedData);
        }
    }, [payloadData, setPayloadData]);



    const columns: ColumnsType<any> = [
        {
            title: t('sequence'),
            dataIndex: 'sequence',
            key: 'sequence',
            width: 150,
            // filterIcon: <SearchOutlined style={{ fontSize: '18px' }} />,

        },
        {
            title: t('type'),
            dataIndex: 'type',
            key: 'type',
            filterIcon: <SearchOutlined style={{ fontSize: '18px' }} />,
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
                record.type
                    .toString()
                    .toLowerCase()
                    .includes((value as string).toLowerCase()),
            render: (_, record, index) => (
                <Select
                    style={{ width: '100%' }}
                    value={record.type || 'Operation'}
                    onChange={(value) => handleFieldChange(value, index, 'type')}
                    >
                    <Select.Option value="Operation">Operation</Select.Option>
                    <Select.Option value="Work Center">Work Center</Select.Option>
                    <Select.Option value="Resource">Resource</Select.Option>
                </Select>
            ),
        },

        {
            title: (
                <span>
                    <span style={{ color: 'red' }}>*</span>  {t('associateId')}
                </span>
            ),
            dataIndex: 'associateId',
            key: 'associateId',
            filterIcon: <SearchOutlined style={{ fontSize: '18px' }} />,
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
                record.associateId
                    .toString()
                    .toLowerCase()
                    .includes((value as string).toLowerCase()),
            render: (_, record, index) => (
                <Input
                    value={record.associateId}
                    required
                    onChange={(e) => handleFieldChange(e.target.value, index, 'associateId')}
                    suffix={<GrChapterAdd onClick={() => openModal(record.key, record.type, record.associateId)} />}
                    style={{ cursor: "pointer" }} 
                />
            ),
        },
      


    ];


    const handleFieldChange = (value: any, index: number, key: keyof any) => {
        const newData = [...dataSource];

        if (key === 'associateId') {
            value = value
                .toUpperCase()
                .replace(/[^A-Z0-9_*]/g, ''); // Allow uppercase letters, numbers, underscore, and asterisk
        }

        newData[index][key] = value;
        setDataSource(newData);

        setPayloadData(prevData => ({
            ...prevData,
            attachmentList: newData,
        }));
        setShowAlert(true);
    };

    const handleInsert = () => {
        const vvid = uuidv4();
        const newSequence = dataSource.length === 0 ? 10 : +dataSource[dataSource.length - 1].sequence + 10;
        const newRow: any = {
            key: `${newSequence}_${vvid}`,
            sequence: newSequence,
            type: 'Work Center',
            associateId: '',
        };
        const newData = [...dataSource, newRow];
        setDataSource(newData);
        setPayloadData(prevData => ({
            ...prevData,
            attachmentList: newData,
        }));
        setShowAlert(true);
    };

    const handleRemoveSelected = () => {
        const vvid = uuidv4();
        const newData = dataSource.filter(item => !selectedRowKeys.includes(item.key));
        const updatedData: any = newData.map((item, index) => ({
            ...item,
            sequence: (index + 1) * 10,
            key: `${index}_${vvid}`
        }));
        setDataSource(updatedData);
        setSelectedRowKeys([]);
        setPayloadData(prevData => ({
            ...prevData,
            attachmentList: updatedData,
        }));
        setShowAlert(true);
    };

    const handleRemoveAll = () => {
        setDataSource([]);
        setSelectedRowKeys([]);
        setPayloadData(prevData => ({
            ...prevData,
            attachmentList: [],
        }));
        setShowAlert(true);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(selectedRowKeys as number[]);
        },
    };



    const openModal = async (key: number, type: string, typedValue: string) => {
        setSelectedActivityId(key);
        try {
            let oResponse;
            const cookies = parseCookies();
            const site = cookies.site;
            if (type === "Resource") {
                oResponse = await retrieveTop50Resource(site);
                if (typedValue)
                    oResponse = await retrieveAllResource(site, typedValue);
                if (oResponse) {
                    const updatedData = oResponse.map(item => ({
                        ...item,
                        associateId: item.resource,
                    }));
                    setModalData(updatedData);
                }
                else {
                    setModalData([]);
                }
            }
            else if(type == "Operation")
            {
                oResponse = await fetchTop50Operation(site);
                if (typedValue)
                    oResponse = await retrieveAllOperation(site, typedValue);
                if (oResponse) {
                    const updatedData = oResponse.map(item => ({
                        ...item,
                        associateId: item.operation,
                    }));
                    setModalData(updatedData);
                }
                else {
                    setModalData([]);
                }
            }
             else {
                oResponse = await fetchTop50WorkCenter(site);
                if (typedValue)
                    oResponse = await fetchAllWorkCenter(site, typedValue);
                if (oResponse) {
                    const updatedData = oResponse.map(item => ({
                        ...item,
                        associateId: item.workCenter,
                    }));
                    setModalData(updatedData);
                }
                else {
                    setModalData([]);
                }
            }

            setModalColumns([
                {
                    title: type === "Resource" ? t('resource') : type == "Work Center" ? t('workCenter') : t("operation"),
                    dataIndex: 'associateId',
                    key: 'associateId',

                },
                {
                    title: t('description'),
                    dataIndex: 'description',
                    key: 'description',

                },
            ]);
        } catch (error) {
            console.error('Error fetching list:', error);
        }
        setIsModalVisible(true);
    };


    const handleModalRowSelect = (activity: string) => {
        if (selectedActivityId !== null) {
            const newData = [...dataSource];
            const index = newData.findIndex(row => row.key === selectedActivityId);
            if (index !== -1) {
                newData[index].associateId = activity;
                setDataSource(newData);
                setPayloadData(prevData => ({
                    ...prevData,
                    attachmentList: newData,
                }));
            }
        }
        setIsModalVisible(false);
    };

    return (
        <>
            <Row justify="end" gutter={[16, 16]} style={{ margin: "16px 0px" }}>
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
                pagination={false}
                scroll={{ y: 'calc(100vh - 400px)' }}
                bordered={true}
                size="small"
                style={{ width: '95%', marginLeft: '20px' }}
            />
            <Modal
                title={t("selectAssociateId")}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                <Table
                    columns={modalColumns}
                    dataSource={modalData}
                    rowKey="associateId"
                    onRow={(record) => ({
                        onDoubleClick: () => handleModalRowSelect(record.associateId),
                    })}
                    pagination={false}
                    scroll={{y: 'calc(100vh - 425px)'}}
                    size={"small"}
                    bordered
                    
                />
            </Modal>
        </>
    );
};

export default AttachmentTable;
