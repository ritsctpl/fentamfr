import React, { useContext, useState, useEffect } from 'react';
import { Table, Input, TimePicker } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { CycleTimeUseContext } from '../hooks/CycleTimeUseContext';
import dayjs from 'dayjs';
import { parseCookies } from 'nookies';

interface TableRow {
    key: number;
    resource: string;
    resourceType: string;
    operation: string;
    operationVersion: string;
    item: string;
    itemVersion: string;
    targetQuantity: number;
    itemId: string;
    workCenter: string;
    time: string;
    cycleTime: any;
    productionTime: any;
    fromSelected: boolean;
}

interface ResourceDetailsProps {
    selected: any;
    setSelected: any;
}

const ResourceDetails: React.FC<ResourceDetailsProps> = ({ selected, setSelected }) => {
    
    const { formData, setFormData, setFormChange, formChange } = useContext<any>(CycleTimeUseContext)
    const [dataSource, setDataSource] = useState<TableRow[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        if (formData && formData.cycleTimeResponseList) {
            const updatedData = formData.cycleTimeResponseList.map((hook, index) => ({
                key: hook.key || index, // Ensure the key is unique
                ...hook,
                fromSelected: true
            }));
            setDataSource(updatedData);
            // setSelected(updatedData);
        }
    }, [formData, setFormData]);

    useEffect(() => {
        if (selected?.cycleTimeResponseList) {
            const updatedData = selected.cycleTimeResponseList.map((hook, index) => ({
                key: hook.key || index,
                ...hook,
                fromSelected: true,
            }));
            setDataSource(updatedData);
            // setSelected(updatedData);
        }
    }, [selected]); 
    
    const handleFieldChange = (value: any, index: number, key: keyof TableRow) => {
        const newData: any = [...dataSource];
        newData[index][key] = value;
        setDataSource(newData);
        // setSelected(newData);
        // Only update formData if the changed field is targetQuantity or time
        if (key === 'targetQuantity' || key === 'time') {
            setFormData(prevData => ({
                ...prevData,
                cycleTimeResponseList: newData.map((item: any) => ({
                    ...item,
                    targetQuantity: item.targetQuantity || 0,
                    time: item.time || '00:00:00',
                    cycleTime: item.cycleTime || 0,
                    productionTime: item.productionTime || 0
                }))
            }));
            setFormChange(true);
        }
    };

    const columns: ColumnsType<TableRow> = [
        {
            title: t('resource'),
            dataIndex: 'resource',
            key: 'resource',
            width: 150,
            render: (text: any) => text || '---'
        },
        {
            title: t('operation'),
            dataIndex: 'operation',
            key: 'operation',
            width: 150,
           render: (text: any) => text || '---'
        },
        // {
        //     title: t('operationVersion'),
        //     dataIndex: 'operationVersion',
        //     key: 'operationVersion',
        //     width: 150,
        //    render: (text: any) => text || '---'
        // }, 
        {
            title: t('workCenter'),
            dataIndex: 'workCenter',
            key: 'workCenter',
            width: 150,
            render: (text: any) => text || '---'
        },
        {
            title: t('item'),
            dataIndex: 'item',
            key: 'item',
            width: 150,
           render: (text: any) => text || '---'
        },
        // {
        //     title: t('itemVersion'),
        //     dataIndex: 'itemVersion',
        //     key: 'itemVersion',
        //     width: 150,
        //    render: (text: any) => text || '---'
        // },
        {
            title: t('targetQuantity'),
            dataIndex: 'targetQuantity',
            key: 'targetQuantity',
            width: 150,
            render: (text: number, record: TableRow) => (
                <Input
                    type="number"
                    value={text || ''}
                    placeholder="---"
                    onChange={(e) => {
                        const newValue = Number(e.target.value);
                        handleFieldChange(newValue, record.key, 'targetQuantity');
                        calculateCycleTime(record.time, newValue, record.key);
                    }}
                    disabled={false}
                />
            ),
        },
        {
            title: t('time'),
            dataIndex: 'time',
            key: 'time',
            width: 150,
            render: (text: string, record: TableRow) => (
                <TimePicker
                    value={text ? dayjs(text, 'HH:mm:ss') : null}
                    format="HH:mm:ss"
                    placeholder="---"
                    onChange={(newTime) => {
                        if (newTime) {
                            const timeString = newTime.format('HH:mm:ss');
                            handleFieldChange(timeString, record.key, 'time');
                            calculateCycleTime(timeString, record.targetQuantity, record.key);
                        }
                    }}
                    allowClear={false}
                    showNow={false}
                    disabled={false}
                />
            ),
        },
        {
            title: t('cycleTime'),
            dataIndex: 'cycleTime',
            key: 'cycleTime',
            width: 150,
            render: (text: number) => text ? Number(text).toFixed(4) : '---'
        },
        {
            title: t('productionTime'),
            dataIndex: 'productionTime',
            key: 'productionTime',
            width: 150,
            render: (text: number) => text || '---'
        },
    ];

    const calculateCycleTime = (time: string, targetQty: number, index: number) => {
        if (time && targetQty > 0) {
            const [hours = 0, minutes = 0, seconds = 0] = time.split(':').map(Number);
            const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
            const cycleTime = totalSeconds / targetQty;
            
            const newData = [...dataSource];
            newData[index].cycleTime = cycleTime;
            setDataSource(newData);
            // setSelected(newData);

            // Update formData
            setFormData(prevData => ({
                ...prevData,
                cycleTimeResponseList: newData,
            }));
            setFormChange(true);
        }
    };

    return (
        <>
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                scroll={{ 
                    y: 'calc(100vh - 400px)', 
                    x: '100%',
                    scrollToFirstRowOnChange: true 
                }}
            />
        </>
    );
};

export default ResourceDetails;
