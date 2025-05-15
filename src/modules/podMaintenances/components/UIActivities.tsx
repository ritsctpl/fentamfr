'use client'
import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Input, Button, Space, Form } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import styles from '@modules/bom/styles/bomStyles.module.css';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { PodMaintenanceContext } from '@modules/podMaintenances/hooks/useContext';
import { SearchOutlined } from '@mui/icons-material';
import { GrChapterAdd } from 'react-icons/gr';
import { fetchAllUIActivities, fetchTop50UIActivities } from '@services/podMaintenanceService';

interface DataType {
    key: string;
    activitySequence: string;
    activityId: string;
    description: string;
    pluginLocation: number;
}

const UIActivities: React.FC = () => {
    const { mainForm, setMainForm, formChange, setFormChange } = useContext<any>(PodMaintenanceContext);
    const [dataSource, setDataSource] = useState<any[]>();
    const [isActivityVisible, setActivityVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [modalDataSample, setModalDataSample] = useState<any[]>([]);
    const [activeRow, setActiveRow] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');

    const { t } = useTranslation();
    const [form] = Form.useForm();

    const showAlternateModal = async (key: string, typedValue: string) => {
        setActiveRow(key);
        let oItemList;
        try {
            if (typedValue) {
                oItemList = await fetchAllUIActivities(typedValue);
                if (oItemList.message) {
                    setModalDataSample([]);
                }
            }
            else {
                oItemList = await fetchTop50UIActivities();
            }
            if (oItemList) {
                const processedData = oItemList?.map((item) => ({
                    ...item,
                    key: uuidv4(),
                }));
                setModalDataSample(processedData);
            } else {
                setModalDataSample([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setActivityVisible(true);
    };

    const handleCancel = () => {
        setActivityVisible(false);
    };

    const modalColumns = [
        { title: t('activityId'), dataIndex: 'activityId', key: 'activityId' },
        { title: t('description'), dataIndex: 'description', key: 'description' },
    ];

    const handleInputChange = (e: any, key: string, field: string) => {
        const updatedData = dataSource.map((row) =>
            row.key === key ? { ...row, [field]: e.target.value } : row
        );
        setDataSource(updatedData);
    };

    const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const columns: ColumnsType<DataType> = [
        {
            title: t('activitySequence'),
            dataIndex: 'activitySequence',
            key: 'activitySequence',
            width: 200,
            render: (text: string, record: DataType) => (
                <Input
                    readOnly
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'activitySequence')}
                />
            ),
        },
        {
            title: t('activity'),
            dataIndex: 'activity',
            key: 'activity',
            width: 200,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder={`Search ${t('activity')}`}
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => handleSearch(selectedKeys as string[], confirm, 'activity')}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => handleSearch(selectedKeys as string[], confirm, 'activity')}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Search
                        </Button>
                        <Button
                            onClick={() => handleReset(clearFilters)}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: (value, record) =>
                record.activityId?.toString().toLowerCase().includes((value as string).toLowerCase()) ?? false,
            render: (text: string, record: DataType) => (
                <Input
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'activity')}
                    suffix={<GrChapterAdd onClick={() => showAlternateModal(record.key, text)} />}
                />
            ),
        },
        {
            title: t('description'),
            dataIndex: 'description',
            key: 'description',
            width: 200,
            render: (text: string, record: DataType) => (
                <Input
                    value={text}
                    disabled
                />
            ),
        },
        {
            title: t('pluginLocation'),
            dataIndex: 'pluginLocation',
            key: 'pluginLocation',
            width: 200,
            render: (text: string, record: DataType) => (
                <Input
                    type='number'
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'pluginLocation')}
                />
            ),
        }
    ];

    const handleInsert = () => {
        const newSequence = !dataSource || dataSource.length === 0
            ? 10
            : (Number(dataSource[dataSource.length - 1]?.activitySequence) || 0) + 10;

        const newRow: DataType = {
            key: uuidv4(),
            activitySequence: newSequence.toString(),
            activityId: '',
            description: '',
            pluginLocation: 0,
        };

        const updatedDataSource = dataSource ? [...dataSource, newRow] : [newRow];
        setDataSource(updatedDataSource);
        setMainForm((prevData) => ({
            ...prevData,
            tabConfiguration: {
                ...prevData.tabConfiguration,
                configurationList: updatedDataSource
            }
        }));
    };

    const handleRemoveSelected = () => {
        const filteredData = dataSource.filter((row) => !selectedRowKeys.includes(row.key));
        const updatedData = filteredData.map((row, index) => ({
            ...row,
            activitySequence: (index + 1) * 10
        }));

        setDataSource(updatedData);
        setMainForm((prevData) => ({
            ...prevData,
            tabConfiguration: {
                ...prevData.tabConfiguration,
                configurationList: updatedData
            }
        }));
        setSelectedRowKeys([]);
    };


    const handleRemoveAll = () => {
        setDataSource([]);
        setMainForm((prevData) => ({
            ...prevData,
            tabConfiguration: {
                ...prevData.tabConfiguration,
                configurationList: []
            }
        }));
        setSelectedRowKeys([]);
    };

    const handleModalOk = async (record) => {
        // Update the form values
        form.setFieldsValue({
            activity: record.activityId,
            description: record.description
        });

        // Update the main form state
        setMainForm((prevData) => ({
            ...prevData,
            tabConfiguration: {
                ...prevData.tabConfiguration,
                activity: record.activityId,
                description: record.description
            }
        }));
        handleCancel();
    };

    return (
        <div>
            <div style={{ marginBottom: 16, textAlign: 'right', marginTop: 32 }}>
                <Button onClick={handleInsert} style={{ marginRight: 8 }} className={`${styles.cancelButton}`}>
                    {t('insert')}
                </Button>
                <Button
                    className={`${styles.cancelButton}`}
                    onClick={handleRemoveSelected}
                    style={{ marginRight: 8 }}
                >
                    {t('removeSelected')}
                </Button>
                <Button className={`${styles.cancelButton}`} onClick={handleRemoveAll}>
                    {t('removeAll')}
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                    columnWidth: 30,
                }}
                pagination={false}
                scroll={{ y: 'calc(100vh - 575px)' }}
            />


            <Modal
                title={t("activity")}
                open={isActivityVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <Table
                    dataSource={modalDataSample}
                    columns={modalColumns}
                    rowKey="activitySequence"
                    pagination={false}
                    onRow={(record) => ({
                        onDoubleClick: () => handleModalOk(record),
                    })}
                    scroll={{ y: 'calc(100vh - 380px)' }}
                />
            </Modal>
        </div>
    );
};

export default UIActivities;
