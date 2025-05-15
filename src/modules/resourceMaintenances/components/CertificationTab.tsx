'use client'
import React, { useState, useEffect, useContext } from 'react';
import { Table, Modal, Input, Button } from 'antd';
import { GrChapterAdd } from "react-icons/gr";
import type { ColumnsType } from 'antd/es/table';
import { parseCookies } from 'nookies';
import { v4 as uuidv4 } from 'uuid';
import styles from '@modules/bom/styles/bomStyles.module.css';
import { useTranslation } from 'react-i18next';
import { ResourceContext } from '@modules/resourceMaintenances/hooks/ResourceContext';
import { fetchTop50Certification, retrieveAllCertification } from '@services/ResourceService';

interface DataType {
    key: string;
    certificationBO: string;
    certificationDescription: string;
}

interface ModalDataType {
    certification: string;
    description: string;
}

const CertificationTab: React.FC = () => {
    const { formData, setFormData } = useContext<any>(ResourceContext); 
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [isActivity, setIsActivity] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [modalDataSample, setModalDataSample] = useState<ModalDataType[]>([]);
    const [activeRow, setActiveRow] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (formData?.certificationList) {
            setDataSource(formData.certificationList.map(row => ({
                ...row,
                key: row.key || uuidv4()
            })));
        }
    }, [formData]);

    const showAlternateModal = async (key: string, typedValue: string) => {
        setActiveRow(key);
        let oItemList;
        const cookies = parseCookies();
        const site = cookies.site;
        try {
            if (typedValue) {
                oItemList = await retrieveAllCertification(site, typedValue);
            } else {
                oItemList = await fetchTop50Certification(site);
            }
            if (oItemList) {
                const processedData = oItemList.map((item, index) => ({
                    ...item,
                    key: uuidv4(),
                }));
                setModalDataSample(processedData);
            } else {
                setModalDataSample([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setModalDataSample([]); 
        }
        setIsActivity(true);
    };

    const handleCancel = () => {
        setIsActivity(false);
        setActiveRow(null); 
    };

    const handleInsert = () => {
        const newRow: DataType = {
            key: uuidv4(),
            certificationBO: '',
            certificationDescription: '',
        };
        const updatedDataSource = [...dataSource, newRow];
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            certificationList: updatedDataSource
        }));
    };

    const handleRemoveSelected = () => {
        const filteredData = dataSource.filter((row) => !selectedRowKeys.includes(row.key));
        setDataSource(filteredData);
        setFormData((prevData) => ({
            ...prevData,
            certificationList: filteredData
        }));
        setSelectedRowKeys([]);
    };

    const handleRemoveAll = () => {
        setDataSource([]);
        setFormData((prevData) => ({
            ...prevData,
            certificationList: []
        }));
        setSelectedRowKeys([]);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: string,
        field: keyof DataType
    ) => {
        // Format the input value
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "");
        const updatedDataSource = dataSource.map((row) =>
            row.key === key ? { ...row, [field]: value } : row
        );
        setDataSource(updatedDataSource);
        setFormData((prevData) => ({
            ...prevData,
            certificationList: updatedDataSource
        }));
    };

    const columns: ColumnsType<DataType> = [
        {
            title: t('certification'),
            dataIndex: 'certificationBO',
            key: 'certificationBO',
            render: (text: string, record: DataType) => (
                <Input
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'certificationBO')}
                    suffix={<GrChapterAdd onClick={() => showAlternateModal(record.key, record.certificationBO)} />}
                />
            ),
        },
        {
            title: t('description'),
            dataIndex: 'certificationDescription',
            key: 'certificationDescription',
            render: (text: string, record: DataType) => (
                <Input
                    value={text}
                    onChange={(e) => handleInputChange(e, record.key, 'certificationDescription')}
                />
            ),
        },
    ];

    const modalColumns: ColumnsType<ModalDataType> = [
        { title: t("certification"), dataIndex: 'certification', key: 'certification' },
        { title: t("description"), dataIndex: 'description', key: 'description' },
    ];

    const handleModalOk = (record: ModalDataType) => {
        if (activeRow) {
            const updatedData = dataSource.map((row) => {
                if (row.key === activeRow) {
                    return {
                        ...row,
                        certificationBO: record.certification || '', 
                        certificationDescription: record.description || '',
                    };
                }
                return row;
            });
            setDataSource(updatedData);
            setFormData((prevData) => ({
                ...prevData,
                certificationList: updatedData,
            }));
        }
        handleCancel();
    };

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
                // pagination={{
                //     pageSize: 5,
                //     showSizeChanger: true,
                //     pageSizeOptions: ['5', '10', '20', '50'],
                // }}
            />

            <Modal
                title={t("selectActivity")}
                open={isActivity}
                onCancel={handleCancel}
                footer={null}
                width={1000}
            >
                <Table
                    columns={modalColumns}
                    dataSource={modalDataSample}
                    onRow={(record) => ({
                        onDoubleClick: () => handleModalOk(record),
                    })}
                    pagination={{ pageSize: 6 }}
                />
            </Modal>
        </div>
    );
};

export default CertificationTab;
