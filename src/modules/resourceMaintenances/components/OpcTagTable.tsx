'use client'
import React, { useState, useEffect, useContext } from 'react';
import { Table, Input, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { v4 as uuidv4 } from 'uuid';
import styles from '@modules/bom/styles/bomStyles.module.css';
import { useTranslation } from 'react-i18next';
import { ResourceContext } from '@modules/resourceMaintenances/hooks/ResourceContext';

interface DataType {
    key: string;
    tagName: string;
    tagUrl: string;
    identity: string;
}

const OpcTagTable: React.FC = () => {
    const { formData, setFormData } = useContext<any>(ResourceContext); 
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        if (formData?.opcTagList) {
            setDataSource(formData.opcTagList.map(row => ({
                ...row,
                key: row.key || uuidv4() 
            })));
        }
    }, [formData]);

    const handleInsert = () => {
        const newRow: DataType = {
            key: uuidv4(),
            tagName: '',
            tagUrl: '',
            identity: '',
        };
        const updatedDataSource = [...dataSource, newRow];
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            opcTagList: updatedDataSource
        }));
    };

    const handleRemoveSelected = () => {
        const filteredData = dataSource.filter((row) => !selectedRowKeys.includes(row.key));
        setDataSource(filteredData);
        setFormData((prevData) => ({
            ...prevData,
            opcTagList: filteredData
        }));
        setSelectedRowKeys([]);
    };

    const handleRemoveAll = () => {
        setDataSource([]);
        setFormData((prevData) => ({
            ...prevData,
            opcTagList: []
        }));
        setSelectedRowKeys([]);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: string,
        field: keyof DataType
    ) => {
        const value = e.target.value;
        const updatedDataSource = dataSource.map((row) =>
            row.key === key ? { ...row, [field]: value } : row
        );
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            opcTagList: updatedDataSource
        }));
    };

    const columns: ColumnsType<DataType> = [
        {
            title: t("tagName"),
            dataIndex: 'tagName',
            key: 'tagName',
            render: (text: string, record: DataType) => (
                <Input
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'tagName')}
                />
            ),
        },
        {
            title: t("tagUrl"),
            dataIndex: 'tagUrl',
            key: 'tagUrl',
            render: (text: string, record: DataType) => (
                <Input
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'tagUrl')}
                />
            ),
        },
        {
            title: t("identity"),
            dataIndex: 'identity',
            key: 'identity',
            render: (text: string, record: DataType) => (
                <Input
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'identity')}
                />
            ),
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
                //     showSizeChanger: true,
                //     pageSizeOptions: ['5', '10', '20', '50'],
                // }}
                pagination={false}
                scroll={{ y: 'calc(100vh - 445px)' }}
            />
        </div>
    );
};

export default OpcTagTable;
