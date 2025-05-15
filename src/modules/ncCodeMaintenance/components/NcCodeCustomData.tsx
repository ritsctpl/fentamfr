import React, { useState, useEffect, useContext } from 'react';
import { Table, Input, message, Space } from 'antd';
import { retrieveCustomDataList } from '@services/operationService';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { NcCodeContext } from '@modules/ncCodeMaintenance/hooks/NcCodeUseContext';

interface CommonData {
  sequence: string;
  customData: string;
  fieldLabel: string;
  required: boolean;
}

interface CustomData {
    customData?: string;
    customField?: string;
}

const NcCodeCustomData: React.FC = () => {
  const {formData, setFormData} = useContext<any>(NcCodeContext)
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

        const response = await retrieveCustomDataList(site, 'NC Code', userId);
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
      customField: formData.customDataList?.find(customItem => customItem.customData === item.customData)?.customField || ''
    }));

    // Update state only if there is a real change
    setCustomData(prevCustomData => {
      if (JSON.stringify(prevCustomData) !== JSON.stringify(initialCustomData)) {
        return initialCustomData;
      }
      return prevCustomData;
    });
  }, [commonData, formData]);

  const handleValueChange = (customField: string, customDataKey: string) => {
    setCustomData(prevCustomData => {
      const updatedCustomData = prevCustomData.map(item =>
        item.customData === customDataKey
          ? { ...item, customField }
          : item
      );

      // Update formData with new customData values
      setFormData(prevFormData => ({
        ...prevFormData,
        customDataList: updatedCustomData
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
        const customField = customData.find(item => item.customData === record.customData)?.customField || '';
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
        {/* <Button onClick={() => message.info('Custom data refreshed')} type="primary">
          Refresh
        </Button> */}
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

export default NcCodeCustomData;

