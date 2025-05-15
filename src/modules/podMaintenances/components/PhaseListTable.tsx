import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Input, Button, Switch, Checkbox, Form, Space, Select } from 'antd';
import { GrChapterAdd } from "react-icons/gr";
import type { ColumnsType } from 'antd/es/table';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid';
import styles from '@modules/podMaintenances/styles/podMainStyles.module.css';
import { useTranslation } from 'react-i18next';
import { PodMaintenanceContext } from '@modules/podMaintenances/hooks/useContext';
import { retrieveActivity } from '@services/activityService';
import { fetchAllServicesActivities, fetchAllUIActivities, fetchTop50ServicesActivities, fetchTop50UIActivities } from '@services/podMaintenanceService';
import { SearchOutlined } from '@mui/icons-material';

interface PhaseList {
    key: string;
    activitySequence?: number;
    activity?: string;
    type?: string;
    url?: string;
    description?: string;
    buttons?: string;
}

const PhaseListTable: React.FC = () => {
    const [dataSource, setDataSource] = useState<PhaseList[]>();
    const [isActivityVisible, setIsActivityVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [modalDataSample, setModalDataSample] = useState<any[]>([]);
    const [activeRow, setActiveRow] = useState<string | null>(null);
    const [dataSource2, setDataSource2] = useState<PhaseList[]>();
    const [isActivityVisible2, setIsActivityVisible2] = useState(false);
    const [modalDataSample2, setModalDataSample2] = useState<any[]>([]);
    const [activeRow2, setActiveRow2] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');

    const { mainForm, setMainForm, setActivitySequence, setFormChange } = useContext<any>(PodMaintenanceContext)

    const { t } = useTranslation();
    const [form] = Form.useForm();

    useEffect(() => {
        if (mainForm?.tabConfiguration) {
            form.setFieldsValue({
                activity: mainForm.tabConfiguration.activity || '',
                description: mainForm.tabConfiguration.description || '',
                buttons: mainForm.tabConfiguration.buttons || ['Phase']
            });

            if (mainForm.tabConfiguration.configurationList) {
                const formattedList = mainForm.tabConfiguration.configurationList.map(row => ({
                    ...row,
                    key: uuidv4(),
                    activitySequence: Number(row.activitySequence)
                }));
                setDataSource(formattedList);
            }
        }
    }, [mainForm]);

    useEffect(() => {
        if (!mainForm?.tabConfiguration?.configurationList) {
            setDataSource([]);
            setMainForm((prevData) => ({
                ...prevData,
                tabConfiguration: {
                    ...prevData.tabConfiguration,
                    configurationList: []
                }
            }));
        }
    }, [mainForm]);

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
        setIsActivityVisible(true);
    };

    const handleCancel = () => {
        setIsActivityVisible(false);
    };

    const handleInsert = () => {
        const newSequence = !dataSource || dataSource.length === 0
            ? 10
            : (Number(dataSource[dataSource.length - 1]?.activitySequence) || 0) + 10;

        const newRow: PhaseList = {
            key: uuidv4(),
            activitySequence: newSequence,
            activity: '',
            description: '',
            url: '',
            type: '',
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: string,
        field: string
    ) => {
        let value = e.target.value;

        if (field === 'activity') {
            value = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
        }

        const updatedDataSource = dataSource.map((row) => {
            if (row.key === key) {
                if (field === 'activity' && !value) {
                    return { ...row, activity: '', description: '', type: '' };
                }
                return { ...row, [field]: value };
            }
            return row;
        });

        setDataSource(updatedDataSource);
        setMainForm((prevData) => ({
            ...prevData,
            tabConfiguration: {
                ...prevData.tabConfiguration,
                configurationList: updatedDataSource
            }
        }));

        if (field === 'activitySequence') {
            setActivitySequence(value);
        }
        setFormChange(true)
    };

    const handleInputChange2 = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: string,
        field: string
    ) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
        
        // Clear both activity and description if activity is empty
        if (!value) {
            form.setFieldsValue({ activity: '', description: '' });
            setMainForm((prevData) => ({
                ...prevData,
                tabConfiguration: {
                    ...prevData.tabConfiguration,
                    activity: '',
                    description: ''
                }
            }));
        } else {
            setMainForm((prevData) => ({
                ...prevData,
                tabConfiguration: {
                    ...prevData.tabConfiguration,
                    [field]: value
                }
            }));
        }
        setFormChange(true);
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

    const columns: ColumnsType<PhaseList> = [
        {
            title: t('activitySequence'),
            dataIndex: 'activitySequence',
            key: 'activitySequence',
            width: 200,
            render: (text: string, record: PhaseList) => (
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
                record.activity?.toString().toLowerCase().includes((value as string).toLowerCase()) ?? false,
            render: (text: string, record: PhaseList) => (
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
            render: (text: string, record: PhaseList) => (
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
            render: (text: string, record: PhaseList) => (
                <Input
                    type='number'
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'pluginLocation')}
                />
            ),
        }
    ];

    const modalColumns = [
        { title: t('activityId'), dataIndex: 'activityId', key: 'activityId' },
        { title: t('description'), dataIndex: 'description', key: 'description' },
    ];

    const handleModalOk = async (record) => {
        const cookies = parseCookies();
        const site = cookies.site;
        const activityId = record.activityId as string;
        const currentSite = site;

        try {
            const oActivity = await retrieveActivity(site, activityId, currentSite);
            if (activeRow && oActivity) {
                const updatedData = dataSource.map((row) => {
                    if (row.key === activeRow) {
                        return {
                            ...row,
                            activity: record.activityId || '',
                            url: oActivity.url || '',
                            type: oActivity.type || '',
                            description: oActivity.description || ''
                        };
                    }
                    return row;
                });
                setDataSource(updatedData);
                setMainForm((prevData) => ({
                    ...prevData,
                    tabConfiguration: {
                        ...prevData.tabConfiguration,
                        configurationList: updatedData
                    }
                }));
            }
            handleCancel();

        } catch (error) {
            console.error("Error fetching PhaseList:", error);
        }
    };

    const showAlternateModal2 = async (key: string, typedValue: string) => {

        setActiveRow2(key);
        let oItemList;
        const cookies = parseCookies();
        const site = cookies.site;
        const newValue = {
            activityId: typedValue,
        }
        try {
            if (typedValue) {
                oItemList = await fetchAllServicesActivities(typedValue);
                if (oItemList.message) {
                    setModalDataSample2([]);
                }
            }
            else {
                oItemList = await fetchTop50ServicesActivities();
            }

            if (oItemList) {
                const processedData = oItemList?.map((item) => ({
                    ...item,
                    key: uuidv4(),
                }));
                setModalDataSample2(processedData);
            } else {
                setModalDataSample2([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsActivityVisible2(true);
    };

    const handleCancel2 = () => {
        setIsActivityVisible2(false);
    };

    const handleModalOk2 = async (record) => {
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
        handleCancel2();
    };

    const handleFormChange = (changedValues: any, allValues: any) => {
        // If the activity field has changed, convert it to uppercase and remove special characters
        if (changedValues.activity) {
            const upperActivity = changedValues.activity.toUpperCase().replace(/[^A-Z0-9_]/g, "");
            form.setFieldValue('activity', upperActivity);
            allValues = { ...allValues, activity: upperActivity };
        }

        setMainForm((prevData) => ({
            ...prevData,
            tabConfiguration: {
                ...prevData.tabConfiguration,
                ...allValues,
            }
        }));
        setFormChange(true);
    };

    const handleFormActivityModal = () => {
        const activity = form.getFieldValue('activity');
        const tempKey = 'activity';
        showAlternateModal2(tempKey, activity);
    };

    const buttonFormItem = (
        <Form.Item
            label={t("buttons")}
            name="buttons"
            initialValue={['Phase']}
        >
            <Select
                mode="multiple"
                style={{ width: '250px' }}
                options={[
                    { value: 'Phase', label: 'Phase' },
                    { value: 'Operation', label: 'Operation' }
                ]}
                placeholder={t('Select button type')}
            />
        </Form.Item>
    );

    return (
        <div>
            <h3>{t('listConfiguration')}</h3>
            <div style={{ marginTop: 32 }}>
                <Form
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                    form={form}
                    onValuesChange={handleFormChange}
                    initialValues={{
                        activity: mainForm?.tabConfiguration?.activity || '',
                        description: mainForm?.tabConfiguration?.description || '',
                        buttons: mainForm?.tabConfiguration?.buttons || ['Phase'],
                    }}
                >
                    <Form.Item
                        label={t('activity')}
                        name="activity"
                        rules={[{ required: true, message: 'Please input the Activity!' }]}
                    >
                        <Input
                            onChange={(e) => handleInputChange2(e, form.getFieldsValue(), 'activity')}
                            suffix={<GrChapterAdd onClick={handleFormActivityModal} />}
                            placeholder="Enter activity"
                            style={{ width: '250px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={t("description")}
                        name="description"
                    >
                        <Input
                            style={{ width: '250px' }}
                            placeholder="Enter description"
                            readOnly
                        />
                    </Form.Item>

                    {buttonFormItem}
                </Form>
            </div>

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


            {/* Modal for Alternate Component */}
            <Modal
                title={t("activity")}
                open={isActivityVisible2}
                onCancel={handleCancel2}
                width={800}
                footer={null}
            >
                <Table
                    dataSource={modalDataSample2}
                    columns={modalColumns}
                    rowKey="activityId"
                    pagination={false}
                    onRow={(record) => ({
                        onDoubleClick: () => handleModalOk2(record),
                    })}
                    scroll={{ y: 'calc(100vh - 380px)' }}
                />
            </Modal>

            {/* Existing modal for the second table */}
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
                    rowKey="activityId"
                    onRow={(record) => ({
                        onDoubleClick: () => handleModalOk(record),
                    })}
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 380px)' }}
                />
            </Modal>
        </div>
    );
};

export default PhaseListTable;
