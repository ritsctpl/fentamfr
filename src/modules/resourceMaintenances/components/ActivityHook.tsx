'use client'
import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Input, Button, Switch, Select } from 'antd';
import { GrChapterAdd } from "react-icons/gr";
import type { ColumnsType } from 'antd/es/table';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid';
import styles from '@modules/bom/styles/bomStyles.module.css';
import { useTranslation } from 'react-i18next';
import { ResourceContext } from '@modules/resourceMaintenances/hooks/ResourceContext';
import { fetchAllActivity } from '@services/ResourceService';

interface DataType {
    key: string;
    hookPoint: string;
    activity: string;
    enable: boolean;
    userArgument: string;
}

const ActivityHook: React.FC = () => {
    const { formData, setFormData } = useContext<any>(ResourceContext);
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [isActivity, setIsActivity] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [modalDataSample, setModalDataSample] = useState<any[]>([]);
    const [activeRow, setActiveRow] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (formData?.activityHookList) {
            setDataSource(formData.activityHookList.map(row => ({
                ...row,
                key: row.key || uuidv4()
            })));
        }
    }, [formData]);

    const activityOptions = [
        { value: 'Pre_Start', label: 'Pre_Start' },
        { value: 'Pre_Batch_Start', label: 'Pre_Batch_Start' },
        { value: 'Pre_Validate_Start', label: 'Pre_Validate_Start' },
        { value: 'Post_Start', label: 'Post_Start' },
        { value: 'Pre_Complete', label: 'Pre_Complete' },
        { value: 'Pre_Batch_Complete', label: 'Pre_Batch_Complete' },
        { value: 'Post_Complete', label: 'Post_Complete' },
        { value: 'Post_Batch_Complete', label: 'Post_Batch_Complete' },
        { value: 'Pre_SignOff', label: 'Pre_SignOff' },
        { value: 'Post_SignOff', label: 'Post_SignOff' },
    ];

    const showAlternateModal = async (key: string) => {
        setActiveRow(key);
        const cookies = parseCookies();
        const site = cookies.site;
        try {
            const activities = await fetchAllActivity(site);
            if (activities) {
                const processedData = activities.map((item: any) => ({
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
        setIsActivity(true);
    };

    const handleCancel = () => {
        setIsActivity(false);
    };

    const handleInsert = () => {
        const newRow: DataType = {
            key: uuidv4(),
            hookPoint: 'Pre_Start',
            activity: '',
            enable: false,
            userArgument: '',
        };
        const updatedDataSource = [...dataSource, newRow];
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            activityHookList: updatedDataSource
        }));
    };

    const handleRemoveSelected = () => {
        const filteredData = dataSource.filter((row) => !selectedRowKeys.includes(row.key));
        setDataSource(filteredData);
        setFormData((prevData) => ({
            ...prevData,
            activityHookList: filteredData
        }));
        setSelectedRowKeys([]);
    };

    const handleRemoveAll = () => {
        setDataSource([]);
        setFormData((prevData) => ({
            ...prevData,
            activityHookList: []
        }));
        setSelectedRowKeys([]);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: string,
        field: keyof DataType
    ) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
        const updatedDataSource = dataSource.map((row) =>
            row.key === key ? { ...row, [field]: value } : row
        );
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            activityHookList: updatedDataSource
        }));
    };

    const handleChange = (checked: boolean, key: string) => {
        const updatedDataSource = dataSource.map((row) =>
            row.key === key ? { ...row, enable: checked } : row 
        );
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            activityHookList: updatedDataSource
        }));
    };

    const handleSelectChange = (value: string, key: string, field: keyof DataType) => {
        const updatedDataSource = dataSource.map(row =>
            row.key === key ? { ...row, [field]: value } : row
        );
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            activityHookList: updatedDataSource
        }));
    };

    const columns: ColumnsType<DataType> = [
        {
            title: t("hookPoint"),
            dataIndex: 'hookPoint',
            key: 'hookPoint',
            render: (text: string, record: DataType) => (
                <Select
                    showSearch
                    style={{ width: '150px' }}
                    options={activityOptions}
                    value={record.hookPoint || activityOptions[0].value}
                    onChange={(value) => handleSelectChange(value, record.key, 'hookPoint')}
                    filterOption={(input, option) => option?.label.toLowerCase().includes(input.toLowerCase())}
                />
            ),
        },
        {
            title: (
                <span>
                    {t('activity')}
                    {dataSource.length > 0 && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
                </span>
            ),
            dataIndex: 'activity',
            key: 'activity',
            render: (text: string, record: DataType) => (
                <div style={{ position: 'relative' }}>
                    <Input
                        value={text}
                        onChange={(e) => handleInputChange(e, record.key, 'activity')}
                        suffix={<GrChapterAdd onClick={() => showAlternateModal(record.key)} />}
                        status={dataSource.length > 0 && !text ? 'error' : ''}
                    />
                    {dataSource.length > 0 && !text && (
                        <div style={{ color: 'red', fontSize: '12px', position: 'absolute' }}>
                            {t('required')}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: t('enable'),
            dataIndex: 'enable',
            render: (_, record) => (
                <Switch
                    checked={record.enable}
                    onChange={(checked) => handleChange(checked, record.key)}
                />
            ),
        },
        {
            title: t("userArgument"),
            dataIndex: 'userArgument',
            key: 'userArgument',
            render: (text: string, record: DataType) => (
                <Input
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'userArgument')}
                />
            ),
        },
    ];

    const modalColumns = [
        { title: t("activityId"), dataIndex: 'activityId', key: 'activityId' },
        { title: t("description"), dataIndex: 'description', key: 'description' },
    ];

    const handleModalOk = (record: any) => {
        if (activeRow) {
            const updatedData = dataSource.map((row) => {
                if (row.key === activeRow) {
                    return {
                        ...row,
                        activity: record.activityId || '',
                    };
                }
                return row;
            });

            setDataSource(updatedData);
            setFormData((prevData) => ({
                ...prevData,
                activityHookList: updatedData,
            }));
        }
        handleCancel();
    };

    const dummyData = Array.from({ length: 20 }, (_, index) => ({
        key: `${index + 1}`,
        activityId: `Activity ${index + 1}`,
        description: `Description ${index + 1}`,
    }));

    return (
        <div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button onClick={handleInsert} style={{ marginRight: 8 }} className={styles.cancelButton}>
                    {t('insert')}
                </Button>
                <Button
                    className={styles.cancelButton}
                    onClick={handleRemoveSelected}
                    style={{ marginRight: 8 }}
                    disabled={selectedRowKeys.length === 0}
                >
                    {t('removeSelected')}
                </Button>
                <Button className={styles.cancelButton} onClick={handleRemoveAll}>
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
                scroll={{ y: 'calc(100vh - 445px)' }}
            />

            <Modal
                title={t("selectActivity")}
                open={isActivity}
                onCancel={handleCancel}
                footer={null}
                width={700}
            >
                <Table
                    columns={modalColumns}
                    dataSource={modalDataSample}
                    onRow={(record) => ({
                        onDoubleClick: () => handleModalOk(record),
                    })}
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 440px)' }}
                />
            </Modal>
        </div>
    );
};

export default ActivityHook;
