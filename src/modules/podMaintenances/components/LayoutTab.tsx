import React, { useContext, useState, useEffect } from 'react';
import { Input, Modal, Table, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { GrChapterAdd } from 'react-icons/gr';
import { PodMaintenanceContext } from '@/modules/podMaintenances/hooks/useContext';
import { useTranslation } from 'react-i18next';
import { ScheduleTwoTone } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { fetchAllUIActivities, fetchTop50UIActivities } from '@services/podMaintenanceService';

interface LayoutPanel {
    key: string;
    panel: string;
    type: string;
    defaultPlugin: string;
    defaultUrl: string;
    otherPlugin: Array<{
        activity: string;
        activityDescription: string;
    }>;
}

const LayoutTab: React.FC = () => {

    const [dataSource, setDataSource] = useState<any[]>([]);
    const { setMainForm, mainForm, setFormChange, retriveRow } = useContext<any>(PodMaintenanceContext);
    const [isActivityVisible, setIsActivityVisible] = useState(false);
    const [isOtherPluginModalVisible, setIsOtherPluginModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
    const [otherPluginRows, setOtherPluginRows] = useState<{
        key: string;
        activity: string;
        activityDescription: string;
    }[]>([]);
    const { t } = useTranslation();
    const [editingRow, setEditingRow] = useState<string | null>(null);
    const [currentEditingPanelKey, setCurrentEditingPanelKey] = useState<string>('');
    const [isDefaultPluginModalVisible, setIsDefaultPluginModalVisible] = useState(false);
    const [defaultPluginEditingKey, setDefaultPluginEditingKey] = useState<string>('');
    const [tempOtherPluginRows, setTempOtherPluginRows] = useState<any[]>([]);
    const [activityData, setActivityData] = useState<any[]>([]);
    const [pluginData, setPluginData] = useState<any[]>([]);

    useEffect(() => {
        if (retriveRow?.panelLayout) {
            // Convert panelLayout to number regardless of type
            const panelCount = typeof retriveRow.panelLayout === 'string'
                ? parseInt(retriveRow.panelLayout)
                : retriveRow.panelLayout;

            let initialData;
            if (retriveRow.layout && retriveRow.layout.length > 0) {
                // First, map existing layout data
                let existingPanels = retriveRow.layout.map((item: any) => ({
                    key: item.panel.toString(),
                    panel: item.panel.toString(),
                    type: item.type || "fixed",
                    defaultPlugin: item.defaultPlugin || "",
                    defaultUrl: item.defaultUrl || "",
                    otherPlugin: item.otherPlugin?.map((plugin: any) => ({
                        // Map activity to activityId and activityDescription to description
                        activity: plugin.activity || "",
                        activityDescription: plugin.activityDescription || ""
                    })) || []
                }));

                // Filter out the popup panel if it exists
                const fixedPanels = existingPanels.filter(panel => panel.type === "fixed");
                const popupPanel = existingPanels.find(panel => panel.type === "popup") || {
                    key: (panelCount + 1).toString(),
                    panel: "",
                    type: "popup",
                    defaultPlugin: "",
                    defaultUrl: "",
                    otherPlugin: []
                };

                if (fixedPanels.length < panelCount) {
                    // Add new panels if panelLayout increased
                    const newPanels = Array.from(
                        { length: panelCount - fixedPanels.length },
                        (_, index) => ({
                            key: (fixedPanels.length + index + 1).toString(),
                            panel: (fixedPanels.length + index + 1).toString(),
                            type: "fixed",
                            defaultPlugin: "",
                            defaultUrl: "",
                            otherPlugin: []
                        })
                    );
                    initialData = [...fixedPanels, ...newPanels, popupPanel];
                } else if (fixedPanels.length > panelCount) {
                    // Remove panels if panelLayout decreased
                    initialData = [...fixedPanels.slice(0, panelCount), popupPanel];
                } else {
                    // Keep existing panels if count matches
                    initialData = [...fixedPanels, popupPanel];
                }
            } else {
                // Create fixed panels based on panelCount
                const fixedPanels = Array.from({ length: panelCount }, (_, index) => ({
                    key: (index + 1).toString(),
                    panel: (index + 1).toString(),
                    type: "fixed",
                    defaultPlugin: "",
                    defaultUrl: "",
                    otherPlugin: []
                }));

                // Always add a popup panel at the end
                const popupPanel = {
                    key: (panelCount + 1).toString(),
                    panel: "",
                    type: "popup",
                    defaultPlugin: "",
                    defaultUrl: "",
                    otherPlugin: []
                };

                initialData = [...fixedPanels, popupPanel];
            }

            setDataSource(initialData);
            // Update mainForm with the initial layout data
            setMainForm((prevData: any) => ({
                ...prevData,
                layout: initialData.map(({ key, ...item }) => ({
                    ...item,
                    panel: item.panel,
                    type: item.type || 'fixed',
                    defaultPlugin: item.defaultPlugin || '',
                    defaultUrl: item.defaultUrl || '',
                    otherPlugin: item.otherPlugin || []
                }))
            }));
        }
    }, [retriveRow?.panelLayout, retriveRow?.layout]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: string,
        field: string
    ) => {
        let value = e.target.value;

        // Apply uppercase and character restrictions for defaultPlugin field
        if (field === 'defaultPlugin') {
            value = value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
        }

        const updatedDataSource = dataSource.map((row) => {
            if (row.key === key) {
                return {
                    ...row,
                    [field]: value,
                    panel: row.panel.toString(),
                    otherPlugin: row.otherPlugin || []
                };
            }
            return row;
        });

        setDataSource(updatedDataSource);
        // Update mainForm with the formatted data
        setMainForm((prevData) => ({
            ...prevData,
            layout: updatedDataSource.map(({ key, ...item }) => ({
                ...item,
                panel: item.panel,
                type: item.type || 'fixed',
                defaultPlugin: item.defaultPlugin || '',
                defaultUrl: item.defaultUrl || '',
                otherPlugin: item.otherPlugin || []
            }))
        }));

        setFormChange(true);
    };

    const handleCancel = () => {
        setIsActivityVisible(false);
    };

    const handleModalOk = (record: any) => {
        const updatedRows = otherPluginRows.map(row => {
            if (row.key === editingRow) {
                return {
                    ...row,
                    activity: record.activity,
                    activityDescription: record.activityDescription
                };
            }
            return row;
        });
        setOtherPluginRows(updatedRows);
        setIsActivityVisible(false);
    };

    const handleInsert = () => {
        const newRow = {
            key: Date.now().toString(),
            activity: '',
            activityDescription: ''
        };
        setOtherPluginRows([...otherPluginRows, newRow]);
    };

    const handleAddBefore = () => {
        if (selectedRowKeys.length === 1) {
            const selectedKey = selectedRowKeys[0];
            const selectedIndex = otherPluginRows.findIndex(row => row.key === selectedKey);

            const newRow = {
                key: Date.now().toString(),
                activity: '',
                activityDescription: ''
            };

            const newRows = [
                ...otherPluginRows.slice(0, selectedIndex),
                newRow,
                ...otherPluginRows.slice(selectedIndex)
            ];

            setOtherPluginRows(newRows);
        }
    };

    const handleAddAfter = () => {
        if (selectedRowKeys.length === 1) {  // Only work with single selection
            const selectedKey = selectedRowKeys[0];
            const selectedIndex = otherPluginRows.findIndex(row => row.key === selectedKey);

            const newRow = {
                key: Date.now().toString(),
                activity: '',
                activityDescription: ''
            };

            const newRows = [
                ...otherPluginRows.slice(0, selectedIndex + 1),
                newRow,
                ...otherPluginRows.slice(selectedIndex + 1)
            ];

            setOtherPluginRows(newRows);
        }
    };

    const handleRemoveSelected = () => {
        setSelectedRowKeys([]);
        setOtherPluginRows(otherPluginRows.filter(row => !selectedRowKeys.includes(row.key)));
    };

    const handleRemoveAll = () => {
        setOtherPluginRows([]);
    };

    const showDefaultPluginModal = async (key: string, text: string) => {
        setDefaultPluginEditingKey(key);
        let oItemList;
        try {
            if (text) {
                oItemList = await fetchAllUIActivities(text);
                if (oItemList.message) {
                    setPluginData([]);
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
                setPluginData(processedData);
            } else {
                setPluginData([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsDefaultPluginModalVisible(true);
    };

    const handleDefaultPluginModalOk = (record: any) => {
        const updatedDataSource = dataSource.map((row) => {
            if (row.key === defaultPluginEditingKey) {
                return {
                    ...row,
                    defaultPlugin: record.activityId,
                    defaultUrl: record.url
                };
            }
            return row;
        });

        setDataSource(updatedDataSource);
        setMainForm((prevData) => ({
            ...prevData,
            layout: updatedDataSource.map(({ key, ...item }) => ({
                ...item,
                panel: item.panel,
                type: item.type || 'fixed',
                defaultPlugin: item.defaultPlugin || '',
                defaultUrl: item.defaultUrl || '',
                otherPlugin: item.otherPlugin || []
            }))
        }));

        setIsDefaultPluginModalVisible(false);
        setFormChange(true);
    };

    const handleOtherPluginModalOpen = (record: any) => {
        setCurrentEditingPanelKey(record.key);
        const currentPlugins = record.otherPlugin || [];
        const mappedRows = currentPlugins.map((plugin: any, index: number) => ({
            key: index.toString(),
            activity: plugin.activity || '',
            activityDescription: plugin.activityDescription || ''
        }));
        setOtherPluginRows(mappedRows);
        setTempOtherPluginRows(mappedRows);
        setIsOtherPluginModalVisible(true);
    };

    const handleOtherPluginModalCancel = () => {
        setOtherPluginRows(tempOtherPluginRows);
        setIsOtherPluginModalVisible(false);
        setSelectedRowKeys([]);
    };

    const handleActivitySelection = async (recordKey: string, text: string) => {
        setEditingRow(recordKey);
        let oItemList;
        try {
            if (text) {
                oItemList = await fetchAllUIActivities(text);
                if (oItemList.message) {
                    setActivityData([]);
                }
            }
            else {
                oItemList = await fetchTop50UIActivities();
            }

            if (oItemList) {
                const processedData = oItemList?.map((item) => ({
                    ...item,
                    key: uuidv4(),
                    activity: item.activityId,
                    activityDescription: item.description
                }));
                setActivityData(processedData);
            } else {
                setActivityData([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsActivityVisible(true);
    };

    const modalColumns = [
        {
            title: t('activity'),
            dataIndex: 'activity',
            key: 'activity',
            render: (text: string, record: any) => (
                <Input
                    value={text}
                    onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
                        const newRows = otherPluginRows.map(row =>
                            row.key === record.key
                                ? { 
                                    ...row, 
                                    activity: value,
                                    activityDescription: value ? row.activityDescription : ''
                                  }
                                : row
                        );
                        setOtherPluginRows(newRows);
                    }}
                    suffix={
                        <GrChapterAdd
                            onClick={() => handleActivitySelection(record.key, text)}
                        />
                    }
                    placeholder="Select activity"
                    style={{ textAlign: 'center' }}
                />
            )
        },
        {
            title: t('activityDescription'),
            dataIndex: 'activityDescription',
            key: 'activityDescription',
            render: (text: string, record: any) => (
                <Input
                    readOnly
                    value={text || ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        const newRows = otherPluginRows.map(row =>
                            row.key === record.key
                                ? { ...row, activityDescription: value }
                                : row
                        );
                        setOtherPluginRows(newRows);
                    }}
                    placeholder="Enter activity Activity Description"
                />
            )
        },
    ];

    const columns: ColumnsType<LayoutPanel> = [
        {
            title: t('panel'),
            dataIndex: 'panel',
            key: 'panel',
            align: 'center',
            render: (text) => <span>{text}</span>,
        },
        {
            title: t('type'),
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            render: (text) => <span>{text}</span>,
        },
        {
            key: 'defaultPlugin',
            title: t('defaultPlugin'),
            dataIndex: 'defaultPlugin',
            width: 200,
            align: 'center',
            render: (text: string, record: LayoutPanel) => (
                record.type === 'popup' ? (
                    <span>-</span>
                ) : (
                    <Input
                        value={text}
                        onChange={(e) => handleInputChange(e, record.key, 'defaultPlugin')}
                        suffix={<GrChapterAdd onClick={() => showDefaultPluginModal(record.key, text)} />}
                        style={{ textAlign: 'center' }}
                    />
                )
            ),
        },
        {
            key: 'otherPlugin',
            title: t('otherPlugin'),
            dataIndex: 'otherPlugin',
            align: 'center',
            render: (plugins: any[], record: any) => (
                <Space style={{ justifyContent: 'center', width: '100%' }}>
                    <ScheduleTwoTone
                        onClick={() => handleOtherPluginModalOpen(record)}
                        style={{ cursor: 'pointer' }}
                    />
                    {plugins.length > 0 && <span>({plugins.length})</span>}
                </Space>
            )
        },
    ];

    const handleSaveOtherPlugins = () => {
        const updatedDataSource = dataSource.map(row => {
            if (row.key === currentEditingPanelKey) {
                return {
                    ...row,
                    otherPlugin: otherPluginRows
                        .filter(({ activity, activityDescription }) => activity || activityDescription)
                        .map(({ activity, activityDescription }) => ({
                            activity: activity || '',
                            activityDescription: activityDescription || ''
                        }))
                };
            }
            return row;
        });

        setDataSource(updatedDataSource);
        setMainForm(prev => ({
            ...prev,
            layout: updatedDataSource.map(({ key, ...item }) => ({
                ...item,
                panel: item.panel,
                type: item.type || 'fixed',
                defaultPlugin: item.defaultPlugin || '',
                defaultUrl: item.defaultUrl || '',
                otherPlugin: item.otherPlugin || []
            }))
        }));

        setIsOtherPluginModalVisible(false);
        setFormChange(true);
    };

    // Sample data
    // const pluginData: any[] = [
    //     {
    //         activity: 'WORK_LIST',
    //     },
    //     {
    //         activity: 'R_ASSY',
    //     },
    //     {
    //         activity: 'R_DCCOLLECT',
    //     }
    // ];

    const pluginDataColumn: ColumnsType<any> = [
        {
            title: t('activity'),
            dataIndex: 'activityId',
            key: 'activityId',
        },
    ];

    // const activityData: any[] = [
    //     {
    //         activity: 'WORK_LIST',
    //         activityDescription: 'Work List Plugin'
    //     },
    //     {
    //         activity: 'R_ASSY',
    //         activityDescription: 'Assembly Plugin'
    //     },
    //     {
    //         activity: 'R_DCCOLLECT',
    //         activityDescription: 'DC Plugin'
    //     }
    // ];

    const activityDataColumn: ColumnsType<any> = [
        {
            title: t('activity'),
            dataIndex: 'activity',
            key: 'activity',
        },
        {
            title: t('activityDescription'),
            dataIndex: 'activityDescription',
            key: 'activityDescription',
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Table columns={columns} dataSource={dataSource} pagination={false} />

            <Modal
                title={t("Default Plugin")}
                open={isDefaultPluginModalVisible}
                onCancel={() => setIsDefaultPluginModalVisible(false)}
                width={1000}
                footer={null}
            >
                <Table
                    dataSource={pluginData}
                    columns={pluginDataColumn}
                    rowKey="activityId"
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 300px)' }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleDefaultPluginModalOk(record),
                    })}
                />
            </Modal>

            <Modal
                title={t("activity")}
                open={isActivityVisible}
                onCancel={handleCancel}
                width={1000}
                footer={null}
            >
                <Table
                    dataSource={activityData}
                    columns={activityDataColumn}
                    pagination={false}
                    scroll={{ y: 'calc(100vh - 300px)' }}
                    rowKey="activity"
                    onRow={(record) => ({
                        onDoubleClick: () => handleModalOk(record),
                    })}
                />
            </Modal>

            <Modal
                title="Activities"
                open={isOtherPluginModalVisible}
                onCancel={handleOtherPluginModalCancel}
                footer={[
                    <Button key="cancel" onClick={handleOtherPluginModalCancel}>
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSaveOtherPlugins}>
                        Save
                    </Button>
                ]}
                width={800}
            >
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button
                        onClick={handleInsert}
                        style={{ marginRight: 8 }}
                    >
                        {t('insert')}
                    </Button>
                    <Button
                        onClick={handleAddBefore}
                        style={{ marginRight: 8 }}
                        disabled={selectedRowKeys.length !== 1}  // Only enable when exactly one row is selected
                    >
                        {t('insertBefore')}
                    </Button>
                    <Button
                        onClick={handleAddAfter}
                        style={{ marginRight: 8 }}
                        disabled={selectedRowKeys.length !== 1}  // Only enable when exactly one row is selected
                    >
                        {t('insertAfter')}
                    </Button>
                    <Button
                        onClick={handleRemoveSelected}
                        style={{ marginRight: 8 }}
                        disabled={selectedRowKeys.length === 0}
                    >
                        {t('removeSelected')}
                    </Button>
                    <Button
                        onClick={handleRemoveAll}
                        disabled={otherPluginRows.length === 0}
                    >
                        {t('removeAll')}
                    </Button>
                </div>

                <Table
                    columns={modalColumns}
                    dataSource={otherPluginRows}
                    pagination={false}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        columnWidth: 30,
                    }}
                    scroll={{ y: 'calc(100vh - 400px)' }}
                />
            </Modal>
        </div>
    );
};

export default LayoutTab;