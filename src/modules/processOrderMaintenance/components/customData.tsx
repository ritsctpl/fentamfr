import React, { useState, useEffect, useContext } from 'react';
import { Table, Input, message, Space } from 'antd';
import { CustomData } from '@modules/processOrderMaintenance/types/processTypes';
import { retrieveCustomDataList } from '@services/operationService';
import { parseCookies } from 'nookies';
import { UserContext } from '@modules/processOrderMaintenance/hooks/userContext';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';

interface CommonData {
  sequence: string;
  customData: string;
  fieldLabel: string;
  required: boolean;
}

const CustomDataTable: React.FC = () => {
  const { formData, setFormData, setFormChange } = useContext(UserContext);
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

        const response = await retrieveCustomDataList(site, 'Process Order', userId);
        setCommonData(response);
      } catch (error) {
        message.error('Failed to load common data.');
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
      value: formData.customDataList?.find(customItem => customItem.customData === item.customData)?.value || ''
    }));

    // Update state only if there is a real change
    setCustomData(prevCustomData => {
      if (JSON.stringify(prevCustomData) !== JSON.stringify(initialCustomData)) {
        return initialCustomData;
      }
      return prevCustomData;
    });
  }, [commonData, formData]);

  const handleValueChange =  debounce((value: string, customDataKey: string) => {
    setCustomData(prevCustomData => {
      const updatedCustomData = prevCustomData.map(item =>
        item.customData === customDataKey
          ? { ...item, value }
          : item
      );

      setFormData(prevFormData => ({
        ...prevFormData,
        customDataList: updatedCustomData
      }));
      setFormChange(true)

      return updatedCustomData;
    });
  })

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
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'end' }}>
      </Space>
      <Table
        bordered
        dataSource={combinedData}
        columns={customDataTableColumns}
        rowKey="customData"
        loading={loading}
        pagination={false}
        scroll={{ y: 'calc(100vh - 440px)' }}
      />
    </div>
  );
};

export default CustomDataTable;
