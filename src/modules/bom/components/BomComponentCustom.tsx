import React, { useState, useEffect, useContext } from 'react';
import { Table, Input } from 'antd';
import { retrieveCustomDataList } from '@services/operationService';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { BomContext } from '@modules/bom/hooks/useContext';
import { ComponentCustomData } from '@modules/bom/types/bomTypes';

interface CommonData {
  sequence: string;
  customData: string;
  fieldLabel: string;
  required: boolean;
}

const BomComponentCustom: React.FC = () => {
  const { componentForm, setComponentForm } = useContext<any>(BomContext);
  const [commonData, setCommonData] = useState<CommonData[]>([]);
  const [customData, setCustomData] = useState<ComponentCustomData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCommonData = async () => {
      setLoading(true);
      try {
        const cookies = parseCookies();
        const site = cookies.site;
        const userId = cookies.rl_user_id;
 
        const response = await retrieveCustomDataList(site, 'BOM Component', userId);
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
      value: componentForm.componentCustomDataList?.find(customItem => customItem.customData === item.customData)?.value || ''
    }));

    setCustomData(prevCustomData => {
      if (JSON.stringify(prevCustomData) !== JSON.stringify(initialCustomData)) {
        return initialCustomData;
      }
      return prevCustomData;
    });
  }, [commonData, componentForm]);

  const handleValueChange = (value: string, customDataKey: string) => {
    setCustomData(prevCustomData => {
      const updatedCustomData = prevCustomData.map(item =>
        item.customData === customDataKey
          ? { ...item, value }
          : item
      );

      setComponentForm(prevFormData => ({
        ...prevFormData,
        componentCustomDataList: updatedCustomData
      }));

      return updatedCustomData;
    });
  };

  const BomCustomColumns = [
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
      <Table
        bordered
        dataSource={combinedData}
        columns={BomCustomColumns}
        rowKey="customData"
        loading={loading}
        pagination={false}
        scroll={{ y: 'calc(100vh - 440px)' }}
      />
    </div>
  );
};

export default BomComponentCustom;

