'use client'
import React, { useState, useEffect, useContext } from 'react';
import { Table, Input, Button, Select, Modal, Checkbox } from 'antd'; // Add Select and Checkbox to imports
import type { ColumnsType } from 'antd/es/table';
import { v4 as uuidv4 } from 'uuid';
import styles from '@modules/bom/styles/bomStyles.module.css';
import { useTranslation } from 'react-i18next';
import { ListContext } from '../hooks/ListContext';
import { GrChapterAdd } from 'react-icons/gr';
import { parseCookies } from 'nookies';
import { getFieldNameByCategory } from '@services/listServices';
import { SearchOutlined } from '@ant-design/icons'; // Import SearchOutlined icon

interface StatusItem {
    status: string;
}

interface DetailType {
    statusList?: StatusItem[];
}

interface DataType {
    key: string;
    columnSequence: string;
    columnName: string;
    rowSortOrder: string;
    width: string;
    details: DetailType;
}

const OpcTagTable: React.FC = () => {
    const { formData, setFormData } = useContext<any>(ListContext);
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [operationVisible, setOperationVisible] = useState(false);
    const [operationData, setOperationData] = useState<any[]>([]);
    const [selectedRowKey, setSelectedRowKey] = useState<string>('');
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [currentDetailRow, setCurrentDetailRow] = useState<DataType | null>(null);
    const [selectAll, setSelectAll] = useState(false);
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [filteredOperationData, setFilteredOperationData] = useState<any[]>([]);

    useEffect(() => {
        if (formData?.columnList) {
            setDataSource(formData.columnList.map(row => ({
                ...row,
                key: row.key || uuidv4() // Ensures existing rows maintain their keys
            })));
        }
    }, [formData]);

    const handleInsert = () => {
        let lastSequence = 0;
        if (dataSource.length > 0) {
            const sequences = dataSource.map(row => parseInt(row.columnSequence, 10)).filter(seq => !isNaN(seq));
            if (sequences.length > 0) {
                lastSequence = Math.max(...sequences);
            }
        }

        const newSequence = lastSequence + 10;
        const newRow: DataType = {
            key: uuidv4(),
            columnSequence: newSequence.toString(),
            columnName: '',
            rowSortOrder: '',
            width: '',
            details: {
                statusList: []
            },
        };
        const updatedDataSource = [...dataSource, newRow];
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            columnList: updatedDataSource
        }));
    };

    const handleRemoveSelected = () => {
        const filteredData = dataSource.filter((row) => !selectedRowKeys.includes(row.key));
        setDataSource(filteredData);
        setFormData((prevData) => ({
            ...prevData,
            columnList: filteredData
        }));
        setSelectedRowKeys([]);
    };

    const handleRemoveAll = () => {
        setDataSource([]);
        setFormData((prevData) => ({
            ...prevData,
            columnList: []
        }));
        setSelectedRowKeys([]);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: string,
        field: keyof DataType
    ) => {
        const value = e.target.value;
        if(field === 'columnName'){
            setSearchText(value);
            const filtered = operationData.filter(item =>
                item.fieldName.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredOperationData(filtered);
        }
        const updatedDataSource = dataSource.map((row) =>
            row.key === key ? { ...row, [field]: value } : row
        );
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            columnList: updatedDataSource
        }));
        
    };

    const handleSelectChange = (
        value: string,
        key: string,
        field: keyof DataType
    ) => {
        const updatedDataSource = dataSource.map((row) =>
            row.key === key ? { ...row, [field]: value } : row
        );
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            columnList: updatedDataSource
        }));
    };

    // const handleMultiSelectChange = (
    //     values: string[],
    //     key: string,
    //     field: keyof DataType
    // ) => {
    //     const updatedDataSource = dataSource.map((row) =>
    //         row.key === key ? { ...row, [field]: values } : row
    //     );
    //     setDataSource(updatedDataSource);
    //     setFormData((prevData) => ({
    //         ...prevData,
    //         columnList: updatedDataSource
    //     }));
    // };

    const handleOperationClick = async (key: string) => {
        setSelectedRowKey(key);
        const cookies = parseCookies();
        const site = cookies.site;
        const typedValue = dataSource.find(row => row.key === key)?.columnName || '';
        
        try {
            let response;
            if (typedValue) {
                response = await getFieldNameByCategory(site, formData.category);
                    const filtered = response.filter(item =>
                        item.fieldName.toLowerCase().includes(searchText.toLowerCase())
                    );
                response = filtered
            } else {
                response = await getFieldNameByCategory(site,formData.category);
            }
            if (response && !response.errorCode) {
                const formattedData = response.map((item: any, index: number) => ({
                    id: index,
                    fieldName: item.fieldName,
                }));
                setOperationData(formattedData);
                setFilteredOperationData(formattedData); 
            } else {
                setOperationData([]);
                setFilteredOperationData([]);
            }
        } catch (error) {
            console.error('Error', error);
            // message.error('Failed to fetch operation data');
        }

        setOperationVisible(true);
    };

    const handleOperationOk = (selectedRow: any) => {
        if (selectedRow) {
            const updatedDataSource = dataSource.map(row =>
                row.key === selectedRowKey ? { ...row, columnName: selectedRow.fieldName } : row
            );
            setDataSource(updatedDataSource);
            setFormData((prevData) => ({
                ...prevData,
                columnList: updatedDataSource
            }));
        }
        setOperationVisible(false);
    };

    const handleCancel = () => {
        setOperationVisible(false);
    };

    const handleDetailsClick = (record: DataType) => {
        setCurrentDetailRow(record);
        const selectedStatuses = record.details?.statusList?.map(item => item.status) || [];
        setSelectAll(selectedStatuses.length === 4); // Assuming there are 4 options
        setDetailsModalVisible(true);
    };

    const handleDetailsOk = () => {
        if (currentDetailRow) {
            const updatedDataSource = dataSource.map(row =>
                row.key === currentDetailRow.key ? { ...row, details: currentDetailRow.details } : row
            );
            setDataSource(updatedDataSource);
            setFormData((prevData) => ({
                ...prevData,
                columnList: updatedDataSource
            }));
        }
        setDetailsModalVisible(false);
    };

    const handleDetailsCancel = () => {
        setDetailsModalVisible(false);
    };

    const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (currentDetailRow) {
            const allOptions = ['Active', 'Hold', 'In Queue', 'New'];
            setCurrentDetailRow({
                ...currentDetailRow,
                details: {
                    statusList: checked ? allOptions.map(status => ({ status })) : []
                }
            });
        }
    };

    const handleCheckboxChange = (checkedValues: string[]) => {
        if (currentDetailRow) {
            setCurrentDetailRow({
                ...currentDetailRow,
                details: {
                    statusList: checkedValues.map(status => ({ status }))
                }
            });
            setSelectAll(checkedValues.length === 4); // Assuming there are 4 options
        }
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        const filtered = operationData.filter(item =>
            item.fieldName.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOperationData(filtered);
    };

    const operationColumns = [
        {
            title: t("fieldName"),
            dataIndex: "fieldName",
            key: "fieldName",
        },
    ];

    const columns: ColumnsType<DataType> = [
        {
            title: t("columnSequence"),
            dataIndex: 'columnSequence',
            key: 'columnSequence',
            render: (text: string, record: DataType) => (
                <Input
                    value={record.columnSequence}
                    onChange={(e) => handleInputChange(e, record.key, 'columnSequence')}
                />
            ),
        },
        {
            title: t("columnName"),
            dataIndex: 'columnName',
            key: 'columnName',
            render: (text: string, record: DataType) => (
                <Input
                    value={record.columnName}
                    onChange={(e) => handleInputChange(e, record.key, 'columnName')}
                    suffix={<GrChapterAdd onClick={() => handleOperationClick(record.key)} />}
                />
            ),
        },
        {
            title: t("rowSortOrder"),
            dataIndex: 'rowSortOrder',
            key: 'rowSortOrder',
            render: (text: string, record: DataType) => (
                <Select
                    value={record.rowSortOrder||"1"}
                    onChange={(value) => handleSelectChange(value, record.key, 'rowSortOrder')}
                    style={{ width: '100%' }}
                >
                    <Select.Option value="1">{t('ascending')}</Select.Option>
                    <Select.Option value="0">{t('descending')}</Select.Option>
                </Select>
            ),
        },
        {
            title: t("width"),
            dataIndex: 'width',
            key: 'width',
            render: (text: string, record: DataType) => (
                <Input
                    value={record.width}
                    onChange={(e) => handleInputChange(e, record.key, 'width')}
                />
            ),
        },
        {
            title: t("details"),
            dataIndex: 'details',
            key: 'details',
            render: (text: string[], record: DataType) => {
                if (record.columnName === 'Pcu' || record.columnName === 'Status') {
                    return (
                        <Button onClick={() => handleDetailsClick(record)}>
                            {t('ShowDetails')}
                        </Button>
                    );
                }
                return <></>;
            },
        },
    ];

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
                // pagination={{
                //     pageSize: 5,
                //     pageSizeOptions: ['5', '10', '20', '50'],
                // }}
                pagination={false}
                scroll={{ y: 'calc(100vh - 480px)' }}
            />
            <Modal
                title={t("selectOperation")}
                open={operationVisible}
                onCancel={handleCancel}
                width={400}
                footer={null}
            >
                <Input
                    placeholder={t("searchFieldName")}
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Table
                    columns={operationColumns}
                    dataSource={filteredOperationData}
                    rowKey="id"
                    pagination={{ pageSize: 6 }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleOperationOk(record),
                    })}
                />
            </Modal>
            <Modal
                title={t("ShowDetails")}
                open={detailsModalVisible}
                onOk={handleDetailsOk}
                onCancel={handleDetailsCancel}
            >
                <Checkbox
                    checked={selectAll}
                    onChange={(e: any) => handleSelectAllChange(e)}
                    style={{ marginBottom: 16 }}
                >
                    {t('selectAll')}
                </Checkbox>
                <Checkbox.Group
                    options={[
                        { label: t('Active'), value: 'Active' },
                        { label: t('Hold'), value: 'Hold' },
                        { label: t('In Queue'), value: 'In Queue' },
                        { label: t('New'), value: 'New' },
                    ]}
                    value={currentDetailRow?.details?.statusList?.map(item => item.status) || []}
                    onChange={handleCheckboxChange}
                />
            </Modal>
        </div>
    );
};

export default OpcTagTable;