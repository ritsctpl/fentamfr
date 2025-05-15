import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Input, Button, Switch } from 'antd';
import { GrChapterAdd } from "react-icons/gr";
import type { ColumnsType } from 'antd/es/table';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid';
import styles from '@modules/podMaintenances/styles/podMainStyles.module.css';
import { useTranslation } from 'react-i18next';
import { PodMaintenanceContext } from '@modules/podMaintenances/hooks/useContext';
import { retrieveActivity } from '@services/activityService';
import { fetchAllActivities, fetchTop50Activities } from '@services/podMaintenanceService';

interface Activity {
    key: string;
    activitySequence?: number;
    activity?: string;
    type?: string;
    url?: string;
    pluginLocation?: string;
    clearsPcu?: boolean;
    fixed?: boolean;
}

const AlternateComponentTable: React.FC = () => {
    const [dataSource, setDataSource] = useState<Activity[]>();
    const [isActivityVisible, setIsActivityVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [modalDataSample, setModalDataSample] = useState<any[]>([]);
    const [activeRow, setActiveRow] = useState<string | null>(null);
    const [activityUrl, setActivityUrl] = useState('')

    const { buttonForm, setButtonForm, activitySequence, setActivitySequence, setFormChange, setButtonFormChange } = useContext<any>(PodMaintenanceContext)

    const { t } = useTranslation();

    useEffect(() => {
        if (buttonForm?.activityList) {
            setDataSource(buttonForm.activityList.map(row => ({
                ...row,
                key: row.key || uuidv4()
            })));
        }
    }, [buttonForm]);

    const showAlternateModal = async (key: string, typedValue: string) => {

        setActiveRow(key);
        let oItemList;
        const cookies = parseCookies();
        const site = cookies.site;
        const newValue = {
            activityId: typedValue,
        }
        try {
            if (typedValue) {
                oItemList = await fetchAllActivities(site, newValue);
            }
            else { 
                oItemList = await fetchTop50Activities(site); 
            }
            
            if (oItemList) {
                const processedData = oItemList?.activityList.map((item) => ({
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
        const newSequence = dataSource?.length == 0
            ? 10
            : +dataSource[dataSource?.length - 1].activitySequence + 10;
    
        const newRow: Activity = {
            key: uuidv4(),
            activitySequence: newSequence, 
            activity: '',
            pluginLocation: '',
            clearsPcu: false,
            fixed: false,
            url: '',
        };
    
        const updatedDataSource = [...dataSource, newRow];
        setDataSource(updatedDataSource);
        setButtonForm((prevData) => ({
            ...prevData,
            activityList: updatedDataSource
        }));
        setButtonFormChange(true);
    };

    const handleRemoveSelected = () => {
        const filteredData = dataSource.filter((row) => !selectedRowKeys.includes(row.key));
        const updatedData = filteredData.map((row, index) => ({
            ...row,
            activitySequence: (index + 1) * 10 
        }));
    
        setDataSource(updatedData);
        setButtonForm((prevData) => ({
            ...prevData,
            activityList: updatedData
        }));
        setButtonFormChange(true);
        setSelectedRowKeys([]);
    };
    

    const handleRemoveAll = () => {
        setDataSource([]);
        setButtonForm((prevData) => ({
            ...prevData,
            activityList: []
        }));
        setSelectedRowKeys([]);
        setButtonFormChange(true);
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
    
        const updatedDataSource = dataSource.map((row) =>
            row.key === key ? { ...row, [field]: value } : row
        );
    
        setDataSource(updatedDataSource);
        setButtonForm((prevData) => ({
            ...prevData,
            activityList: updatedDataSource
        }));
    
        if (field === 'activitySequence') {
            setActivitySequence(value);
        }
        // setFormChange(true)
        setButtonFormChange(true);
    };

    const handleChange = (checked: boolean, key: string, field: keyof Activity) => {
        const updatedDataSource = dataSource.map((row) =>
            row.key === key ? { ...row, [field]: checked } : row
        );
        setDataSource(updatedDataSource);
        setButtonForm((prevData) => ({
            ...prevData,
            activityList: updatedDataSource
        }));
        // setFormChange(true)
        setButtonFormChange(true);
    };

    const columns: ColumnsType<Activity> = [
        {
            title: t('activitySequence'),
            dataIndex: 'activitySequence',
            key: 'activitySequence',
            width: 200,
            render: (text: string, record: Activity) => (
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
            render: (text: string, record: Activity) => (
                <Input
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'activity')}
                    suffix={<GrChapterAdd onClick={() => showAlternateModal(record.key, text)} />}
                />
            ),
        },
        {
            title: t('pluginLocation'),
            dataIndex: 'pluginLocation',
            key: 'pluginLocation',
            width: 200,
            render: (text: string, record: Activity) => (
                <Input
                    min={0}
                    type="number" 
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'pluginLocation')}
                />
            ),
        },
        {
            title: t('clearsPcu'),
            dataIndex: 'clearsPcu',
            width: 200,
            render: (_, record) => (
                <Switch
                    checked={record.clearsPcu}
                    onChange={(checked) => handleChange(checked, record.key, 'clearsPcu')}
                />
            ),
        }, 
        {
            title: t('fixed'),
            dataIndex: 'fixed',
            width: 200,
            render: (_, record) => (
                <Switch
                    checked={record.fixed}
                    onChange={(checked) => handleChange(checked, record.key, 'fixed')}
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
        const site = cookies.site ;
        const activityId = record.activityId as string;
        const currentSite = site;
  
        try {
          const oActivity = await retrieveActivity(site, activityId, currentSite);
          if (activeRow) {
            const updatedData = dataSource.map((row) => {
                if (row.key === activeRow) {
                    return {
                        ...row,
                        activity: record.activityId || '',
                        url: oActivity?.url || '',
                        type: oActivity?.type || '',
                        description: oActivity?.description || ''
                    };
                }
                return row;
            });
            
            setDataSource(updatedData);
            setButtonForm((prevData) => ({
                ...prevData,
                activityList: updatedData,
            }));
            setButtonFormChange(true);
        }
    
        handleCancel();
        } catch (error) {
          console.error("Error fetching Activity:", error);
        } 
    };

    return (
        <div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
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

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        columnWidth: 30,
                    }}
                    pagination={false}
                />
            </div>

            {/* Modal for Alternate Component */}
            <Modal
                title={t("activity")}
                open={isActivityVisible}
                onCancel={handleCancel}
                width={700}
                footer={null}
                style={{ overflow: 'auto' }}
            >
                <Table
                    style={{ overflow: 'auto', height: 500 }}
                    dataSource={modalDataSample}
                    columns={modalColumns}
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 200px)' }}
                    rowKey="activityId"
                    onRow={(record) => ({
                        onDoubleClick: () => handleModalOk(record),
                    })}
                />
            </Modal>
        </div>
    );
};

export default AlternateComponentTable;
