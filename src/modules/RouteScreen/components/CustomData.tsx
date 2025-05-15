import React, { useState, useEffect } from 'react';
import { Table, Input, Space } from 'antd';
import { retrieveCustomDataList } from '@services/operationService';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { useRoute } from '../hooks/routeContext';


interface CommonData {
    sequence: string;
    customData: string;
    fieldLabel: string;
    required: boolean;
}

interface CustomData {
    customData?: string;
    value?: string;
}

const CustomData: React.FC = () => {
    const { formData, setFormData } = useRoute();
    const [commonData, setCommonData] = useState<CommonData[]>([]);
    const [customData, setCustomData] = useState<CustomData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchCommonData = async () => {
            setLoading(true);
            try {
                const cookies = parseCookies();
                const site = cookies.site;
                const userId = cookies.rl_user_id;

                const response = await retrieveCustomDataList(site, 'Routing', userId);
                setCommonData(response);
            } catch (error) {
                console.error('Failed to fetch common data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommonData();
    }, []);

    useEffect(() => {
        if (commonData.length === 0) return;

        // Initialize customData based on commonData and formData
        const initialCustomData = commonData.map(item => ({
            customData: item.customData,
            value: formData?.customDataList?.find(customItem => 
                customItem.customData === item.customData
            )?.value || ''
        }));

        setCustomData(prevCustomData => {
            if (JSON.stringify(prevCustomData) !== JSON.stringify(initialCustomData)) {
                return initialCustomData;
            }
            return prevCustomData;
        });
    }, [commonData, formData]);

    const handleValueChange = (value: string, customDataKey: string) => {
        setCustomData(prevCustomData => {
            const updatedCustomData = prevCustomData.map(item =>
                item.customData === customDataKey
                    ? { ...item, value }
                    : item
            );

            if (formData) {
                const updatedRowData = {
                    ...formData,
                    customDataList: updatedCustomData
                };
                setFormData(updatedRowData);
            }

            return updatedCustomData;
        });
    };

    const customDataTableColumns = [
        {
            title: t('customData'),
            dataIndex: 'customData',
            key: 'customData',
            render: (text: string) => <span>{text}</span>,
        },
        {
            title: t('value'),
            dataIndex: 'value',
            key: 'value',
            render: (text: string, record: CommonData) => {
                const value = customData.find(item => item.customData === record.customData)?.value || '';
                return (
                    <Input
                        value={value}
                        onChange={(e) => handleValueChange(e.target.value, record.customData)}
                    />
                );
            },
        }
    ];

    const combinedData = commonData.map((commonItem) => {
        const userData = customData.find(item => item.customData === commonItem.customData);
        return {
            ...commonItem,
            value: userData ? userData.value : '',
        };
    });

    return (
        <div>
            <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }} />
            <Table
                bordered
                dataSource={combinedData}
                columns={customDataTableColumns}
                rowKey="customData"
                loading={loading}
            />
        </div>
    );
};

export default CustomData;