import { DynamicBrowse } from "@components/BrowseComponent";
import React, { useEffect, useState } from "react";
import { Button, Table, Space } from "antd";
import { useBuyOff } from '../hooks/BuyOffContext';
import styles from '../styles/RoutingStep.module.css';

interface UserGroup {
    key: string;
    userGroup: string;
    selected: boolean;
}

const ByoffUserGroups = () => {
    const { selectedRowData, setSelectedRowData, setHasChanges } = useBuyOff();
    const [dataSource, setDataSource] = useState<UserGroup[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    useEffect(() => {
        if (selectedRowData?.userGroupList) {
            const formattedData = selectedRowData.userGroupList.map((group: any, index: number) => ({
                key: index.toString(),
                userGroup: group?.userGroup,
                selected: false
            }));
            setDataSource(formattedData);
        }
    }, [selectedRowData]);

    const columns = [
        {
            title: 'User Group',
            dataIndex: 'userGroup',
            key: 'userGroup',
            render: (_: any, record: UserGroup) => (
                        <DynamicBrowse
                            initial={record.userGroup}
                            uiConfig={{
                                label: "",
                                sorting: false,
                                selectEventApi: "retrieveTop50",
                                tabledataApi: "usergroup-service",
                                okButtonVisible: true,
                                selectEventCall: false,
                                multiSelect: false,
                                tableTitle: "User Groups",
                            }}
                            onSelectionChange={(selectedValue: any) => {
                                updateUserGroup(record.key, selectedValue[0].userGroup);
                                setHasChanges(true);
                            }}
                        />
            )
        },
    ];

    const updateUserGroup = (key: string, value: string) => {
        setSelectedRowData({
            ...selectedRowData,
            userGroupList: [...(selectedRowData.userGroupList || []), {userGroup: value}]
        });
    };

    const updateSelectedRowData = (newData: UserGroup[]) => {
        if (selectedRowData) {
            setSelectedRowData({
                ...selectedRowData,
                userGroupList: newData.map(item => item.userGroup).filter(Boolean)
            });
        }
    };

    const handleInsertNew = () => {
        const newKey = (dataSource.length + 1).toString();
        setDataSource([...dataSource, {
            key: newKey,
            userGroup: '',
            selected: false
        }]);
        setHasChanges(true);
    };

    const handleRemoveSelected = () => {
        const newData = dataSource.filter(item => !selectedKeys.includes(item.key));
        setDataSource(newData);
        setSelectedKeys([]);
        updateSelectedRowData(newData);
        setHasChanges(true);
    };

    const handleRemoveAll = () => {
        setDataSource([]);
        setSelectedKeys([]);
        updateSelectedRowData([]);
        setHasChanges(true);
    };

    return (
        <div className={styles.userGroupContainer}>
            <div className={styles.userGroupActions}>
                <Button 
                    // type="primary" 
                    type='primary'
                    className={styles.cancelButton}
                    onClick={handleInsertNew}
                    style={{ marginRight: 8 }}
                >
                    Insert New
                </Button>
                <Button 
                    // type="primary" 
                    type='primary'
                    className={styles.cancelButton}
                    onClick={handleRemoveSelected}
                    disabled={selectedKeys.length === 0}
                    style={{ marginRight: 8 ,}}
                >
                    Remove Selected
                </Button>
                <Button 
                    // type="primary" 
                    onClick={handleRemoveAll}
                    disabled={dataSource.length === 0}
                    className={styles.cancelButton}
                >
                    Remove All
                </Button>
            </div>
            <Table
                rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedKeys,
                    onChange: (selectedRowKeys) => {
                        setSelectedKeys(selectedRowKeys as string[]);
                    }
                }}
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                scroll={{ y: 280 }}
            />
        </div>
    );
};

export default ByoffUserGroups;