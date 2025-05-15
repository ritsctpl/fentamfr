import React, { useState, useEffect, useContext } from 'react';
import { Table, Input,Space } from 'antd';
import { retrieveCustomDataList } from '@services/operationService';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { certificationMaintenanceContext } from '../hooks/certificationMaintenanceContext';

interface CommonData {
  sequence: string;
  customData: string;
  fieldLabel: string;
  required: boolean;
}

interface CustomDataState {
  customData: string;
  customField: string;
}

const CertificationCustomData: React.FC = () => {
  const {formData, setFormData} = useContext<any>(certificationMaintenanceContext)
  const [commonData, setCommonData] = useState<CommonData[]>([]);
  const [customData, setCustomData] = useState<CustomDataState[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCommonData = async () => {
      setLoading(true);
      try {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;

        const response = await retrieveCustomDataList(site, 'Certification', userId);
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

    const initialCustomData = commonData.map(item => ({
      customData: item.customData,
      customField: formData.customDataList?.find(
        (customItem: { customData: string }) => customItem.customData === item.customData
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
          ? { ...item, customField: value }
          : item
      );

      // Update formData with the correct structure
      setFormData(prevFormData => ({
        ...prevFormData,
        customDataList: updatedCustomData.map(item => ({
          key: item.customData,
          customData: item.customData,
          value: item.customField
        }))
      }));
      
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
      dataIndex: 'customField',
      key: 'customField',
      render: (text: string, record: CommonData) => {
        const customField = customData.find(
          item => item.customData === record.customData
        )?.customField || '';
        return (
          <Input
            value={customField}
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
      customField: userData ? userData.customField : '',
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
      />
    </div>
  );
};

export default CertificationCustomData;

